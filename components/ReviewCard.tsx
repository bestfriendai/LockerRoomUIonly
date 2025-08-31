import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Share,
  ViewStyle
} from 'react-native';

import { Image } from "expo-image";
import { MessageCircle, ThumbsUp, MapPin, Clock, Share2 } from "lucide-react-native";
import { MotiView } from "moti";
import Card from "@/components/ui/Card";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import { useTheme } from "@/providers/ThemeProvider";
import { SHADOWS } from "@/constants/shadows";
import { tokens } from "@/constants/tokens";
import type { Review } from "@/types";

type ReviewCardProps = {
  review: Review;
  onPress: () => void;
  style?: ViewStyle;
};

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onPress, style }) => {
  const { colors, tokens } = useTheme();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(review.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const hasImages = review.media && review.media.length > 0;
  
  // Create styles with current tokens
  const styles = createStyles();

  const handlePress = () => {
    onPress();
  };

  const handleLikePress = async (e: any) => {
    e.stopPropagation();
    
    if (isLiking) return;
    
    try {
      setIsLiking(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Optimistic UI update
      const newLiked = !isLiked;
      setIsLiked(newLiked);
      setLikeCount((prev: number) => newLiked ? prev + 1 : Math.max(0, prev - 1));
      
    } catch (error: any) {
      if (__DEV__) {
        console.error('Error liking review:', error);
      }
      Alert.alert('Error', 'Failed to update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleShare = async (e: any) => {
    e.stopPropagation();
    
    if (isSharing) return;
    
    try {
      setIsSharing(true);
      
      const shareContent = {
        message: `Check out this review: "${review.title}" - Rating: 5/5 stars`,
        title: review.title,
      };
      
      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        if (__DEV__) {
          console.log('Share tracked:', {
          reviewId: review.id,
          platform: result.activityType || 'native_share',
        });
        }
      }
    } catch (error: any) {
      if (__DEV__) {
        console.error('Error sharing review:', error);
      }
      Alert.alert('Error', 'Failed to share. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      exit={{ opacity: 0, translateY: -10, scale: 0.98 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 200,
        mass: 0.8,
      }}
      style={[{ margin: tokens.spacing.sm, flex: 1 }, style]}
    >
      <Card
        onPress={handlePress}
        hapticOnPress={false}
        padding={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={{ color: colors.textSecondary }}>
              {/* This should be replaced with actual author name */}
              Anonymous
            </Text>
            <View style={styles.metaContainer}>
              <View
                style={[styles.categoryPill, {
                  backgroundColor: colors.chipBg,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.chipBorder,
                }]}
              >
                <Text style={{
                  color: colors.chipText,
                  letterSpacing: 0.3,
                  fontWeight: '600',
                }}>
                  {(review.category || 'GENERAL').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Image */}
        {hasImages && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: review.media![0] }}
              style={styles.image}
              contentFit="cover"
              placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj' }}
              transition={200}
            />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text style={{
            color: colors.text,
            marginBottom: 8,
            lineHeight: 22,
          }} numberOfLines={2}>
            {review.title || 'Review'}
          </Text>

          <Text style={{
              color: colors.textSecondary,
              lineHeight: 20,
              marginBottom: 12
            }}
            numberOfLines={hasImages ? 2 : 3}
          >
            {review.content}
          </Text>

          {/* Badges with enhanced styling */}
          <View style={styles.badges}>
            {/* Badges are not part of the Firestore data model yet */}
          </View>
        </View>

        {/* Footer with enhanced interactions */}
        <View style={[styles.footer, { borderTopColor: colors.divider }]}>
          <View style={styles.footerLeft}>
            <AnimatedPressable
              onPress={handleLikePress}
              style={styles.footerItem}
              hapticOnPress={false}
              scaleTo={0.95}
            >
              <ThumbsUp
                size={12}
                color={isLiked ? colors.primary : colors.textSecondary}
                fill={isLiked ? colors.primary : 'transparent'}
                strokeWidth={1.5}
              />
              <Text style={{
                marginLeft: 4,
                color: isLiked ? colors.primary : colors.textSecondary,
                fontWeight: isLiked ? '600' : '400',
              }}>
                {likeCount}
              </Text>
            </AnimatedPressable>

            <View style={styles.footerItem}>
              <MessageCircle size={12} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={{ marginLeft: 4, color: colors.textSecondary }}>
                {review.comments?.length || 0}
              </Text>
            </View>

            <AnimatedPressable
              onPress={handleShare}
              style={[styles.footerItem, { opacity: isSharing ? 0.6 : 1 }]}
              hapticOnPress={false}
              scaleTo={0.95}
              disabled={isSharing}
            >
              <Share2 size={12} color={colors.textSecondary} strokeWidth={1.5} />
            </AnimatedPressable>

            <View style={styles.footerItem}>
              <MapPin size={12} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={{ marginLeft: 4, color: colors.textSecondary }}>
                {/* Location is not part of the Firestore data model yet */}
                Unknown
              </Text>
            </View>
          </View>

          <View style={styles.footerRight}>
            <Clock size={12} color={colors.textSecondary} strokeWidth={1.5} />
            <Text style={{ marginLeft: 4, color: colors.textSecondary }}>
              2d ago
            </Text>
          </View>
        </View>
      </Card>
    </MotiView>
  );
};

// Create styles using imported tokens
const createStyles = () => StyleSheet.create({
  badge: {
    borderRadius: tokens.radii.full,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    ...SHADOWS.xs,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.xs,
  },
  categoryPill: {
    borderRadius: tokens.radii.full,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    ...SHADOWS.xs,
  },
  content: {
    flex: 1,
    paddingBottom: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
  },
  footer: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  },
  footerItem: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 32,
    paddingVertical: 4,
  },
  footerLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: tokens.spacing.lg,
  },
  footerRight: {
    alignItems: "center",
    flexDirection: "row",
  },
  header: {
    paddingBottom: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  image: {
    height: 160,
    width: "100%",
  },
  imageContainer: {
    borderRadius: tokens.radii.lg,
    marginBottom: tokens.spacing.md,
    marginHorizontal: tokens.spacing.lg,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  metaContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.xs,
  },
});

export default ReviewCard;