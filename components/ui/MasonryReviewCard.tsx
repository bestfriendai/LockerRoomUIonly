import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ViewStyle,
  Dimensions,
  ImageStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';
import { tokens } from '../../constants/tokens';
import { BORDER_RADIUS, SHADOWS } from '../../constants/shadows';
import { createTypographyStyles } from '../../styles/typography';
import { formatRelativeTime } from '../../utils/timestampHelpers';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - tokens.spacing.lg * 3) / 2; // Two columns with spacing

export interface MasonryReviewData {
  id: string;
  title: string;
  content: string;
  rating: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  images?: string[];
  tags?: string[];
  likes: number;
  isLiked?: boolean;
  location?: string;
  createdAt: string;
  platform?: 'tinder' | 'bumble' | 'hinge' | 'other';
}

interface MasonryReviewCardProps {
  data: MasonryReviewData;
  onPress?: (review: MasonryReviewData) => void;
  onLike?: (reviewId: string, isLiked: boolean) => void;
  onAuthorPress?: (authorId: string) => void;
  style?: ViewStyle;
  variant?: 'compact' | 'standard' | 'expanded';
  showAuthor?: boolean;
  showTags?: boolean;
  showStats?: boolean;
  animated?: boolean;
}

export const MasonryReviewCard: React.FC<MasonryReviewCardProps> = ({
  data,
  onPress,
  onLike,
  onAuthorPress,
  style,
  variant = 'standard',
  showAuthor = true,
  showTags = true,
  showStats = true,
  animated = true,
}) => {
  const { colors, isDark } = useTheme();
  const typography = createTypographyStyles(colors);
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(data.isLiked || false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const likeAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (animated) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.98,
          useNativeDriver: true,
          tension: 300,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 8,
        }),
      ]).start();
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(data);
  };

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    // Animate like button
    Animated.sequence([
      Animated.spring(likeAnim, {
        toValue: 1.3,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }),
      Animated.spring(likeAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }),
    ]).start();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLike?.(data.id, newLikedState);
  };

  const handleAuthorPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAuthorPress?.(data.author.id);
  };

  const getPlatformColor = (platform?: string) => {
    switch (platform) {
      case 'tinder':
        return '#FF4458';
      case 'bumble':
        return '#FFD700';
      case 'hinge':
        return '#B24A85';
      default:
        return colors.primary;
    }
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case 'tinder':
        return 'flame';
      case 'bumble':
        return 'flower';
      case 'hinge':
        return 'heart';
      default:
        return 'chatbubbles';
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons
            key={i}
            name="star"
            size={12}
            color="#FFD700"
            style={styles.star}
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons
            key={i}
            name="star-half"
            size={12}
            color="#FFD700"
            style={styles.star}
          />
        );
      } else {
        stars.push(
          <Ionicons
            key={i}
            name="star-outline"
            size={12}
            color={colors.textTertiary}
            style={styles.star}
          />
        );
      }
    }
    
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderImage = () => {
    if (!data.images?.length) return null;

    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: data.images[0] }}
          style={styles.image}
          onLoad={() => setImageLoaded(true)}
          resizeMode="cover"
        />
        
        {!imageLoaded && (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="image-outline" size={24} color={colors.textTertiary} />
          </View>
        )}
        
        {data.images.length > 1 && (
          <View style={[styles.imageCount, { backgroundColor: colors.overlay }]}>
            <Ionicons name="images" size={12} color={colors.white} />
            <Text style={[styles.imageCountText, { color: colors.white }]}>
              {data.images.length}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderHeader = () => {
    if (!showAuthor && !data.platform) return null;

    return (
      <View style={styles.header}>
        {showAuthor && (
          <TouchableOpacity
            style={styles.authorInfo}
            onPress={handleAuthorPress}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              {data.author.avatar ? (
                <Image
                  source={{ uri: data.author.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.avatarText, { color: colors.white }]}>
                    {data.author.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              
              {data.author.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                </View>
              )}
            </View>
            
            <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
              {data.author.name}
            </Text>
          </TouchableOpacity>
        )}
        
        {data.platform && (
          <View style={[styles.platformBadge, { backgroundColor: getPlatformColor(data.platform) + '20' }]}>
            <Ionicons
              name={getPlatformIcon(data.platform)}
              size={12}
              color={getPlatformColor(data.platform)}
            />
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => (
    <View style={styles.content}>
      {/* Rating */}
      <View style={styles.ratingContainer}>
        {renderStars(data.rating)}
        <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
          {data.rating.toFixed(1)}
        </Text>
      </View>
      
      {/* Title */}
      <Text
        style={[
          typography.h4,
          styles.title,
          { color: colors.text }
        ]}
        numberOfLines={variant === 'compact' ? 2 : 3}
      >
        {data.title}
      </Text>
      
      {/* Content Preview */}
      <Text
        style={[
          typography.body,
          styles.contentText,
          { color: colors.textSecondary }
        ]}
        numberOfLines={variant === 'compact' ? 2 : variant === 'standard' ? 3 : 5}
      >
        {data.content}
      </Text>
      
      {/* Location */}
      {data.location && (
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
          <Text style={[styles.locationText, { color: colors.textTertiary }]} numberOfLines={1}>
            {data.location}
          </Text>
        </View>
      )}
    </View>
  );

  const renderTags = () => {
    if (!showTags || !data.tags?.length) return null;

    return (
      <View style={styles.tagsContainer}>
        {data.tags.slice(0, 3).map((tag, index) => (
          <View
            key={index}
            style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
          >
            <Text style={[styles.tagText, { color: colors.primary }]}>
              {tag}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderFooter = () => {
    if (!showStats) return null;

    return (
      <View style={styles.footer}>
        <Text style={[styles.timeText, { color: colors.textTertiary }]}>
          {data.createdAt}
        </Text>
        
        <TouchableOpacity
          style={styles.likeButton}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={16}
              color={isLiked ? colors.error : colors.textSecondary}
            />
          </Animated.View>
          
          {data.likes > 0 && (
            <Text style={[styles.likeCount, { color: colors.textSecondary }]}>
              {data.likes + (isLiked && !data.isLiked ? 1 : isLiked === data.isLiked ? 0 : -1)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            width: CARD_WIDTH,
          },
          SHADOWS.sm,
        ]}
        onPress={handlePress}
        activeOpacity={0.95}
      >
        {/* Glass overlay for premium feel */}
        <BlurView
          intensity={2}
          tint={isDark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFillObject, { borderRadius: BORDER_RADIUS.lg }]}
        />
        
        <View style={styles.cardContent}>
          {renderImage()}
          {renderHeader()}
          {renderContent()}
          {renderTags()}
          {renderFooter()}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: tokens.spacing.md,
    overflow: 'hidden',
  },
  cardContent: {
    padding: tokens.spacing.sm,
  },

  // Image styles
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: tokens.spacing.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  } as ImageStyle,
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCount: {
    position: 'absolute',
    top: tokens.spacing.xs,
    right: tokens.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  imageCountText: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.medium,
    marginLeft: 2,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.xs,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: tokens.spacing.xs,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.medium,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 6,
  },
  authorName: {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    flex: 1,
  },
  platformBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content styles
  content: {
    marginBottom: tokens.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: tokens.spacing.xs,
  },
  star: {
    marginRight: 1,
  },
  ratingText: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.medium,
  },
  title: {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.semibold,
    marginBottom: tokens.spacing.xs,
    lineHeight: tokens.lineHeight.sm * 1.1,
  },
  contentText: {
    fontSize: tokens.fontSize.xs,
    lineHeight: tokens.lineHeight.xs * 1.3,
    marginBottom: tokens.spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: tokens.fontSize.xs,
    marginLeft: 2,
    flex: 1,
  },

  // Tags styles
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: tokens.spacing.sm,
    gap: tokens.spacing.xs,
  },
  tag: {
    paddingHorizontal: tokens.spacing.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagText: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.medium,
  },

  // Footer styles
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.normal,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.xs,
  },
  likeCount: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.medium,
    marginLeft: 2,
  },
});

export default MasonryReviewCard;