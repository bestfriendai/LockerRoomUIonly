/**
 * Enhanced Button Component with Gradient Support
 * Modern button with animations and haptic feedback
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/utils/colors';
import { typography, textStyles } from '@/utils/typography';
import { spacing, borderRadius, shadows } from '@/utils/spacing';

interface EnhancedButtonProps {
  onPress: () => void;
  children?: React.ReactNode;
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
  haptic?: boolean;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  onPress,
  children,
  title,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  gradient = true,
  haptic = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (haptic && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const sizeStyles = {
    sm: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      minHeight: 32,
    },
    md: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      minHeight: 44,
    },
    lg: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      minHeight: 52,
    },
    xl: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing['2xl'],
      minHeight: 60,
    },
  };

  const textSizes = {
    sm: typography.fontSize.sm,
    md: typography.fontSize.base,
    lg: typography.fontSize.lg,
    xl: typography.fontSize.xl,
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  };

  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return gradient
          ? [colors.primary[500], colors.primary[600]]
          : [colors.primary[500], colors.primary[500]];
      case 'secondary':
        return [colors.neutral[700], colors.neutral[800]];
      case 'danger':
        return gradient
          ? [colors.error.main, colors.error.dark]
          : [colors.error.main, colors.error.main];
      case 'outline':
      case 'ghost':
        return ['transparent', 'transparent'];
      default:
        return [colors.primary[500], colors.primary[600]];
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'outline':
        return colors.primary[500];
      case 'ghost':
        return colors.neutral[400];
      default:
        return 'white';
    }
  };

  const buttonStyle = [
    styles.button,
    sizeStyles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    variant === 'outline' && styles.outline,
    style,
  ];

  const textStyles = [
    styles.text,
    {
      fontSize: textSizes[size],
      color: getTextColor(),
    },
    textStyle,
  ];

  const content = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={iconSizes[size]}
              color={getTextColor()}
              style={styles.leftIcon}
            />
          )}
          {children || <Text style={textStyles}>{title}</Text>}
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={iconSizes[size]}
              color={getTextColor()}
              style={styles.rightIcon}
            />
          )}
        </>
      )}
    </>
  );

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        fullWidth && styles.fullWidth,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={({ pressed }) => [
          buttonStyle,
          pressed && styles.pressed,
        ]}
      >
        {variant === 'outline' || variant === 'ghost' ? (
          <View style={styles.content}>{content}</View>
        ) : (
          <LinearGradient
            colors={getButtonColors()}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.content}>{content}</View>
          </LinearGradient>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  outline: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  pressed: {
    opacity: 0.9,
  },
});

export default EnhancedButton;