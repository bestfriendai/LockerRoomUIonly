import React from 'react';
import {
  ViewStyle,
  StyleSheet,
  ActivityIndicator,
  View,
  Text
} from 'react-native';
import AnimatedPressable from './AnimatedPressable';
import { useTheme } from '../../providers/ThemeProvider';
import { SPACING } from '../../constants/spacing';
import { BORDER_RADIUS } from '../../constants/shadows';


type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'success';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  hapticOnPress?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  hapticOnPress = true,
  onPress,
  style,
  children,
  leftIcon,
  rightIcon,
  fullWidth = false,
}) => {
  // Handle cases where ThemeProvider might not be available (e.g., in ErrorBoundary)
  let colors;
  try {
    const theme = useTheme();
    colors = theme.colors;
  } catch {
    // Fallback colors when ThemeProvider is not available
    colors = {
      primary: '#007AFF',
      onPrimary: '#FFFFFF',
      secondary: '#5856D6',
      onSecondary: '#FFFFFF',
      tertiary: '#FF9500',
      onTertiary: '#FFFFFF',
      error: '#FF3B30',
      onError: '#FFFFFF',
      success: '#34C759',
      onSuccess: '#FFFFFF',
      warning: '#FF9500',
      onWarning: '#FFFFFF',
      surface: '#FFFFFF',
      onSurface: '#000000',
      surfaceElevated: '#F2F2F7',
      surfaceDisabled: '#f5f5f5',
      text: '#000000',
      textSecondary: '#3C3C43',
      textTertiary: '#C7C7CC',
      textDisabled: '#999999',
      border: '#C6C6C8',
      divider: '#C6C6C8',
      overlay: 'rgba(0, 0, 0, 0.4)',
      scrim: 'rgba(0, 0, 0, 0.6)',
      black: '#000000',
    };
  }

  // Calculate padding based on size
  const getPadding = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
        };
      case 'lg':
        return {
          paddingHorizontal: SPACING.xl,
          paddingVertical: SPACING.md,
        };
      default: // md
        return {
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.component - 4,
        };
    }
  };

  // Calculate minimum height based on size
  const getMinHeight = () => {
    switch (size) {
      case 'sm':
        return 36;
      case 'lg':
        return 56;
      default: // md
        return 48;
    }
  };

  // Calculate content gap based on size
  const getContentGap = () => {
    switch (size) {
      case 'sm':
        return SPACING.xs;
      case 'lg':
        return SPACING.sm;
      default: // md
        return SPACING.sm;
    }
  };



  // Calculate border radius based on size
  const getBorderRadius = () => {
    switch (size) {
      case 'sm':
        return BORDER_RADIUS.sm;
      case 'lg':
        return BORDER_RADIUS.lg;
      default: // md
        return BORDER_RADIUS.md;
    }
  };

  // Get background color based on variant and state
  const getBackgroundColor = () => {
    if (disabled) {
      return colors.surfaceDisabled;
    }

    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.surface;
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      case 'destructive':
        return colors.error;
      case 'success':
        return colors.success;
      default:
        return colors.primary;
    }
  };

  // Get border color based on variant and state
  const getBorderColor = () => {
    if (disabled) {
      return colors.border;
    }

    switch (variant) {
      case 'outline':
        return colors.border;
      case 'secondary':
        return colors.border;
      default:
        return 'transparent';
    }
  };

  // Get text color based on variant and state
  const getTextColor = () => {
    if (disabled) {
      return colors.textDisabled;
    }

    switch (variant) {
      case 'primary':
      case 'destructive':
      case 'success':
        return colors.onPrimary;
      case 'secondary':
      case 'outline':
      case 'ghost':
        return colors.text;
      default:
        return colors.onPrimary;
    }
  };

  // Get shadow style based on variant
  const getShadowStyle = () => {
    if (disabled || variant === 'ghost' || variant === 'outline') {
      return {};
    }

    return {
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    };
  };

  const buttonStyle: ViewStyle = {
    ...getPadding(),
    minHeight: getMinHeight(),
    borderRadius: getBorderRadius(),
    backgroundColor: getBackgroundColor(),
    borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
    borderColor: getBorderColor(),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getContentGap(),
    ...getShadowStyle(),
    ...(fullWidth && { width: '100%' }),
  };

  const textColor = getTextColor();

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size={size === 'sm' ? 'small' : 'small'}
            color={textColor}
          />
          {typeof children === 'string' && (
            <Text
              style={[styles.loadingText, { color: textColor }]}
            >
              {children}
            </Text>
          )}
        </View>
      );
    }

    return (
      <>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        {typeof children === 'string' ? (
          <Text style={{ color: textColor }}>
            {children}
          </Text>
        ) : (
          children
        )}
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </>
    );
  };

  return (
    <AnimatedPressable
      style={[buttonStyle, ...(style ? [style] : [])].flat()}
      onPress={onPress}
      disabled={disabled || loading}
      hapticOnPress={hapticOnPress}
      scaleTo={0.96}
    >
      {renderContent()}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  loadingText: {
    opacity: 0.8,
  },
});