import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../providers/ThemeProvider';
import { tokens } from '../../constants/tokens';
import { BORDER_RADIUS, SHADOWS } from '../../constants/shadows';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const { width: screenWidth } = Dimensions.get('window');

// Enhanced shimmer skeleton with gradient effect
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BORDER_RADIUS.sm,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const animatedValue = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: tokens.duration.slower * 3, // 1500ms
        useNativeDriver: false,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [-1, 1],
    outputRange: [-screenWidth, screenWidth],
  });

  const baseColor = isDark ? '#1F2937' : '#F3F4F6';
  const shimmerColor = isDark ? '#374151' : '#FFFFFF';

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            shimmerColor,
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
};

// Enhanced review card skeleton with proper design tokens
export const ReviewCardSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const randomHeight = Math.floor(Math.random() * 100) + 150;

  return (
    <View style={[styles.reviewCard, { backgroundColor: colors.card }, SHADOWS.sm]}>
      {/* Profile section */}
      <View style={styles.reviewHeader}>
        <Skeleton width={40} height={40} borderRadius={BORDER_RADIUS.full} />
        <View style={styles.reviewHeaderText}>
          <Skeleton width={120} height={tokens.fontSize.base} borderRadius={BORDER_RADIUS.sm} />
          <Skeleton width={80} height={tokens.fontSize.sm} borderRadius={BORDER_RADIUS.sm} style={{ marginTop: tokens.spacing['1'] }} />
        </View>
      </View>

      {/* Rating section */}
      <View style={styles.ratingSection}>
        <Skeleton width={80} height={tokens.fontSize.sm} borderRadius={BORDER_RADIUS.sm} />
      </View>

      {/* Content */}
      <Skeleton width="100%" height={randomHeight} borderRadius={BORDER_RADIUS.md} style={{ marginTop: tokens.spacing.sm }} />
      
      {/* Tags */}
      <View style={styles.tagsSection}>
        <Skeleton width={50} height={20} borderRadius={BORDER_RADIUS.lg} />
        <Skeleton width={60} height={20} borderRadius={BORDER_RADIUS.lg} style={{ marginLeft: tokens.spacing.xs }} />
        <Skeleton width={45} height={20} borderRadius={BORDER_RADIUS.lg} style={{ marginLeft: tokens.spacing.xs }} />
      </View>
      
      {/* Footer */}
      <View style={styles.reviewFooter}>
        <Skeleton width={100} height={tokens.fontSize.sm} borderRadius={BORDER_RADIUS.sm} />
        <Skeleton width={60} height={tokens.fontSize.xs} borderRadius={BORDER_RADIUS.sm} />
      </View>
    </View>
  );
};

// Masonry review skeleton for discover feed
export const MasonryReviewSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const randomHeight = Math.floor(Math.random() * 120) + 180;

  return (
    <View style={[styles.masonryCard, { backgroundColor: colors.card }]}>
      <Skeleton width="100%" height={randomHeight} borderRadius={12} />
      <View style={styles.masonryContent}>
        <Skeleton width="70%" height={18} />
        <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
        <Skeleton width="90%" height={14} style={{ marginTop: 4 }} />
        <View style={styles.masonryFooter}>
          <Skeleton width={50} height={20} borderRadius={10} />
          <Skeleton width={60} height={20} borderRadius={10} />
        </View>
      </View>
    </View>
  );
};

// Chat room skeleton
export const ChatRoomSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.chatRoom, { borderBottomColor: colors.border }]}>
      <View style={styles.chatRoomLeft}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={styles.chatRoomContent}>
          <Skeleton width={140} height={18} />
          <Skeleton width={200} height={14} style={{ marginTop: 6 }} />
          <View style={styles.chatRoomMeta}>
            <Skeleton width={60} height={12} />
            <Skeleton width={40} height={12} />
          </View>
        </View>
      </View>
      <Skeleton width={60} height={32} borderRadius={16} />
    </View>
  );
};

// Message skeleton for chat screen
export const MessageSkeleton: React.FC<{ isOwn?: boolean }> = ({ isOwn = false }) => {
  const { colors } = useTheme();
  const messageWidth = Math.floor(Math.random() * 100) + 100;

  return (
    <View style={[styles.message, isOwn && styles.ownMessage]}>
      {!isOwn && <Skeleton width={32} height={32} borderRadius={16} />}
      <View style={[
        styles.messageBubble,
        { 
          backgroundColor: isOwn ? colors.primary + '20' : colors.surfaceElevated,
          marginLeft: isOwn ? 'auto' : 8,
          marginRight: isOwn ? 0 : 'auto',
        }
      ]}>
        <Skeleton width={messageWidth} height={16} />
        <Skeleton width={40} height={10} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
};

// User search result skeleton
export const UserResultSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.userResult, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={styles.userInfo}>
        <Skeleton width={120} height={18} />
        <Skeleton width={180} height={14} style={{ marginTop: 6 }} />
        <View style={styles.userStats}>
          <Skeleton width={60} height={12} />
          <Skeleton width={40} height={12} />
        </View>
      </View>
    </View>
  );
};

// Discover feed skeleton loader
export const DiscoverFeedSkeleton: React.FC = () => {
  return (
    <View style={styles.discoverGrid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View key={index} style={styles.discoverColumn}>
          <MasonryReviewSkeleton />
        </View>
      ))}
    </View>
  );
};

// Search results skeleton loader
export const SearchResultsSkeleton: React.FC<{ type: 'reviews' | 'users' | 'rooms' }> = ({ type }) => {
  return (
    <View style={styles.searchResults}>
      {type === 'reviews' && Array.from({ length: 4 }).map((_, i) => (
        <ReviewCardSkeleton key={i} />
      ))}
      {type === 'users' && Array.from({ length: 5 }).map((_, i) => (
        <UserResultSkeleton key={i} />
      ))}
      {type === 'rooms' && Array.from({ length: 5 }).map((_, i) => (
        <ChatRoomSkeleton key={i} />
      ))}
    </View>
  );
};

// Chat messages skeleton loader
export const ChatMessagesSkeleton: React.FC = () => {
  return (
    <View style={styles.chatMessages}>
      <MessageSkeleton />
      <MessageSkeleton isOwn />
      <MessageSkeleton />
      <MessageSkeleton />
      <MessageSkeleton isOwn />
      <MessageSkeleton isOwn />
      <MessageSkeleton />
    </View>
  );
};

// Profile skeleton
export const ProfileSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.profile}>
      <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
        <Skeleton width={100} height={100} borderRadius={50} />
        <Skeleton width={150} height={24} style={{ marginTop: 16 }} />
        <Skeleton width={200} height={16} style={{ marginTop: 8 }} />
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Skeleton width={40} height={24} />
            <Skeleton width={60} height={14} style={{ marginTop: 4 }} />
          </View>
          <View style={styles.profileStat}>
            <Skeleton width={40} height={24} />
            <Skeleton width={60} height={14} style={{ marginTop: 4 }} />
          </View>
          <View style={styles.profileStat}>
            <Skeleton width={40} height={24} />
            <Skeleton width={60} height={14} style={{ marginTop: 4 }} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reviewCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
  },
  ratingSection: {
    marginTop: tokens.spacing.sm,
    marginBottom: tokens.spacing.xs,
  },
  tagsSection: {
    flexDirection: 'row',
    marginTop: tokens.spacing.sm,
    marginBottom: tokens.spacing.xs,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewHeaderText: {
    marginLeft: tokens.spacing.sm,
    flex: 1,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tokens.spacing.sm,
  },
  masonryCard: {
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: tokens.spacing.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  masonryContent: {
    padding: tokens.spacing.sm,
  },
  masonryFooter: {
    flexDirection: 'row',
    gap: tokens.spacing.xs,
    marginTop: tokens.spacing.sm,
  },
  chatRoom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chatRoomLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  chatRoomContent: {
    marginLeft: tokens.spacing.sm,
    flex: 1,
  },
  chatRoomMeta: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing['1.5'],
  },
  message: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.md,
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    borderRadius: BORDER_RADIUS.xl,
    padding: tokens.spacing.sm,
    maxWidth: '70%',
  },
  userResult: {
    flexDirection: 'row',
    padding: tokens.spacing.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: tokens.spacing.xs,
    ...SHADOWS.xs,
  },
  userInfo: {
    marginLeft: tokens.spacing.sm,
    flex: 1,
  },
  userStats: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.xs,
  },
  discoverGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: tokens.spacing.md,
  },
  discoverColumn: {
    width: '50%',
    paddingHorizontal: tokens.spacing['1'],
  },
  searchResults: {
    padding: tokens.spacing.md,
  },
  chatMessages: {
    flex: 1,
    paddingVertical: tokens.spacing.md,
  },
  profile: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: tokens.spacing['6'],
    borderBottomLeftRadius: tokens.spacing['6'],
    borderBottomRightRadius: tokens.spacing['6'],
    ...SHADOWS.sm,
  },
  profileStats: {
    flexDirection: 'row',
    marginTop: tokens.spacing['6'],
    gap: tokens.spacing['8'],
  },
  profileStat: {
    alignItems: 'center',
  },
});

export default {
  Skeleton,
  ReviewCardSkeleton,
  MasonryReviewSkeleton,
  ChatRoomSkeleton,
  MessageSkeleton,
  UserResultSkeleton,
  DiscoverFeedSkeleton,
  SearchResultsSkeleton,
  ChatMessagesSkeleton,
  ProfileSkeleton,
};