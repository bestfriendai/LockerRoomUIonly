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
import { Star, ThumbsUp, MessageCircle, Share2, MapPin, Flag } from "lucide-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from "../providers/ThemeProvider";
import { BORDER_RADIUS, SHADOWS } from '../constants/shadows';
import { tokens, compactTextPresets } from '../constants/tokens';
import { createTypographyStyles } from '../styles/typography';
// MODERN DESIGN IMPORTS
import { GlassmorphismCard, FloatingCard } from './ui/GlassmorphismCard';
import { ModernGradient } from './ui/ModernGradient';
import { ModernText, BodyText, CaptionText } from './ui/ModernText';
import { modernColors, modernShadows, modernBorderRadius } from '../constants/modernDesign';

// COMPACT DESIGN - TeaOnHer-style smaller padding
const CARD_PADDING = tokens.compactSpacing.xs; // 3 instead of 4
const CARD_MARGIN = tokens.compactSpacing.sm; // 6 instead of 8

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

  // Dynamic height calculation for masonry effect - DRAMATIC variation like TeaOnHer
  const getCardHeight = () => {
    const contentLength = review.content?.length || 0;
    const hasImage = review.images?.length > 0;
    const titleLength = review.title?.length || 0;

    // Create MUCH more dramatic height variation like TeaOnHer
    const heightVariation = Math.floor(Math.random() * 200) + 50; // 50-250px variation!

    // Different base heights for more variety
    const baseHeights = [140, 180, 220, 260, 300];
    const randomBaseHeight = baseHeights[Math.floor(Math.random() * baseHeights.length)];

    if (hasImage) {
      return Math.min(randomBaseHeight + (contentLength / 8) + (titleLength / 2) + heightVariation, 500);
    }
    return Math.min(randomBaseHeight + (contentLength / 4) + titleLength + heightVariation, 400);
  };

  const cardHeight = getCardHeight();
  // More varied image heights - some cards are mostly image, others mostly text
  const imageRatios = [0.4, 0.5, 0.6, 0.7, 0.8];
  const randomImageRatio = imageRatios[Math.floor(Math.random() * imageRatios.length)];
  const imageHeight = review.images?.length > 0 ? Math.max(cardHeight * randomImageRatio, 100) : 80;

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
    <View style={styles.container}>
      {/* MODERN FLOATING CARD with Advanced Effects */}
      <FloatingCard
        elevation="high"
        borderRadius="2xl"
        padding={0}
        interactive={true}
        onPress={handleCardPress}
        style={[styles.modernCard, { height: cardHeight }]}
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
            <ModernGradient
              gradient="aurora"
              style={styles.placeholderImage}
            >
              <ModernText
                variant="h2"
                weight="black"
                color="#FFFFFF"
              >
                {(review.targetUserId || review.targetName || review.title || "")?.charAt(0)?.toUpperCase() || "?"}
              </ModernText>
            </ModernGradient>
          )}
          
          {/* Modern Gradient Overlay */}
          <ModernGradient
            gradient="darkGlass"
            style={styles.overlay}
          />

          {/* Glassmorphism Rating Badge */}
          <GlassmorphismCard
            style={styles.ratingBadge}
            intensity={15}
            tint="dark"
            borderRadius="lg"
            padding={6}
          >
            <View style={styles.ratingContent}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <ModernText variant="caption" weight="bold" color="#FFFFFF" style={{ marginLeft: 4 }}>
                {review.rating || 5}
              </ModernText>
            </View>
          </GlassmorphismCard>

          {/* Modern Report Button with Gradient */}
          <ModernGradient
            gradient="danger"
            style={styles.reportButton}
            borderRadius="md"
          >
            <TouchableOpacity
              style={styles.reportButtonContent}
              onPress={() => Alert.alert('Report', 'Report functionality would be implemented here')}
              accessibilityRole="button"
              accessibilityLabel="Report this review"
            >
              <Flag size={12} color="#FFFFFF" />
              <CaptionText color="#FFFFFF" weight="semibold" style={{ marginLeft: 3 }}>
                Report
              </CaptionText>
            </TouchableOpacity>
          </ModernGradient>

          {/* Glassmorphism Location Tag */}
          {review.location && (
            <GlassmorphismCard
              style={styles.locationTag}
              intensity={10}
              tint="dark"
              borderRadius="md"
              padding={4}
            >
              <CaptionText color="#FFFFFF" weight="medium">
                {typeof review.location === 'string'
                  ? review.location
                  : `${review.location?.city || 'Unknown'}, ${review.location?.state || 'Unknown'}`}
              </CaptionText>
            </GlassmorphismCard>
          )}
        </View>

        {/* Content Section - COMPACT DESIGN */}
        <View
          style={styles.content}
          accessibilityRole="text"
          accessibilityLabel={`Review: ${review.title || 'Untitled'}. Target: ${review.targetUserId || 'Anonymous'}. ${likeCount} likes`}
        >
          {/* Modern Title */}
          <ModernText
            variant="bodyLarge"
            weight="semibold"
            color={colors.text}
            numberOfLines={3}
            style={styles.title}
          >
            {review.title || 'Untitled Review'}
          </ModernText>

          {/* Modern Meta Row */}
          <View style={styles.metaRow}>
            <ModernText
              variant="caption"
              weight="medium"
              color={colors.primary}
              numberOfLines={1}
              style={styles.targetUser}
            >
              @{review.targetUserId || 'Anonymous'}
            </ModernText>

            {review.location && (
              <>
                <CaptionText color={colors.textTertiary} style={{ marginHorizontal: 6 }}>•</CaptionText>
                <View style={styles.locationContainer}>
                  <MapPin size={10} color={colors.textTertiary} />
                  <CaptionText
                    color={colors.textTertiary}
                    numberOfLines={1}
                    style={styles.locationText}
                  >
                    {typeof review.location === 'string'
                      ? review.location
                      : `${review.location?.city || 'Unknown'}, ${review.location?.state || 'Unknown'}`}
                  </CaptionText>
                </View>
              </>
            )}
          </View>

          {/* Modern Content Snippet */}
          <BodyText
            size="small"
            color={colors.textSecondary}
            numberOfLines={4}
            style={styles.snippet}
          >
            {review.content || 'No content available'}
          </BodyText>

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

        {/* Modern Action Bar with Glassmorphism */}
        <GlassmorphismCard
          style={styles.actionBar}
          intensity={5}
          tint="light"
          borderRadius="none"
          padding={12}
        >
          <View style={styles.actionBarContent}>
            <TouchableOpacity
              style={[styles.actionButton, liked && styles.likedButton]}
              onPress={handleLike}
              accessibilityRole="button"
              accessibilityLabel={`Like button, ${likeCount} likes${liked ? ', liked' : ''}`}
              accessibilityState={{ selected: liked }}
            >
              <ThumbsUp
                size={14}
                color={liked ? '#FFFFFF' : colors.textSecondary}
                fill={liked ? '#FFFFFF' : "transparent"}
              />
              <CaptionText
                color={liked ? '#FFFFFF' : colors.textSecondary}
                weight="medium"
                style={styles.actionText}
              >
                {likeCount}
              </CaptionText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { opacity: isSharing ? 0.6 : 1 }]}
              onPress={handleShare}
              disabled={isSharing}
              accessibilityRole="button"
              accessibilityLabel="Share review"
            >
              <Share2 size={14} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={14} color={colors.textSecondary} />
              <CaptionText color={colors.textSecondary} weight="medium" style={styles.actionText}>
                0
              </CaptionText>
            </TouchableOpacity>

            <View style={styles.spacer} />

            <CaptionText color={colors.textTertiary} weight="normal">
              {formatDate()}
            </CaptionText>
          </View>
        </GlassmorphismCard>
      </FloatingCard>
    </View>
  );
};

const styles = StyleSheet.create({
  // MODERN CONTAINER
  container: {
    marginBottom: 16,
    paddingHorizontal: 8,
    width: "100%",
  },
  modernCard: {
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
    fontSize: tokens.compactFontSize.xl,
    fontWeight: tokens.fontWeight.bold,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  // MODERN RATING BADGE
  ratingBadge: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  ratingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  // MODERN REPORT BUTTON
  reportButton: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  reportButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  // MODERN LOCATION TAG
  locationTag: {
    position: "absolute",
    bottom: 12,
    left: 12,
  },
  ratingText: {
    fontWeight: tokens.fontWeight.semibold,
    marginLeft: 1,
  },
  // COMPACT CONTENT SECTION
  content: {
    padding: tokens.compactSpacing.sm, // 6 instead of 12
    flex: 1,
  },
  // COMPACT TEXT ELEMENTS
  title: {
    marginBottom: 1, // reduced from 2
  },
  targetUser: {
    flex: 1,
  },
  // META ROW - combines target user and location
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 1,
  },
  locationContainer: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },
  locationText: {
    marginLeft: 1,
    flex: 1,
  },
  snippet: {
    lineHeight: tokens.compactLineHeight.sm, // tighter line height
    marginBottom: tokens.compactSpacing.xs,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1, // reduced gap
    marginBottom: tokens.compactSpacing.xs,
  },
  modernTag: {
    borderRadius: BORDER_RADIUS.xs,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: tokens.compactSpacing.xs,
    paddingVertical: 0.5,
  },
  tagText: {
    fontWeight: tokens.fontWeight.medium,
  },
  moreTagsText: {
    fontWeight: tokens.fontWeight.medium,
  },
  // MODERN ACTION BAR
  actionBar: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: modernBorderRadius['2xl'],
    borderBottomRightRadius: modernBorderRadius['2xl'],
  },
  actionBarContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    alignItems: "center",
    flexDirection: "row",
    marginRight: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: modernBorderRadius.md,
  },
  likedButton: {
    backgroundColor: modernColors.accent.pink,
  },
  actionText: {
    fontWeight: tokens.fontWeight.medium,
    marginLeft: 1,
  },
  spacer: {
    flex: 1,
  },
  dateText: {
    fontWeight: tokens.fontWeight.normal,
  },
});

export default MasonryReviewCard;