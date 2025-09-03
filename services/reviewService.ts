import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  serverTimestamp,
  increment,
  onSnapshot,
  QueryConstraint,
  writeBatch,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import logger from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { db } from '../utils/firebase';
import { Review, Comment, ReviewFilter } from '../types';
import { toMillis } from '../utils/timestampHelpers';
import { isUserAuthenticated, getCurrentUserId, createAuthError } from '../utils/authUtils';

const REVIEWS_COLLECTION = 'reviews';
const COMMENTS_COLLECTION = 'comments';

export class ReviewService {
  private static readonly DRAFT_KEY = '@review_draft';
  private static readonly CACHE_PREFIX = 'reviews_';
  private static readonly PAGE_SIZE = 20;
  private static listeners: Map<string, () => void> = new Map();

  // Create a new review with enhanced features
  static async createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Check network status
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection. Please try again later.');
      }

      // Validate review data
      this.validateReviewData(reviewData);

      const reviewRef = doc(collection(db, REVIEWS_COLLECTION));
      const review = {
        ...reviewData,
        id: reviewRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        dislikes: 0,
        reports: 0,
        views: 0,
        engagement: 0,
        comments: [],
        verified: false,
        flagged: false,
        deleted: false,
        isAnonymous: reviewData.isAnonymous || false,
        searchKeywords: this.generateSearchKeywords(reviewData),
      };
      
      await setDoc(reviewRef, review);
      
      // Clear draft after successful creation
      await this.clearDraft();
      
      // Update user stats
      if (reviewData.authorId) {
        await this.updateUserStats(reviewData.authorId, 'create');
      }
      
      // Invalidate cache
      await this.invalidateCache();
      
      return reviewRef.id;
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error creating review:', error);
      }
      throw error;
    }
  }

  // Get review by ID with caching
  static async getReviewById(reviewId: string): Promise<Review | null> {
    try {
      // Check cache first
      const cached = await this.getCachedData(`review_${reviewId}`);
      if (cached) return cached;

      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      const reviewSnap = await getDoc(reviewRef);
      
      if (reviewSnap.exists() && !reviewSnap.data().deleted) {
        const review = { id: reviewSnap.id, ...reviewSnap.data() } as Review;
        
        // Cache the result
        await this.cacheData(`review_${reviewId}`, review, 60000);
        
        // Try to increment view count (may fail if user doesn't have permission)
        try {
          await updateDoc(reviewRef, {
            views: increment(1),
          });
        } catch (updateError) {
          // Silently ignore permission errors for view count updates
          if (__DEV__) {
            __DEV__ && console.log('Could not update view count (expected for non-authors)');
          }
        }
        
        return review;
      }
      return null;
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error getting review:', error);
      }
      throw error;
    }
  }

  // Get reviews with pagination and filters
  static async getReviews(
    filters: ReviewFilter = {},
    lastDoc?: DocumentSnapshot,
    pageSize: number = this.PAGE_SIZE
  ): Promise<{ reviews: Review[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
    try {
      // Check authentication first
      if (!isUserAuthenticated()) {
        if (__DEV__) {
          console.log('User not authenticated, returning empty reviews');
        }
        return { reviews: [], lastDoc: null, hasMore: false };
      }

      // Build cache key
      const cacheKey = this.buildCacheKey(filters, lastDoc);

      // Check cache for first page
      if (!lastDoc) {
        const cached = await this.getCachedData(cacheKey);
        if (cached) return cached;
      }

      // Build query constraints
      const constraints: QueryConstraint[] = [];
      
      // Add filters
      if (filters.category) {
        constraints.push(where('category', '==', filters.category));
      }
      
      if (filters.rating) {
        constraints.push(where('rating', '==', filters.rating));
      }
      
      if (filters.platform) {
        constraints.push(where('platform', '==', filters.platform));
      }
      
      if (filters.location) {
        constraints.push(where('location', '==', filters.location));
      }
      
      if (filters.authorId) {
        constraints.push(where('authorId', '==', filters.authorId));
      }
      
      if (filters.verified !== undefined) {
        constraints.push(where('verified', '==', filters.verified));
      }

      // Exclude deleted reviews
      constraints.push(where('deleted', '!=', true));
      
      // Add sorting
      const sortField = filters.sortBy || 'createdAt';
      const sortDirection = filters.sortDirection || 'desc';
      constraints.push(orderBy(sortField, sortDirection));
      
      // Add pagination
      constraints.push(limit(pageSize + 1));
      
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      // Execute query
      const q = query(collection(db, REVIEWS_COLLECTION), ...constraints);
      const snapshot = await getDocs(q);
      
      const reviews = snapshot.docs.slice(0, pageSize).map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Review));
      
      const hasMore = snapshot.docs.length > pageSize;
      const newLastDoc = snapshot.docs[pageSize - 1] || null;

      const result = { reviews, lastDoc: newLastDoc, hasMore };

      // Cache first page results
      if (!lastDoc) {
        await this.cacheData(cacheKey, result, 30000);
      }

      return result;
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error getting reviews:', error);
      }
      return { reviews: [], lastDoc: null, hasMore: false };
    }
  }

  // Get reviews by user ID
  static async getReviewsByUser(userId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('authorId', '==', userId),
        where('deleted', '!=', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error getting reviews by user:', error);
      }
      throw error;
    }
  }

  // Get reviews about a specific user
  static async getReviewsAboutUser(targetUserId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('targetUserId', '==', targetUserId),
        where('deleted', '!=', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error getting reviews about user:', error);
      }
      throw error;
    }
  }

  // Get trending reviews
  static async getTrendingReviews(limitCount: number = 10): Promise<Review[]> {
    try {
      const cached = await this.getCachedData('trending_reviews');
      if (cached) return cached;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('deleted', '!=', true),
        where('createdAt', '>=', Timestamp.fromDate(yesterday)),
        orderBy('engagement', 'desc'),
        orderBy('views', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        trending: true,
      } as Review));

      await this.cacheData('trending_reviews', reviews, 300000);
      return reviews;
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error getting trending reviews:', error);
      }
      return [];
    }
  }

  // Update review
  static async updateReview(reviewId: string, updates: Partial<Review>): Promise<void> {
    try {
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      
      // Check if review exists
      const reviewDoc = await getDoc(reviewRef);
      if (!reviewDoc.exists()) {
        throw new Error('Review not found');
      }

      await updateDoc(reviewRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        searchKeywords: updates.title || updates.content 
          ? this.generateSearchKeywords({ ...reviewDoc.data(), ...updates })
          : undefined,
      });
      
      await this.invalidateCache();
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error updating review:', error);
      }
      throw error;
    }
  }

  // Delete review (soft delete)
  static async deleteReview(reviewId: string, userId?: string): Promise<void> {
    try {
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      
      // Verify ownership if userId provided
      if (userId) {
        const reviewDoc = await getDoc(reviewRef);
        if (!reviewDoc.exists()) {
          throw new Error('Review not found');
        }
        
        if (reviewDoc.data().authorId !== userId) {
          throw new Error('Unauthorized to delete this review');
        }
      }

      // Soft delete
      await updateDoc(reviewRef, {
        deleted: true,
        deletedAt: serverTimestamp(),
        content: '[Deleted]',
        media: [],
      });
      
      // Update user stats
      if (userId) {
        await this.updateUserStats(userId, 'delete');
      }
      
      await this.invalidateCache();
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error deleting review:', error);
      }
      throw error;
    }
  }

  // Like/Unlike review
  static async toggleLike(reviewId: string, userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      const likeRef = doc(db, `${REVIEWS_COLLECTION}/${reviewId}/likes`, userId);

      // Check if already liked
      const likeDoc = await getDoc(likeRef);
      
      if (likeDoc.exists()) {
        // Unlike
        batch.delete(likeRef);
        batch.update(reviewRef, {
          likes: increment(-1),
          engagement: increment(-2),
          likedBy: arrayRemove(userId)
        });
      } else {
        // Like
        batch.set(likeRef, {
          userId,
          createdAt: serverTimestamp(),
        });
        batch.update(reviewRef, {
          likes: increment(1),
          engagement: increment(2),
          likedBy: arrayUnion(userId)
        });
      }

      await batch.commit();
      await this.invalidateCache();
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error toggling like:', error);
      }
      throw error;
    }
  }

  // Add comment to review
  static async addComment(reviewId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<string> {
    try {
      const commentRef = doc(collection(db, COMMENTS_COLLECTION));
      const comment = {
        ...commentData,
        id: commentRef.id,
        reviewId,
        createdAt: serverTimestamp()
      };
      
      await setDoc(commentRef, comment);
      
      // Update review's comment count and engagement
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      await updateDoc(reviewRef, {
        comments: arrayUnion(commentRef.id),
        engagement: increment(3)
      });
      
      return commentRef.id;
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error adding comment:', error);
      }
      throw error;
    }
  }

  // Get comments for a review
  static async getComments(reviewId: string): Promise<Comment[]> {
    try {
      const q = query(
        collection(db, COMMENTS_COLLECTION),
        where('reviewId', '==', reviewId),
        orderBy('createdAt', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error getting comments:', error);
      }
      
      // Fallback for missing index
      if (error instanceof Error && error.message.includes('index')) {
        try {
          const fallbackQuery = query(
            collection(db, COMMENTS_COLLECTION),
            where('reviewId', '==', reviewId)
          );
          const fallbackSnapshot = await getDocs(fallbackQuery);
          const comments = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Comment[];
          
          // Sort manually
          return comments.sort((a, b) => {
            const aTime = toMillis(a.createdAt) || 0;
            const bTime = toMillis(b.createdAt) || 0;
            return aTime - bTime;
          });
        } catch {
          return [];
        }
      }
      
      return [];
    }
  }

  // Delete comment
  static async deleteComment(commentId: string, reviewId: string): Promise<void> {
    try {
      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      await deleteDoc(commentRef);
      
      // Update review's comment array
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      await updateDoc(reviewRef, {
        comments: arrayRemove(commentId),
        engagement: increment(-3)
      });
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error deleting comment:', error);
      }
      throw error;
    }
  }

  // Report a review
  static async reportReview(
    reviewId: string,
    userId: string,
    reason: string,
    details?: string
  ): Promise<void> {
    try {
      const reportRef = collection(db, 'reports');
      await addDoc(reportRef, {
        type: 'review',
        targetId: reviewId,
        reporterId: userId,
        reason,
        details,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // Update review
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      await updateDoc(reviewRef, {
        reports: increment(1),
        lastReportedAt: serverTimestamp(),
      });
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error reporting review:', error);
      }
      throw error;
    }
  }

  // Search reviews with enhanced search
  static async searchReviews(searchTerm: string, filters: ReviewFilter = {}): Promise<Review[]> {
    try {
      // Check authentication first
      if (!isUserAuthenticated()) {
        if (__DEV__) {
          console.log('User not authenticated, returning empty search results');
        }
        return [];
      }

      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      const searchLower = searchTerm.toLowerCase();
      const searchKeywords = searchLower.split(' ').filter(k => k.length > 1);

      // Query by searchKeywords array
      const constraints: QueryConstraint[] = [
        where('searchKeywords', 'array-contains-any', searchKeywords),
        where('deleted', '!=', true),
        limit(50),
      ];

      if (filters.category) {
        constraints.push(where('category', '==', filters.category));
      }

      const q = query(collection(db, REVIEWS_COLLECTION), ...constraints);
      const snapshot = await getDocs(q);

      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Review));

      // Further filter in memory for better accuracy
      return reviews.filter(review => {
        const text = `${review.title} ${review.content} ${review.targetName}`.toLowerCase();
        return searchKeywords.some(keyword => text.includes(keyword));
      });
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error searching reviews:', error);
      }
      return [];
    }
  }

  // Listen to reviews in real-time
  static subscribeToReviews(callback: (reviews: Review[]) => void): () => void {
    // Check authentication first
    if (!isUserAuthenticated()) {
      if (__DEV__) {
        console.log('User not authenticated, returning empty subscription');
      }
      callback([]);
      return () => {}; // Return empty unsubscribe function
    }

    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('deleted', '!=', true),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      callback(reviews);
    }, (error) => {
      if (__DEV__) {
        __DEV__ && console.error('Error listening to reviews:', error);
      }
      callback([]);
    });

    this.listeners.set('reviews_subscription', unsubscribe);
    return unsubscribe;
  }

  // Save draft
  static async saveDraft(draft: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.DRAFT_KEY, JSON.stringify({
        ...draft,
        savedAt: new Date().toISOString(),
      }));
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error saving draft:', error);
      }
    }
  }

  // Get draft
  static async getDraft(): Promise<any | null> {
    try {
      const draft = await AsyncStorage.getItem(this.DRAFT_KEY);
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error getting draft:', error);
      }
      return null;
    }
  }

  // Clear draft
  static async clearDraft(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.DRAFT_KEY);
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error clearing draft:', error);
      }
    }
  }

  // Helper: Validate review data
  private static validateReviewData(data: any): void {
    if (!data.title || data.title.length < 5) {
      throw new Error('Title must be at least 5 characters');
    }
    
    if (!data.content || data.content.length < 10) {
      throw new Error('Review must be at least 10 characters');
    }
    
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    if (!data.category) {
      throw new Error('Category is required');
    }
    
    if (!data.targetName) {
      throw new Error('Target name is required');
    }
  }

  // Helper: Generate search keywords
  private static generateSearchKeywords(data: any): string[] {
    const text = `${data.title || ''} ${data.content || ''} ${data.targetName || ''} ${data.category || ''}`.toLowerCase();
    const words = text.split(/\s+/).filter(word => word.length > 2);
    const unique = [...new Set(words)];
    return unique.slice(0, 20);
  }

  // Helper: Update user stats
  private static async updateUserStats(userId: string, action: 'create' | 'delete'): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const incrementValue = action === 'create' ? 1 : -1;
      
      await updateDoc(userRef, {
        reviewCount: increment(incrementValue),
        lastReviewAt: action === 'create' ? serverTimestamp() : undefined,
      });
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error updating user stats:', error);
      }
    }
  }

  // Helper: Build cache key
  private static buildCacheKey(filters: ReviewFilter, lastDoc?: DocumentSnapshot): string {
    const filterKey = JSON.stringify(filters);
    const pageKey = lastDoc ? lastDoc.id : 'first';
    return `${this.CACHE_PREFIX}${filterKey}_${pageKey}`;
  }

  // Helper: Cache data
  private static async cacheData(key: string, data: any, ttl: number = 300000): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl,
      }));
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error caching data:', error);
      }
    }
  }

  // Helper: Get cached data
  private static async getCachedData(key: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;
      
      const { data, timestamp, ttl } = JSON.parse(cached);
      
      if (Date.now() - timestamp > ttl) {
        await AsyncStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error getting cached data:', error);
      }
      return null;
    }
  }

  // Helper: Invalidate cache
  private static async invalidateCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const reviewKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      if (reviewKeys.length > 0) {
        await AsyncStorage.multiRemove(reviewKeys);
      }
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error invalidating cache:', error);
      }
    }
  }

  // Cleanup listeners
  static cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

// Export individual functions for compatibility
export const createReview = ReviewService.createReview.bind(ReviewService);
export const getReviewById = ReviewService.getReviewById.bind(ReviewService);
export const getReviews = ReviewService.getReviews.bind(ReviewService);
export const updateReview = ReviewService.updateReview.bind(ReviewService);
export const deleteReview = ReviewService.deleteReview.bind(ReviewService);
export const getReviewsByUser = ReviewService.getReviewsByUser.bind(ReviewService);
export const toggleLike = ReviewService.toggleLike.bind(ReviewService);
export const addComment = ReviewService.addComment.bind(ReviewService);
export const getComments = ReviewService.getComments.bind(ReviewService);
export const deleteComment = ReviewService.deleteComment.bind(ReviewService);
export const subscribeToReviews = ReviewService.subscribeToReviews.bind(ReviewService);
export const searchReviews = ReviewService.searchReviews.bind(ReviewService);
export const saveDraft = ReviewService.saveDraft.bind(ReviewService);
export const getDraft = ReviewService.getDraft.bind(ReviewService);
export const clearDraft = ReviewService.clearDraft.bind(ReviewService);

// Export the service for backward compatibility
export const reviewService = ReviewService;