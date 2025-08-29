import React from 'react';
import {
  ViewStyle,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { Text } from './Text';
import { useTheme } from '../../providers/ThemeProvider';
import { SPACING } from '../../constants/spacing';
import { BORDER_RADIUS } from '../../constants/shadows';
import { tokens } from '../../constants/tokens';

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
  const { colors, isDark } = useTheme();

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

  // Calculate text size based on size
  const getTextVariant = () => {
    switch (size) {
      case 'sm':
        return 'buttonSmall' as const;
      default:
        return 'button' as const;
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
        return colors.white;
      case 'secondary':
      case 'outline':
      case 'ghost':
        return colors.text;
      default:
        return colors.white;
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
  const textVariant = getTextVariant();

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
              variant={textVariant}
              color={textColor as any}
              style={styles.loadingText}
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
          <Text variant={textVariant} color={textColor as any}>
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