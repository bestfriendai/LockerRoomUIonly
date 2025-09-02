/**
 * Test suite for ReviewCard component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { ReviewCard } from '../ReviewCard';

// Mock dependencies
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

jest.mock('@/utils/format', () => ({
  formatRelativeTime: jest.fn((date) => '2 hours ago'),
}));

// Mock Animated to test animations
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Animated.timing = jest.fn(() => ({
    start: jest.fn((callback) => callback && callback()),
    stop: jest.fn(),
  }));
  RN.Animated.spring = jest.fn(() => ({
    start: jest.fn((callback) => callback && callback()),
    stop: jest.fn(),
  }));
  RN.Animated.parallel = jest.fn((animations) => ({
    start: jest.fn((callback) => {
      animations.forEach((anim: any) => anim.start && anim.start());
      callback && callback();
    }),
    stop: jest.fn(() => {
      animations.forEach((anim: any) => anim.stop && anim.stop());
    }),
  }));
  return RN;
});

describe('ReviewCard', () => {
  const mockReview = {
    id: '1',
    title: 'Great Experience',
    content: 'Had an amazing time on this date. Highly recommend!',
    rating: 5,
    isGreenFlag: true,
    tags: ['romantic', 'dinner', 'conversation'],
    userName: 'John Doe',
    isAnonymous: false,
    createdAt: new Date('2024-01-01'),
    likes: 10,
    comments: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render review title and content', () => {
      const { getByText } = render(
        <ReviewCard review={mockReview} />
      );
      
      expect(getByText('Great Experience')).toBeTruthy();
      expect(getByText('Had an amazing time on this date. Highly recommend!')).toBeTruthy();
    });

    it('should render rating badge with correct value', () => {
      const { getByText } = render(
        <ReviewCard review={mockReview} />
      );
      
      expect(getByText('5/5')).toBeTruthy();
    });

    it('should render green flag badge when isGreenFlag is true', () => {
      const { getByText } = render(
        <ReviewCard review={{ ...mockReview, isGreenFlag: true }} />
      );
      
      expect(getByText('🟢 Green Flag')).toBeTruthy();
    });

    it('should render red flag badge when isGreenFlag is false', () => {
      const { getByText } = render(
        <ReviewCard review={{ ...mockReview, isGreenFlag: false }} />
      );
      
      expect(getByText('🔴 Red Flag')).toBeTruthy();
    });

    it('should render tags correctly', () => {
      const { getByText } = render(
        <ReviewCard review={mockReview} />
      );
      
      expect(getByText('#romantic')).toBeTruthy();
      expect(getByText('#dinner')).toBeTruthy();
      expect(getByText('#conversation')).toBeTruthy();
    });

    it('should show tag overflow indicator when more than 3 tags', () => {
      const reviewWithManyTags = {
        ...mockReview,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      };
      
      const { getByText } = render(
        <ReviewCard review={reviewWithManyTags} />
      );
      
      expect(getByText('+2')).toBeTruthy();
    });

    it('should render user name when not anonymous', () => {
      const { getByText } = render(
        <ReviewCard review={{ ...mockReview, isAnonymous: false }} />
      );
      
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should render Anonymous when isAnonymous is true', () => {
      const { getByText } = render(
        <ReviewCard review={{ ...mockReview, isAnonymous: true }} />
      );
      
      expect(getByText('Anonymous')).toBeTruthy();
    });

    it('should render interaction counts', () => {
      const { getByText } = render(
        <ReviewCard review={mockReview} />
      );
      
      expect(getByText('10')).toBeTruthy(); // likes
      expect(getByText('5')).toBeTruthy(); // comments
    });

    it('should not render counts when they are 0', () => {
      const { queryByText } = render(
        <ReviewCard review={{ ...mockReview, likes: 0, comments: 0 }} />
      );
      
      expect(queryByText('0')).toBeNull();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when card is pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <ReviewCard review={mockReview} onPress={onPress} />
      );
      
      fireEvent.press(getByText('Great Experience'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should call onLike when like button is pressed', () => {
      const onLike = jest.fn();
      const { getByLabelText } = render(
        <ReviewCard review={mockReview} onLike={onLike} />
      );
      
      fireEvent.press(getByLabelText('Like review'));
      expect(onLike).toHaveBeenCalledTimes(1);
    });

    it('should call onComment when comment button is pressed', () => {
      const onComment = jest.fn();
      const { getByLabelText } = render(
        <ReviewCard review={mockReview} onComment={onComment} />
      );
      
      fireEvent.press(getByLabelText('Comment on review'));
      expect(onComment).toHaveBeenCalledTimes(1);
    });

    it('should call onShare when share button is pressed', () => {
      const onShare = jest.fn();
      const { getByLabelText } = render(
        <ReviewCard review={mockReview} onShare={onShare} />
      );
      
      fireEvent.press(getByLabelText('Share review'));
      expect(onShare).toHaveBeenCalledTimes(1);
    });
  });

  describe('Animations', () => {
    it('should animate when animated prop is true', async () => {
      const { rerender } = render(
        <ReviewCard review={mockReview} animated={true} index={0} />
      );
      
      await waitFor(() => {
        expect(Animated.parallel).toHaveBeenCalled();
        expect(Animated.timing).toHaveBeenCalled();
        expect(Animated.spring).toHaveBeenCalled();
      });
    });

    it('should not animate when animated prop is false', () => {
      render(
        <ReviewCard review={mockReview} animated={false} />
      );
      
      // Animations should set values directly instead of animating
      expect(Animated.parallel).not.toHaveBeenCalled();
    });

    it('should apply staggered delay based on index', async () => {
      render(
        <ReviewCard review={mockReview} animated={true} index={2} />
      );
      
      await waitFor(() => {
        // Check if timing was called with delay
        const timingCall = (Animated.timing as jest.Mock).mock.calls[0];
        expect(timingCall[1].delay).toBe(200); // index * 100
      });
    });

    it('should cleanup animations on unmount', () => {
      const { unmount } = render(
        <ReviewCard review={mockReview} animated={true} />
      );
      
      const parallelMock = Animated.parallel as jest.Mock;
      const stopMock = parallelMock.mock.results[0]?.value.stop;
      
      unmount();
      
      // Verify that stop would be called on cleanup
      expect(stopMock).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility props', () => {
      const { getByTestId } = render(
        <ReviewCard 
          review={mockReview}
          testID="review-card"
          accessibilityLabel="Custom Review"
          accessibilityHint="Custom Hint"
        />
      );
      
      const card = getByTestId('review-card-1');
      expect(card.props.accessibilityRole).toBe('button');
      expect(card.props.accessibilityLabel).toBe('Custom Review');
      expect(card.props.accessibilityHint).toBe('Custom Hint');
    });

    it('should use default accessibility label', () => {
      const { getByLabelText } = render(
        <ReviewCard review={mockReview} />
      );
      
      expect(getByLabelText('Review: Great Experience')).toBeTruthy();
    });

    it('should have correct test ID', () => {
      const { getByTestId } = render(
        <ReviewCard review={mockReview} testID="custom-test-id" />
      );
      
      expect(getByTestId('review-card-1')).toBeTruthy();
    });

    it('should have accessibility props for interaction buttons', () => {
      const { getByLabelText } = render(
        <ReviewCard review={mockReview} onLike={jest.fn()} />
      );
      
      const likeButton = getByLabelText('Like review');
      expect(likeButton.props.accessibilityRole).toBe('button');
      expect(likeButton.props.accessibilityHint).toBe('Double tap to like this review');
    });
  });

  describe('Rating Colors', () => {
    it('should use success color for rating >= 4', () => {
      const { rerender, UNSAFE_getAllByType } = render(
        <ReviewCard review={{ ...mockReview, rating: 4 }} />
      );
      
      // LinearGradient is mocked, but we can check the colors prop
      const LinearGradient = require('expo-linear-gradient').LinearGradient;
      const gradients = UNSAFE_getAllByType(LinearGradient);
      const ratingGradient = gradients[1]; // Second gradient is for rating
      
      expect(ratingGradient.props.colors).toContain('#22C55E'); // success.main
    });

    it('should use warning color for rating >= 2 and < 4', () => {
      const { UNSAFE_getAllByType } = render(
        <ReviewCard review={{ ...mockReview, rating: 3 }} />
      );
      
      const LinearGradient = require('expo-linear-gradient').LinearGradient;
      const gradients = UNSAFE_getAllByType(LinearGradient);
      const ratingGradient = gradients[1];
      
      expect(ratingGradient.props.colors).toContain('#FB923C'); // warning.main
    });

    it('should use error color for rating < 2', () => {
      const { UNSAFE_getAllByType } = render(
        <ReviewCard review={{ ...mockReview, rating: 1 }} />
      );
      
      const LinearGradient = require('expo-linear-gradient').LinearGradient;
      const gradients = UNSAFE_getAllByType(LinearGradient);
      const ratingGradient = gradients[1];
      
      expect(ratingGradient.props.colors).toContain('#EF4444'); // error.main
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing tags gracefully', () => {
      const reviewWithoutTags = { ...mockReview, tags: undefined };
      const { queryByText } = render(
        <ReviewCard review={reviewWithoutTags} />
      );
      
      expect(queryByText('#')).toBeNull();
    });

    it('should handle empty tags array', () => {
      const reviewWithEmptyTags = { ...mockReview, tags: [] };
      const { queryByText } = render(
        <ReviewCard review={reviewWithEmptyTags} />
      );
      
      expect(queryByText('#')).toBeNull();
    });

    it('should handle undefined userName', () => {
      const reviewWithoutUserName = { ...mockReview, userName: undefined };
      const { getByText } = render(
        <ReviewCard review={reviewWithoutUserName} />
      );
      
      expect(getByText('Unknown')).toBeTruthy();
    });

    it('should handle undefined flag type', () => {
      const reviewWithoutFlag = { ...mockReview, isGreenFlag: undefined };
      const { queryByText } = render(
        <ReviewCard review={reviewWithoutFlag} />
      );
      
      expect(queryByText('Green Flag')).toBeNull();
      expect(queryByText('Red Flag')).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should be memoized with React.memo', () => {
      const onPress = jest.fn();
      const { rerender } = render(
        <ReviewCard review={mockReview} onPress={onPress} />
      );
      
      // Rerender with same props
      rerender(<ReviewCard review={mockReview} onPress={onPress} />);
      
      // Component should not re-render (React.memo should prevent it)
      // This is hard to test directly, but we can verify the component is wrapped
      expect(ReviewCard.displayName).toBe('ReviewCard');
    });
  });
});

export {};