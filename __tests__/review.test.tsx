import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import CreateReviewScreen from '../app/(tabs)/create';
import HomeScreen from '../app/(tabs)/index';
import { AuthProvider } from '../providers/AuthProvider';
import * as reviewService from '../services/reviewService';

// Mock services
jest.mock('../services/reviewService');
jest.mock('../utils/firebase', () => ({
  auth: { currentUser: { uid: 'test-uid' } },
  db: {},
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

const mockReviews = [
  {
    id: '1',
    title: 'Great Experience',
    content: 'Had an amazing time on our date. Very respectful and fun!',
    rating: 5,
    category: 'First Date',
    authorId: 'user1',
    authorUsername: 'Anonymous123',
    createdAt: new Date().toISOString(),
    likes: 10,
    comments: 2,
  },
  {
    id: '2',
    title: 'Not Compatible',
    content: 'Nice person but we had different interests and goals.',
    rating: 3,
    category: 'Relationship',
    authorId: 'user2',
    authorUsername: 'Anonymous456',
    createdAt: new Date().toISOString(),
    likes: 5,
    comments: 1,
  },
];

describe('Review Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Review', () => {
    it('should render create review form', () => {
      const { getByPlaceholderText, getByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <CreateReviewScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      expect(getByPlaceholderText('Review Title')).toBeTruthy();
      expect(getByPlaceholderText('Write your review here...')).toBeTruthy();
      expect(getByText('Post Review')).toBeTruthy();
    });

    it('should validate review fields', async () => {
      const { getByText, findByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <CreateReviewScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const postButton = getByText('Post Review');
      fireEvent.press(postButton);

      const errorMessage = await findByText(/Please fill in all fields/i);
      expect(errorMessage).toBeTruthy();
    });

    it('should submit review successfully', async () => {
      (reviewService.createReview as jest.Mock).mockResolvedValue({
        id: 'new-review-id',
        success: true,
      });

      const { getByPlaceholderText, getByText, getByTestId } = render(
        <AuthProvider>
          <NavigationContainer>
            <CreateReviewScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const titleInput = getByPlaceholderText('Review Title');
      const contentInput = getByPlaceholderText('Write your review here...');
      const postButton = getByText('Post Review');

      fireEvent.changeText(titleInput, 'Test Review');
      fireEvent.changeText(contentInput, 'This is a test review content that is long enough.');
      
      // Select rating
      const rating4 = getByTestId('rating-4');
      fireEvent.press(rating4);

      // Select category
      const categoryPicker = getByTestId('category-picker');
      fireEvent(categoryPicker, 'onValueChange', 'First Date');

      fireEvent.press(postButton);

      await waitFor(() => {
        expect(reviewService.createReview).toHaveBeenCalledWith({
          title: 'Test Review',
          content: 'This is a test review content that is long enough.',
          rating: 4,
          category: 'First Date',
          authorId: 'test-uid',
        });
      });
    });

    it('should enforce minimum content length', async () => {
      const { getByPlaceholderText, getByText, findByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <CreateReviewScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const contentInput = getByPlaceholderText('Write your review here...');
      const postButton = getByText('Post Review');

      fireEvent.changeText(contentInput, 'Too short');
      fireEvent.press(postButton);

      const errorMessage = await findByText(/at least 10 characters/i);
      expect(errorMessage).toBeTruthy();
    });

    it('should show character count', () => {
      const { getByPlaceholderText, getByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <CreateReviewScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const contentInput = getByPlaceholderText('Write your review here...');
      
      fireEvent.changeText(contentInput, 'This is a test review');
      
      expect(getByText(/21 \/ 5000/)).toBeTruthy();
    });
  });

  describe('Display Reviews', () => {
    it('should render list of reviews', async () => {
      (reviewService.getReviews as jest.Mock).mockResolvedValue(mockReviews);

      const { findByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <HomeScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const review1Title = await findByText('Great Experience');
      const review2Title = await findByText('Not Compatible');

      expect(review1Title).toBeTruthy();
      expect(review2Title).toBeTruthy();
    });

    it('should display review ratings', async () => {
      (reviewService.getReviews as jest.Mock).mockResolvedValue(mockReviews);

      const { findAllByTestId } = render(
        <AuthProvider>
          <NavigationContainer>
            <HomeScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const ratings = await findAllByTestId(/rating-display/);
      expect(ratings.length).toBeGreaterThan(0);
    });

    it('should handle empty reviews list', async () => {
      (reviewService.getReviews as jest.Mock).mockResolvedValue([]);

      const { findByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <HomeScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const emptyMessage = await findByText(/No reviews yet/i);
      expect(emptyMessage).toBeTruthy();
    });

    it('should handle review loading state', () => {
      (reviewService.getReviews as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { getByTestId } = render(
        <AuthProvider>
          <NavigationContainer>
            <HomeScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should handle review loading error', async () => {
      (reviewService.getReviews as jest.Mock).mockRejectedValue(
        new Error('Failed to load reviews')
      );

      const { findByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <HomeScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const errorMessage = await findByText(/Failed to load reviews/i);
      expect(errorMessage).toBeTruthy();
    });
  });

  describe('Review Interactions', () => {
    it('should handle like button press', async () => {
      (reviewService.getReviews as jest.Mock).mockResolvedValue(mockReviews);
      (reviewService.likeReview as jest.Mock).mockResolvedValue({ success: true });

      const { findByTestId } = render(
        <AuthProvider>
          <NavigationContainer>
            <HomeScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const likeButton = await findByTestId('like-button-1');
      fireEvent.press(likeButton);

      await waitFor(() => {
        expect(reviewService.likeReview).toHaveBeenCalledWith('1', 'test-uid');
      });
    });

    it('should navigate to review details', async () => {
      (reviewService.getReviews as jest.Mock).mockResolvedValue(mockReviews);
      const mockPush = jest.fn();
      jest.mocked(require('expo-router').useRouter).mockReturnValue({
        push: mockPush,
        back: jest.fn(),
      });

      const { findByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <HomeScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const reviewCard = await findByText('Great Experience');
      fireEvent.press(reviewCard);

      expect(mockPush).toHaveBeenCalledWith('/review/1');
    });

    it('should handle report review', async () => {
      (reviewService.getReviews as jest.Mock).mockResolvedValue(mockReviews);
      (reviewService.reportReview as jest.Mock).mockResolvedValue({ success: true });

      const { findByTestId, findByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <HomeScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const moreButton = await findByTestId('more-button-1');
      fireEvent.press(moreButton);

      const reportButton = await findByText('Report');
      fireEvent.press(reportButton);

      await waitFor(() => {
        expect(reviewService.reportReview).toHaveBeenCalledWith('1', 'test-uid');
      });
    });
  });

  describe('Review Filtering', () => {
    it('should filter reviews by category', async () => {
      (reviewService.getReviews as jest.Mock).mockResolvedValue(mockReviews);

      const { getByTestId, findByText, queryByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <HomeScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      // Wait for initial load
      await findByText('Great Experience');

      // Apply category filter
      const categoryFilter = getByTestId('category-filter');
      fireEvent(categoryFilter, 'onValueChange', 'First Date');

      await waitFor(() => {
        expect(queryByText('Great Experience')).toBeTruthy();
        expect(queryByText('Not Compatible')).toBeFalsy();
      });
    });

    it('should filter reviews by rating', async () => {
      (reviewService.getReviews as jest.Mock).mockResolvedValue(mockReviews);

      const { getByTestId, findByText, queryByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <HomeScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      // Wait for initial load
      await findByText('Great Experience');

      // Apply rating filter
      const ratingFilter = getByTestId('rating-filter-5');
      fireEvent.press(ratingFilter);

      await waitFor(() => {
        expect(queryByText('Great Experience')).toBeTruthy();
        expect(queryByText('Not Compatible')).toBeFalsy();
      });
    });

    it('should sort reviews', async () => {
      (reviewService.getReviews as jest.Mock).mockResolvedValue(mockReviews);

      const { getByTestId, findAllByTestId } = render(
        <AuthProvider>
          <NavigationContainer>
            <HomeScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      // Wait for initial load
      await findAllByTestId(/review-card/);

      // Apply sort
      const sortPicker = getByTestId('sort-picker');
      fireEvent(sortPicker, 'onValueChange', 'rating');

      const reviewCards = await findAllByTestId(/review-card/);
      expect(reviewCards[0]).toHaveTextContent('Great Experience'); // Higher rating first
    });
  });
});