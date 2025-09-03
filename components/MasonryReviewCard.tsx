import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Animated,
  Pressable,
} from 'react-native';
import { Image } from "expo-image";
import { Star, ThumbsUp, MessageCircle, Share2, MapPin } from "lucide-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from "../providers/ThemeProvider";
import { BORDER_RADIUS, SHADOWS } from '../constants/shadows';
import { tokens } from '../constants/tokens';
import { createTypographyStyles } from '../styles/typography';

const CARD_PADDING = tokens.spacing.xs;

interface MasonryReviewCardProps {
  review: any;
  onPress: () => void;
  index?: number;
}

// Enhanced MasonryReviewCard with Pinterest-style layout
const MasonryReviewCard: React.FC<MasonryReviewCardProps> = ({
  review,
  onPress,
}) => {
  const { colors, isDark } = useTheme();
  const typography = createTypographyStyles(colors);
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(review?.helpfulCount || 0);
  const [isLiking, setIsLiking] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  // Safety check for review data
  if (!review) {
    if (__DEV__) {
      __DEV__ && console.warn('MasonryReviewCard received undefined review');
    }
    return null;
  }

  const handleCardPress = () => {
    // Haptic feedback for better UX
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Scale animation for press feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress();
  };

  // Enhanced like handler with haptic feedback
  const handleLike = async () => {
    if (isLiking) return;
    
    try {
      setIsLiking(true);
      
      // Haptic feedback for interaction
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Optimistic UI update
      const newLiked = !liked;
      setLiked(newLiked);
      setLikeCount((prev: number) => newLiked ? prev + 1 : Math.max(0, prev - 1));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error: any) {
      if (__DEV__) {
        __DEV__ && console.error('Error liking review:', error);
      }
      // Revert optimistic update on error
      setLiked(!liked);
      setLikeCount((prev: number) => liked ? prev + 1 : Math.max(0, prev - 1));
      
      Alert.alert('Error', 'Failed to update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleShare = async () => {
    if (isSharing) return;
    
    try {
      setIsSharing(true);
      
      const shareContent = {
        message: `Check out this review: "${review.title || 'Review'}" - Rating: ${review.rating || 5}/5 stars`,
        title: review.title || 'Review',
      };
      
      await Share.share(shareContent);
    } catch (error: any) {
      if (__DEV__) {
        __DEV__ && console.error('Error sharing review:', error);
      }
      Alert.alert('Error', 'Failed to share. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  // Dynamic height calculation for masonry effect
  const getCardHeight = () => {
    const baseHeight = 200;
    const contentLength = review.content?.length || 0;
    const hasImage = review.images?.length > 0;
    
    if (hasImage) {
      return Math.min(baseHeight + (contentLength / 10), 350);
    }
    return Math.min(baseHeight + (contentLength / 5), 280);
  };
  
  const cardHeight = getCardHeight();
  const imageHeight = review.images?.length > 0 ? Math.max(cardHeight * 0.6, 120) : 100;

  // Simple date formatting with error handling
  const formatDate = () => {
    try {
      if (!review.createdAt) return "Recent";
      
      const date = new Date(review.createdAt);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return "Recent";
    }
  };


  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <Pressable
        onPress={handleCardPress}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.borderSubtle,
            borderWidth: StyleSheet.hairlineWidth,
            height: cardHeight,
          },
          SHADOWS.md,
        ]}
      >
        {/* Hero Image Section */}
        <View 
          style={[styles.imageContainer, { height: imageHeight }]}
          accessibilityRole="image"
          accessibilityLabel={`Review image for ${review.title || 'Untitled Review'}. Rating: ${review.rating || 5} out of 5 stars`}
        >
          {review.images && review.images[0] ? (
            <Image
              source={{ uri: review.images[0] }}
              style={styles.image}
              contentFit="cover"
              transition={300}
              placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQV0IHWPgf/8PGwYAK9gD9oGGPy0AAAAASUVORK5CYII=' }}
            />
          ) : (
            <LinearGradient
              colors={[colors.primary + '40', colors.primary + '20']}
              style={styles.placeholderImage}
            >
              <Text style={[styles.placeholderText, { color: colors.primary }]}>
                {(review.targetUserId || review.targetName || review.title || "")?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            </LinearGradient>
          )}
          
          {/* Overlay gradient for better text readability */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
            style={styles.overlay}
          />
          
          {/* Floating Rating Badge */}
          <View style={[styles.ratingBadge, { backgroundColor: 'rgba(0, 0, 0, 0.75)' }]}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={[styles.ratingText, { color: '#FFFFFF' }]}>
              {review.rating || 5}
            </Text>
          </View>

          {/* Category Chip */}
          <View style={[styles.categoryChip, { backgroundColor: colors.primary }]}>
            <Text style={[styles.categoryText, { color: colors.onPrimary }]}>
              {(Array.isArray(review.categories) ? review.categories[0] : review.category)?.toUpperCase() || "REVIEW"}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View 
          style={styles.content}
          accessibilityRole="text"
          accessibilityLabel={`Review: ${review.title || 'Untitled'}. Target: ${review.targetUserId || 'Anonymous'}. ${likeCount} likes`}
        >
          <Text style={[typography.h4, styles.title]} numberOfLines={2}>
            {review.title || 'Untitled Review'}
          </Text>
          
          <Text style={[typography.bodySmall, styles.targetUser, { color: colors.primary, fontWeight: '600' }]} numberOfLines={1}>
            @{review.targetUserId || 'Anonymous'}
          </Text>
          
          {review.location && (
            <View style={styles.locationContainer}>
              <MapPin size={12} color={colors.textTertiary} />
              <Text style={[typography.caption, styles.locationText, { color: colors.textTertiary }]} numberOfLines={1}>
                {typeof review.location === 'string' 
                  ? review.location 
                  : `${review.location?.city || 'Unknown'}, ${review.location?.state || 'Unknown'}`}
              </Text>
            </View>
          )}
          
          <Text style={[typography.bodySmall, styles.snippet, { color: colors.textSecondary }]} numberOfLines={3}>
            {review.content || 'No content available'}
          </Text>

          {/* Enhanced Tags */}
          {review.tags && review.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {review.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                <View 
                  key={tagIndex}
                  style={[styles.modernTag, { 
                    backgroundColor: colors.primary + '15', 
                    borderColor: colors.primary + '30' 
                  }]}
                >
                  <Text style={[typography.caption, styles.tagText, { color: colors.primary }]}>
                    #{tag}
                  </Text>
                </View>
              ))}
              {review.tags.length > 3 && (
                <View style={[styles.modernTag, { backgroundColor: colors.surface }]}>
                  <Text style={[typography.caption, styles.moreTagsText, { color: colors.textTertiary }]}>
                    +{review.tags.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}

        </View>

        {/* Bottom Action Bar */}
        <View style={[styles.actionBar, { borderTopColor: colors.borderSubtle }]}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLike}
            accessibilityRole="button"
            accessibilityLabel={`Like button, ${likeCount} likes${liked ? ', liked' : ''}`}
            accessibilityState={{ selected: liked }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ThumbsUp
              size={16}
              color={liked ? colors.primary : colors.textSecondary}
              fill={liked ? colors.primary : "transparent"}
            />
            <Text style={[typography.caption, styles.actionText, { 
              color: liked ? colors.primary : colors.textSecondary 
            }]}>
              {likeCount}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { opacity: isSharing ? 0.6 : 1 }]}
            onPress={handleShare}
            disabled={isSharing}
            accessibilityRole="button"
            accessibilityLabel="Share review"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Share2 size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={16} color={colors.textSecondary} />
            <Text style={[typography.caption, styles.actionText, { color: colors.textSecondary }]}>
              0
            </Text>
          </TouchableOpacity>

          <View style={styles.spacer} />
          
          <Text style={[typography.caption, styles.dateText, { color: colors.textTertiary }]}>
            {formatDate()}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xs,
    width: "100%",
  },
  card: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  placeholderImage: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
  placeholderText: {
    fontSize: tokens.fontSize['3xl'],
    fontWeight: tokens.fontWeight.bold,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  ratingBadge: {
    alignItems: "center",
    borderRadius: BORDER_RADIUS.full,
    flexDirection: "row",
    left: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.xs,
    paddingVertical: tokens.spacing[0.5],
    position: "absolute",
    top: tokens.spacing.xs,
    ...SHADOWS.sm,
  },
  categoryChip: {
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing[0.5],
    position: "absolute",
    right: tokens.spacing.xs,
    top: tokens.spacing.xs,
    ...SHADOWS.sm,
  },
  categoryText: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.bold,
    letterSpacing: tokens.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  ratingText: {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.semibold,
    marginLeft: tokens.spacing[0.5],
  },
  content: {
    padding: tokens.spacing.md,
    flex: 1,
  },
  title: {
    marginBottom: tokens.spacing.xs,
  },
  targetUser: {
    marginBottom: tokens.spacing.xs,
  },
  locationContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: tokens.spacing.xs,
  },
  locationText: {
    marginLeft: tokens.spacing[0.5],
  },
  snippet: {
    lineHeight: tokens.lineHeight.sm,
    marginBottom: tokens.spacing.sm,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.sm,
  },
  modernTag: {
    borderRadius: BORDER_RADIUS.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing[0.5],
  },
  tagText: {
    fontWeight: tokens.fontWeight.medium,
  },
  moreTagsText: {
    fontWeight: tokens.fontWeight.medium,
  },
  actionBar: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  actionButton: {
    alignItems: "center",
    flexDirection: "row",
    marginRight: tokens.spacing.md,
  },
  actionText: {
    fontWeight: tokens.fontWeight.medium,
    marginLeft: tokens.spacing[0.5],
  },
  spacer: {
    flex: 1,
  },
  dateText: {
    fontWeight: tokens.fontWeight.normal,
  },
});

export default MasonryReviewCard;