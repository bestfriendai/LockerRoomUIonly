import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, borderRadius } from '../../utils/spacing';
import { createPulseAnimation } from '../../utils/animations';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius: borderRadiusValue = 4,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    createPulseAnimation(pulseAnim).start();
  }, []);

  const shimmerColors = isDark
    ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']
    : ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.05)'];

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: borderRadiusValue,
          opacity: pulseAnim,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={shimmerColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          flex: 1,
          borderRadius: borderRadiusValue,
        }}
      />
    </Animated.View>
  );
};

// Card Loading Skeleton
export const CardLoadingSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.cardSkeleton, style]}>
      <LoadingSkeleton height={120} borderRadius={borderRadius.lg} />
      <View style={styles.cardContent}>
        <LoadingSkeleton height={20} width="80%" />
        <LoadingSkeleton height={16} width="100%" style={{ marginTop: spacing.xs }} />
        <LoadingSkeleton height={16} width="60%" style={{ marginTop: spacing.xs }} />
        <View style={styles.cardFooter}>
          <LoadingSkeleton height={14} width="40%" />
          <LoadingSkeleton height={14} width="30%" />
        </View>
      </View>
    </View>
  );
};

// List Loading Skeleton
export const ListLoadingSkeleton: React.FC<{ 
  itemCount?: number; 
  style?: ViewStyle;
}> = ({ itemCount = 5, style }) => {
  return (
    <View style={style}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <LoadingSkeleton width={50} height={50} borderRadius={borderRadius.full} />
          <View style={styles.listItemContent}>
            <LoadingSkeleton height={18} width="70%" />
            <LoadingSkeleton height={14} width="50%" style={{ marginTop: spacing.xs }} />
          </View>
        </View>
      ))}
    </View>
  );
};

// Profile Loading Skeleton
export const ProfileLoadingSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.profileSkeleton, style]}>
      {/* Avatar */}
      <LoadingSkeleton width={80} height={80} borderRadius={borderRadius.full} />
      
      {/* Name and bio */}
      <View style={styles.profileInfo}>
        <LoadingSkeleton height={24} width="60%" />
        <LoadingSkeleton height={16} width="80%" style={{ marginTop: spacing.sm }} />
        <LoadingSkeleton height={16} width="70%" style={{ marginTop: spacing.xs }} />
      </View>
      
      {/* Stats */}
      <View style={styles.profileStats}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.statItem}>
            <LoadingSkeleton height={20} width={40} />
            <LoadingSkeleton height={14} width={60} style={{ marginTop: spacing.xs }} />
          </View>
        ))}
      </View>
    </View>
  );
};

// Masonry Grid Loading Skeleton
export const MasonryLoadingSkeleton: React.FC<{ 
  columns?: number;
  itemCount?: number;
  style?: ViewStyle;
}> = ({ columns = 2, itemCount = 6, style }) => {
  const getRandomHeight = () => Math.floor(Math.random() * 100) + 200;

  return (
    <View style={[styles.masonryContainer, style]}>
      {Array.from({ length: columns }).map((_, columnIndex) => (
        <View key={columnIndex} style={styles.masonryColumn}>
          {Array.from({ length: Math.ceil(itemCount / columns) }).map((_, itemIndex) => {
            const globalIndex = columnIndex * Math.ceil(itemCount / columns) + itemIndex;
            if (globalIndex >= itemCount) return null;
            
            return (
              <View key={itemIndex} style={styles.masonryItem}>
                <LoadingSkeleton 
                  height={getRandomHeight()} 
                  borderRadius={borderRadius.lg}
                />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

// Shimmer Loading Effect
export const ShimmerLoading: React.FC<{
  children: React.ReactNode;
  isLoading: boolean;
  style?: ViewStyle;
}> = ({ children, isLoading, style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const { isDark } = useTheme();

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isLoading]);

  if (!isLoading) {
    return <>{children}</>;
  }

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <View style={[styles.shimmerContainer, style]}>
      {children}
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={
            isDark
              ? ['transparent', 'rgba(255,255,255,0.1)', 'transparent']
              : ['transparent', 'rgba(255,255,255,0.8)', 'transparent']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
};

// Pulse Loading Indicator
export const PulseLoading: React.FC<{
  size?: number;
  color?: string;
  style?: ViewStyle;
}> = ({ size = 40, color, style }) => {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color || colors.primary,
          transform: [{ scale: pulseAnim }],
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  cardSkeleton: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardContent: {
    marginTop: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  listItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileSkeleton: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: spacing.lg,
    width: '100%',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  masonryContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  masonryColumn: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  masonryItem: {
    marginBottom: spacing.md,
  },
  shimmerContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    flex: 1,
  },
});

export default {
  LoadingSkeleton,
  CardLoadingSkeleton,
  ListLoadingSkeleton,
  ProfileLoadingSkeleton,
  MasonryLoadingSkeleton,
  ShimmerLoading,
  PulseLoading,
};
