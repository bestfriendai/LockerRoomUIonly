import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share
} from 'react-native';
import logger from '../utils/logger';

import { Image } from "expo-image";
import { Star, ThumbsUp, MessageCircle, Share2 } from "lucide-react-native";
import { useTheme } from "../providers/ThemeProvider";

const CARD_PADDING = 6;

interface MasonryReviewCardProps {
  review: any;
  onPress: () => void;
  index?: number;
}

// Simplified MasonryReviewCard for MockTrae
const MasonryReviewCard: React.FC<MasonryReviewCardProps> = ({
  review,
  onPress,
}) => {
  const { colors } = useTheme();
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(review?.helpfulCount || 0);
  const [isLiking, setIsLiking] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  
  // Safety check for review data
  if (!review) {
    if (__DEV__) {
      __DEV__ && console.warn('MasonryReviewCard received undefined review');
    }
    return null;
  }

  // Mock like handler
  const handleLike = async () => {
    if (isLiking) return;
    
    try {
      setIsLiking(true);
      
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

  // Simple height calculation for masonry effect
  const imageHeight = review.images?.length > 0 ? 160 : 120;

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

  const handleCardPress = () => {
    onPress();
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: StyleSheet.hairlineWidth,
            shadowColor: colors.text,
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
            elevation: 4,
          },
        ]}
      >
        {/* Image or Avatar */}
        <TouchableOpacity 
          style={[styles.imageContainer, { height: imageHeight }]}
          onPress={handleCardPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Review image for ${review.title || 'Untitled Review'}. Rating: ${review.rating || 5} out of 5 stars`}
          accessibilityHint="Tap to view full review"
        >
          {review.images && review.images[0] ? (
            <Image
              source={{ uri: review.images[0] }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: colors.surfaceElevated }]}>
              <Text style={[styles.placeholderText, { color: colors.primary }]}>
                {review.targetUserId?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          )}
          
          {/* Rating Indicator */}
          <View style={[styles.ratingIndicator, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
            <Star size={12} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>
              {review.rating}/5
            </Text>
          </View>

          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.categoryText}>
              {review.categories?.[0]?.toUpperCase() || "REVIEW"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Content */}
        <TouchableOpacity 
          style={styles.content}
          onPress={handleCardPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Review: ${review.title || 'Untitled'}. Target: ${review.targetUserId || 'Anonymous'}. ${likeCount} likes`}
          accessibilityHint="Tap to read full review"
        >
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {review.title || 'Untitled Review'}
          </Text>
          
          <Text style={[styles.targetUser, { color: colors.textSecondary }]} numberOfLines={1}>
            {review.targetUserId || 'Anonymous'}
          </Text>
          
          {review.location && (
            <Text style={[styles.location, { color: colors.textSecondary }]} numberOfLines={1}>
              {review.location.city || 'Unknown'}, {review.location.state || 'Unknown'}
            </Text>
          )}
          
          <Text style={[styles.snippet, { color: colors.textSecondary }]} numberOfLines={3}>
            {review.content || 'No content available'}
          </Text>

          {/* Tags */}
          {review.tags && review.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {review.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                <View 
                  key={tagIndex}
                  style={[styles.tag, { backgroundColor: colors.chipBg, borderColor: colors.chipBorder }]}
                >
                  <Text style={[styles.tagText, { color: colors.chipText }]}>
                    {tag}
                  </Text>
                </View>
              ))}
              {review.tags.length > 2 && (
                <Text style={[styles.moreTagsText, { color: colors.textSecondary }]}>
                  +{review.tags.length - 2}
                </Text>
              )}
            </View>
          )}

          {/* Stats */}
          <View style={styles.stats} pointerEvents="box-none">
            <TouchableOpacity 
              style={styles.statItem}
              onPress={handleLike}
              accessibilityRole="button"
              accessibilityLabel={`Like button, ${likeCount} likes${liked ? ', liked' : ''}`}
              accessibilityHint="Double tap to like or unlike"
              accessibilityState={{ selected: liked }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ThumbsUp
                size={14}
                color={liked ? colors.primary : colors.textSecondary}
                fill={liked ? colors.primary : "transparent"}
              />
              <Text style={[styles.statText, { color: liked ? colors.primary : colors.textSecondary }]}>
                {likeCount}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statItem, { opacity: isSharing ? 0.6 : 1 }]}
              onPress={handleShare}
              disabled={isSharing}
              accessibilityRole="button"
              accessibilityLabel="Share review"
              accessibilityHint="Double tap to share this review"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Share2 size={14} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.statItem} accessibilityRole="text" accessibilityLabel="0 comments">
              <MessageCircle size={14} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                0
              </Text>
            </View>

            <View style={styles.statItem} accessibilityRole="text" accessibilityLabel={`Posted ${formatDate()}`}>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {formatDate()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Author info */}
        {!review.isAnonymous && review.author && (
          <View style={styles.authorInfo}>
            <Text style={[styles.authorText, { color: colors.textSecondary }]}>
              by {review.author.username}
            </Text>
            {review.author.isVerified && (
              <Text style={styles.verifiedBadge}>✓</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  authorInfo: {
    alignItems: "center",
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    marginTop: 6,
    paddingTop: 6,
  },
  authorText: {
    fontSize: 11,
    fontWeight: "500",
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
  },
  categoryBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: "absolute",
    right: 8,
    top: 8,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  container: {
    marginBottom: CARD_PADDING * 2,
    paddingHorizontal: CARD_PADDING,
    width: "100%",
  },
  content: {
    padding: 12,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "500",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  location: {
    fontSize: 12,
    marginBottom: 6,
  },
  moreTagsText: {
    alignSelf: "center",
    fontSize: 10,
    fontWeight: "500",
  },
  placeholderImage: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: "700",
  },
  ratingIndicator: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: "absolute",
    top: 8,
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  snippet: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  statItem: {
    alignItems: "center",
    flexDirection: "row",
  },
  statText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  stats: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tag: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "500",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 8,
  },
  targetUser: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 4,
  },
  verifiedBadge: {
    color: "#10B981",
    fontSize: 12,
    marginLeft: 4,
  },
});

export default MasonryReviewCard;