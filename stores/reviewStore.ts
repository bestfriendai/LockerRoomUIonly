import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Review, ReviewFilter, DocumentSnapshot } from '../types';
import { reviewService } from '../services/reviewService';
import logger from '../utils/logger';

interface ReviewState {
  // Data
  reviews: Review[];
  trendingReviews: Review[];
  nearbyReviews: Review[];
  userReviews: Map<string, Review[]>;
  
  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  
  // Pagination
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
  
  // Filters
  filters: ReviewFilter;
  searchQuery: string;
  
  // Cache
  lastFetchTime: number;
  cacheValid: boolean;
}

interface ReviewActions {
  // Fetch operations
  fetchReviews: (reset?: boolean) => Promise<void>;
  loadMoreReviews: () => Promise<void>;
  refreshReviews: () => Promise<void>;
  
  // Specific fetches
  fetchTrendingReviews: () => Promise<void>;
  fetchUserReviews: (userId: string) => Promise<void>;
  
  // Search
  searchReviews: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  // Filters
  setFilter: (filter: Partial<ReviewFilter>) => void;
  clearFilters: () => void;
  
  // CRUD operations
  addReview: (review: Review) => void;
  updateReview: (reviewId: string, updates: Partial<Review>) => void;
  deleteReview: (reviewId: string) => void;
  
  // Interactions
  likeReview: (reviewId: string, userId: string) => Promise<void>;
  reportReview: (reviewId: string, userId: string, reason: string) => Promise<void>;
  
  // Cache management
  invalidateCache: () => void;
  clearAll: () => void;
}

const initialFilters: ReviewFilter = {
  category: null,
  rating: null,
  platform: null,
  location: null,
  verified: null,
  sortBy: 'createdAt',
  sortDirection: 'desc',
};

export const useReviewStore = create<ReviewState & ReviewActions>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({
          // Initial state
          reviews: [],
          trendingReviews: [],
          nearbyReviews: [],
          userReviews: new Map(),
          isLoading: false,
          isRefreshing: false,
          error: null,
          lastDoc: null,
          hasMore: true,
          filters: initialFilters,
          searchQuery: '',
          lastFetchTime: 0,
          cacheValid: false,

          // Fetch reviews
          fetchReviews: async (reset = false) => {
            const state = get();
            
            // Check cache validity (5 minutes)
            if (!reset && state.cacheValid && Date.now() - state.lastFetchTime < 300000) {
              return;
            }

            set((draft) => {
              draft.isLoading = true;
              draft.error = null;
              if (reset) {
                draft.reviews = [];
                draft.lastDoc = null;
                draft.hasMore = true;
              }
            });

            try {
              const { reviews, lastDoc, hasMore } = await reviewService.getReviews(
                state.filters,
                reset ? undefined : state.lastDoc
              );

              set((draft) => {
                if (reset) {
                  draft.reviews = reviews;
                } else {
                  // Remove duplicates when appending
                  const existingIds = new Set(draft.reviews.map(r => r.id));
                  const newReviews = reviews.filter(r => !existingIds.has(r.id));
                  draft.reviews.push(...newReviews);
                }
                
                draft.lastDoc = lastDoc;
                draft.hasMore = hasMore;
                draft.lastFetchTime = Date.now();
                draft.cacheValid = true;
                draft.isLoading = false;
              });
            } catch (error: any) {
              set((draft) => {
                draft.error = error.message || 'Failed to fetch reviews';
                draft.isLoading = false;
              });
            }
          },

          // Load more reviews
          loadMoreReviews: async () => {
            const state = get();
            
            if (!state.hasMore || state.isLoading) {
              return;
            }

            await get().fetchReviews(false);
          },

          // Refresh reviews
          refreshReviews: async () => {
            set((draft) => {
              draft.isRefreshing = true;
            });

            await get().fetchReviews(true);

            set((draft) => {
              draft.isRefreshing = false;
            });
          },

          // Fetch trending reviews
          fetchTrendingReviews: async () => {
            try {
              const trending = await reviewService.getTrendingReviews();
              
              set((draft) => {
                draft.trendingReviews = trending;
              });
            } catch (error) {
              __DEV__ && console.error('Error fetching trending reviews:', error);
            }
          },

          // Fetch user reviews
          fetchUserReviews: async (userId: string) => {
            try {
              const reviews = await reviewService.getReviewsByUser(userId);

              set((draft) => {
                draft.userReviews.set(userId, reviews);
              });
            } catch (error) {
              __DEV__ && console.error('Error fetching user reviews:', error);
            }
          },

          // Search reviews
          searchReviews: async (query: string) => {
            if (!query || query.length < 2) {
              return;
            }

            set((draft) => {
              draft.searchQuery = query;
              draft.isLoading = true;
            });

            try {
              const results = await reviewService.searchReviews(query, get().filters);
              
              set((draft) => {
                draft.reviews = results;
                draft.isLoading = false;
                draft.hasMore = false; // Search doesn't paginate
              });
            } catch (error: any) {
              set((draft) => {
                draft.error = error.message || 'Search failed';
                draft.isLoading = false;
              });
            }
          },

          // Clear search
          clearSearch: () => {
            set((draft) => {
              draft.searchQuery = '';
            });
            
            get().fetchReviews(true);
          },

          // Set filter
          setFilter: (filter: Partial<ReviewFilter>) => {
            set((draft) => {
              draft.filters = { ...draft.filters, ...filter };
              draft.cacheValid = false;
            });
            
            // Refetch with new filters
            get().fetchReviews(true);
          },

          // Clear filters
          clearFilters: () => {
            set((draft) => {
              draft.filters = initialFilters;
              draft.cacheValid = false;
            });
            
            get().fetchReviews(true);
          },

          // Add review
          addReview: (review: Review) => {
            set((draft) => {
              draft.reviews.unshift(review);
              draft.cacheValid = false;
            });
          },

          // Update review
          updateReview: (reviewId: string, updates: Partial<Review>) => {
            set((draft) => {
              const index = draft.reviews.findIndex(r => r.id === reviewId);
              if (index !== -1) {
                draft.reviews[index] = { ...draft.reviews[index], ...updates };
              }
            });
          },

          // Delete review
          deleteReview: (reviewId: string) => {
            set((draft) => {
              draft.reviews = draft.reviews.filter(r => r.id !== reviewId);
              draft.cacheValid = false;
            });
          },

          // Like review
          likeReview: async (reviewId: string, userId: string) => {
            try {
              await reviewService.toggleLike(reviewId, userId);
              
              set((draft) => {
                const review = draft.reviews.find(r => r.id === reviewId);
                if (review) {
                  if (review.likedBy?.includes(userId)) {
                    review.likes = (review.likes || 1) - 1;
                    review.likedBy = review.likedBy.filter(id => id !== userId);
                  } else {
                    review.likes = (review.likes || 0) + 1;
                    review.likedBy = [...(review.likedBy || []), userId];
                  }
                }
              });
            } catch (error) {
              __DEV__ && console.error('Error liking review:', error);
            }
          },

          // Report review
          reportReview: async (reviewId: string, userId: string, reason: string) => {
            try {
              await reviewService.reportReview(reviewId, userId, reason);
              
              set((draft) => {
                const review = draft.reviews.find(r => r.id === reviewId);
                if (review) {
                  review.reports = (review.reports || 0) + 1;
                }
              });
            } catch (error) {
              __DEV__ && console.error('Error reporting review:', error);
            }
          },

          // Invalidate cache
          invalidateCache: () => {
            set((draft) => {
              draft.cacheValid = false;
              draft.lastFetchTime = 0;
            });
          },

          // Clear all
          clearAll: () => {
            set((draft) => {
              draft.reviews = [];
              draft.trendingReviews = [];
              draft.nearbyReviews = [];
              draft.userReviews.clear();
              draft.lastDoc = null;
              draft.hasMore = true;
              draft.filters = initialFilters;
              draft.searchQuery = '';
              draft.error = null;
              draft.cacheValid = false;
              draft.lastFetchTime = 0;
            });
          },
        })),
        {
          name: 'review-store',
          storage: {
            getItem: async (name) => {
              const value = await AsyncStorage.getItem(name);
              return value ? JSON.parse(value) : null;
            },
            setItem: async (name, value) => {
              await AsyncStorage.setItem(name, JSON.stringify(value));
            },
            removeItem: async (name) => {
              await AsyncStorage.removeItem(name);
            },
          },
          partialize: (state: ReviewState & ReviewActions) => ({
            filters: state.filters,
            searchQuery: state.searchQuery,
          } as Partial<ReviewState & ReviewActions>),
        }
      )
    )
  )
);

// Selectors
export const selectReviewById = (id: string) => (state: ReviewState) =>
  state.reviews.find(r => r.id === id);

export const selectFilteredReviews = (state: ReviewState) => {
  let filtered = [...state.reviews];
  
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(r =>
      (r.title?.toLowerCase().includes(query) || false) ||
      r.content.toLowerCase().includes(query) ||
      (r.targetName?.toLowerCase().includes(query) || false)
    );
  }
  
  return filtered;
};

export const selectReviewCount = (state: ReviewState) => state.reviews.length;

export const selectIsFiltered = (state: ReviewState) =>
  state.filters.category !== null ||
  state.filters.rating !== null ||
  state.filters.platform !== null ||
  state.filters.location !== null ||
  state.searchQuery !== '';