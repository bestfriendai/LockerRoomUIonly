import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

// Base skeleton component with shimmer animation
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: isDark ? colors.surfaceElevated : colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Review card skeleton
export const ReviewCardSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const randomHeight = Math.floor(Math.random() * 100) + 150;

  return (
    <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
      <View style={styles.reviewHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.reviewHeaderText}>
          <Skeleton width={120} height={16} />
          <Skeleton width={80} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <Skeleton width="100%" height={randomHeight} borderRadius={8} style={{ marginTop: 12 }} />
      <View style={styles.reviewFooter}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={100} height={16} />
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  masonryCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  masonryContent: {
    padding: 12,
  },
  masonryFooter: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  chatRoom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chatRoomLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  chatRoomContent: {
    marginLeft: 12,
    flex: 1,
  },
  chatRoomMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  message: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '70%',
  },
  userResult: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  discoverGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  discoverColumn: {
    width: '50%',
    paddingHorizontal: 4,
  },
  searchResults: {
    padding: 16,
  },
  chatMessages: {
    flex: 1,
    paddingVertical: 16,
  },
  profile: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileStats: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 32,
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