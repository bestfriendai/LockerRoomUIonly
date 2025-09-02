/**
 * Enhanced Review Card Component
 * Modern card design with animations and interactions
 * 
 * @example
 * <ReviewCard
 *   review={reviewData}
 *   onPress={handlePress}
 *   onLike={handleLike}
 *   animated
 * />
 */

import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  AccessibilityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/utils/colors';
import { typography, textStyles } from '@/utils/typography';
import { spacing, borderRadius, shadows } from '@/utils/spacing';
import { formatRelativeTime } from '@/utils/format';

const { width: screenWidth } = Dimensions.get('window');

interface ReviewCardProps extends AccessibilityProps {
  review: {
    id: string;
    title: string;
    content: string;
    rating: number;
    isGreenFlag?: boolean;
    tags?: string[];
    userName?: string;
    isAnonymous?: boolean;
    createdAt: Date | string;
    likes?: number;
    comments?: number;
  };
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  index?: number;
  animated?: boolean;
  testID?: string;
}

/**
 * ReviewCard component with animations and interactions
 * @param {ReviewCardProps} props - Component props
 * @returns {React.ReactElement} Rendered review card
 */
export const ReviewCard: React.FC<ReviewCardProps> = React.memo(({
  review,
  onPress,
  onLike,
  onComment,
  onShare,
  index = 0,
  animated = true,
  testID,
  accessibilityLabel,
  accessibilityHint,
  ...accessibilityProps
}) => {
  // Use stable animation references
  const animations = useMemo(() => ({
    fade: new Animated.Value(0),
    scale: new Animated.Value(0.9),
  }), []);

  useEffect(() => {
    let animationHandle: Animated.CompositeAnimation | null = null;
    
    if (animated) {
      animationHandle = Animated.parallel([
        Animated.timing(animations.fade, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.spring(animations.scale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]);
      animationHandle.start();
    } else {
      animations.fade.setValue(1);
      animations.scale.setValue(1);
    }
    
    // Cleanup function to stop animations
    return () => {
      if (animationHandle) {
        animationHandle.stop();
      }
    };
  }, [animated, index, animations]);

  const getRatingColor = useCallback((rating: number) => {
    if (rating >= 4) return colors.success.main;
    if (rating >= 3) return colors.warning.main;
    return colors.error.main;
  }, []);

  const animatedStyle = useMemo(() => {
    return animated
      ? {
          opacity: animations.fade,
          transform: [
            { scale: animations.scale },
            {
              translateY: animations.fade.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }
      : {};
  }, [animated, animations]);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onPress}
        style={styles.touchable}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || `Review: ${review.title}`}
        accessibilityHint={accessibilityHint || 'Tap to view full review'}
        testID={testID || `review-card-${review.id}`}
        {...accessibilityProps}
      >
        <LinearGradient
          colors={['rgba(255,30,125,0.03)', 'rgba(255,90,163,0.01)']}
          style={styles.gradientCard}
        >
          {/* Header Section */}
          <View style={styles.header}>
            {/* Rating Badge */}
            <View style={styles.ratingBadge}>
              <LinearGradient
                colors={
                  review.rating >= 4
                    ? [colors.success.main, colors.success.dark]
                    : review.rating >= 2
                    ? [colors.warning.main, colors.warning.dark]
                    : [colors.error.main, colors.error.dark]
                }
                style={styles.ratingGradient}
              >
                <Ionicons name="star" size={14} color="white" />
                <Text style={styles.ratingText}>{review.rating}/5</Text>
              </LinearGradient>
            </View>

            {/* Flag Type Badge */}
            {review.isGreenFlag !== undefined && (
              <View style={styles.flagBadge}>
                <Text style={styles.flagText}>
                  {review.isGreenFlag ? '🟢 Green Flag' : '🔴 Red Flag'}
                </Text>
              </View>
            )}
          </View>

          {/* Content Section */}
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {review.title}
            </Text>

            <Text style={styles.preview} numberOfLines={3}>
              {review.content}
            </Text>

            {/* Tags */}
            {review.tags && review.tags.length > 0 && (
              <View style={styles.tagContainer}>
                {review.tags.slice(0, 3).map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
                {review.tags.length > 3 && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>+{review.tags.length - 3}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Meta Information */}
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="person-outline"
                  size={14}
                  color={colors.neutral[400]}
                />
                <Text style={styles.metaText}>
                  {review.isAnonymous ? 'Anonymous' : review.userName || 'Unknown'}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={colors.neutral[400]}
                />
                <Text style={styles.metaText}>
                  {formatRelativeTime(review.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* Interaction Bar */}
          <View style={styles.interactionBar}>
            <TouchableOpacity
              style={styles.interactionButton}
              onPress={onLike}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Like review"
              accessibilityHint="Double tap to like this review"
            >
              <Ionicons
                name="heart-outline"
                size={20}
                color={colors.neutral[400]}
              />
              {review.likes !== undefined && review.likes > 0 && (
                <Text style={styles.interactionCount}>{review.likes}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.interactionButton}
              onPress={onComment}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Comment on review"
              accessibilityHint="Double tap to comment"
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={colors.neutral[400]}
              />
              {review.comments !== undefined && review.comments > 0 && (
                <Text style={styles.interactionCount}>{review.comments}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.interactionButton}
              onPress={onShare}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Share review"
              accessibilityHint="Double tap to share this review"
            >
              <Ionicons
                name="share-outline"
                size={20}
                color={colors.neutral[400]}
              />
            </TouchableOpacity>

            <View style={styles.spacer} />

            <TouchableOpacity
              style={styles.moreButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={colors.neutral[400]}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

ReviewCard.displayName = 'ReviewCard';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  touchable: {
    width: '100%',
  },
  gradientCard: {
    backgroundColor: colors.neutral[900],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[800],
    overflow: 'hidden',
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  ratingBadge: {
    overflow: 'hidden',
    borderRadius: borderRadius.full,
  },
  ratingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  ratingText: {
    color: 'white',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  flagBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  flagText: {
    color: colors.neutral[200],
    fontSize: typography.fontSize.xs,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...textStyles.h4,
    color: colors.neutral[50],
    marginBottom: spacing.sm,
  },
  preview: {
    ...textStyles.body,
    color: colors.neutral[300],
    marginBottom: spacing.md,
    lineHeight: typography.fontSize.base * 1.5,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: 'rgba(255,30,125,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.md,
  },
  tagText: {
    color: colors.primary[400],
    fontSize: typography.fontSize.xs,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.neutral[400],
    fontSize: typography.fontSize.sm,
  },
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[800],
    gap: spacing.lg,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  interactionCount: {
    color: colors.neutral[400],
    fontSize: typography.fontSize.sm,
  },
  spacer: {
    flex: 1,
  },
  moreButton: {
    padding: spacing.xs,
  },
});

export default ReviewCard;