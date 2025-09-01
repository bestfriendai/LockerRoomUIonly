import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing
} from 'react-native';

import { MotiView } from 'moti';
import { useTheme } from '../../providers/ThemeProvider';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';

// Spinning loader with customizable size and color
export interface SpinnerProps {
  size?: number;
  color?: string;
  style?: any;
}

export function Spinner({ size = 24, color, style }: SpinnerProps) {
  const { colors } = useTheme();
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => spin());
    };
    spin();
  }, [spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ rotate }],
        },
        style,
      ]}
    >
      <Ionicons name="refresh" size={size} color={color || colors.primary} />
    </Animated.View>
  );
}

// Pulsing dots loader
export interface PulsingDotsProps {
  count?: number;
  size?: number;
  color?: string;
  style?: any;
}

export function PulsingDots({ count = 3, size = 8, color, style }: PulsingDotsProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.dotsContainer, style]}>
      {Array.from({ length: count }, (_, index) => (
        <MotiView
          key={index}
          from={{ opacity: 0.3, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'timing',
            duration: 600,
            delay: index * 200,
            loop: true,
            repeatReverse: true,
          }}
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color || colors.primary,
            },
          ]}
        />
      ))}
    </View>
  );
}

// Breathing animation for loading states
export interface BreathingLoaderProps {
  children: React.ReactNode;
  isLoading?: boolean;
  style?: any;
}

export function BreathingLoader({ children, isLoading = true, style }: BreathingLoaderProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <MotiView
      from={{ opacity: 0.6, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'timing',
        duration: 1500,
        loop: true,
        repeatReverse: true,
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
}

// Shimmer effect for skeleton loading
export interface ShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Shimmer({ width = '100%', height = 20, borderRadius = 4, style }: ShimmerProps) {
  const { colors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surface,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius,
            opacity: shimmerOpacity,
          },
        ]}
      />
    </View>
  );
}

// Wave loading animation
export interface WaveLoaderProps {
  count?: number;
  size?: number;
  color?: string;
  style?: any;
}

export function WaveLoader({ count = 5, size = 4, color, style }: WaveLoaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.waveContainer, style]}>
      {Array.from({ length: count }, (_, index) => (
        <MotiView
          key={index}
          from={{ scaleY: 0.4 }}
          animate={{ scaleY: 1 }}
          transition={{
            type: 'timing',
            duration: 400,
            delay: index * 100,
            loop: true,
            repeatReverse: true,
          }}
          style={[
            styles.waveBars,
            {
              width: size,
              backgroundColor: color || colors.primary,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    marginHorizontal: 2,
  },
  dotsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  waveBars: {
    borderRadius: 2,
    height: '100%',
    marginHorizontal: 1,
  },
  waveContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 20,
    justifyContent: 'center',
  },
});
