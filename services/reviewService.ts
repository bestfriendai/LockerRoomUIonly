import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Review, Comment } from '../types';

const REVIEWS_COLLECTION = 'reviews';
const COMMENTS_COLLECTION = 'comments';

export class ReviewService {
  // Create a new review
  static async createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const reviewRef = doc(collection(db, REVIEWS_COLLECTION));
      const review = {
        ...reviewData,
        id: reviewRef.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        likes: 0,
        comments: [],
        isAnonymous: reviewData.isAnonymous || false
      };
      
      await setDoc(reviewRef, review);
      return reviewRef.id;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Get review by ID
  static async getReviewById(reviewId: string): Promise<Review | null> {
    try {
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      const reviewSnap = await getDoc(reviewRef);
      
      if (reviewSnap.exists()) {
        return { id: reviewSnap.id, ...reviewSnap.data() } as Review;
      }
      return null;
    } catch (error) {
      console.error('Error getting review:', error);
      throw error;
    }
  }

  // Get all reviews with pagination
  static async getReviews(limitCount: number = 20, lastReviewId?: string): Promise<Review[]> {
    try {
      let q = query(
        collection(db, REVIEWS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  }

  // Get reviews by user ID
  static async getReviewsByUser(userId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
    } catch (error) {
      console.error('Error getting reviews by user:', error);
      throw error;
    }
  }

  // Get reviews about a specific user
  static async getReviewsAboutUser(targetUserId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('targetUserId', '==', targetUserId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
    } catch (error) {
      console.error('Error getting reviews about user:', error);
      throw error;
    }
  }

  // Update review
  static async updateReview(reviewId: string, updates: Partial<Review>): Promise<void> {
    try {
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      await updateDoc(reviewRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Delete review
  static async deleteReview(reviewId: string): Promise<void> {
    try {
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      await deleteDoc(reviewRef);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // Like/Unlike review
  static async toggleLike(reviewId: string, userId: string): Promise<void> {
    try {
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      const reviewSnap = await getDoc(reviewRef);
      
      if (reviewSnap.exists()) {
        const reviewData = reviewSnap.data();
        const likedBy = reviewData.likedBy || [];
        
        if (likedBy.includes(userId)) {
          // Unlike
          await updateDoc(reviewRef, {
            likes: increment(-1),
            likedBy: arrayRemove(userId)
          });
        } else {
          // Like
          await updateDoc(reviewRef, {
            likes: increment(1),
            likedBy: arrayUnion(userId)
          });
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
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
        createdAt: Timestamp.now()
      };
      
      await setDoc(commentRef, comment);
      
      // Update review's comment count
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      await updateDoc(reviewRef, {
        comments: arrayUnion(commentRef.id)
      });
      
      return commentRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
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
      console.error('Error getting comments:', error);
      
      // If it's an index error, try without ordering
      if (error instanceof Error && error.message.includes('index')) {
        console.log('Retrying without ordering due to missing index');
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
          
          // Sort manually by createdAt
          return comments.sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0;
            const bTime = b.createdAt?.toMillis() || 0;
            return aTime - bTime;
          });
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          return []; // Return empty array instead of throwing
        }
      }
      
      // For other errors, return empty array to prevent app crash
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
        comments: arrayRemove(commentId)
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Listen to reviews in real-time
  static subscribeToReviews(callback: (reviews: Review[]) => void): () => void {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      callback(reviews);
    }, (error) => {
      console.error('Error listening to reviews:', error);
      callback([]);
    });
  }

  // Search reviews by content
  static async searchReviews(searchTerm: string): Promise<Review[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - consider using Algolia or similar for production
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      const allReviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];

      // Filter reviews that contain the search term
      return allReviews.filter(review =>
        review.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching reviews:', error);
      throw error;
    }
  }
}

// Export individual functions for compatibility
export const createReview = ReviewService.createReview;
export const getReviewById = ReviewService.getReviewById;
export const getReviews = ReviewService.getReviews;
export const updateReview = ReviewService.updateReview;
export const deleteReview = ReviewService.deleteReview;
export const getReviewsByUser = ReviewService.getReviewsByUser;
export const toggleLike = ReviewService.toggleLike;
export const addComment = ReviewService.addComment;
export const getComments = ReviewService.getComments;
export const deleteComment = ReviewService.deleteComment;
export const subscribeToReviews = ReviewService.subscribeToReviews;
export const searchReviews = ReviewService.searchReviews;

// Export the service instance for backward compatibility
export const reviewService = ReviewService;