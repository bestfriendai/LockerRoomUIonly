import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  View,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../providers/ThemeProvider';
import { BORDER_RADIUS, SHADOWS } from '../../constants/shadows';
import { tokens } from '../../constants/tokens';
import { createTypographyStyles } from '../../styles/typography';

interface ModernButtonProps {
  variant?: 'gradient' | 'glass' | 'neumorphic' | 'outline' | 'ghost' | 'solid';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  variant = 'gradient',
  size = 'md',
  onPress,
  children,
  disabled = false,
  loading = false,
  icon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled || loading) return;
    // Haptic feedback for better user experience
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: tokens.spacing.md,
          paddingVertical: tokens.spacing.xs,
          minHeight: 36,
          borderRadius: BORDER_RADIUS.md,
        };
      case 'lg':
        return {
          paddingHorizontal: tokens.spacing.xl,
          paddingVertical: tokens.spacing.md,
          minHeight: 52,
          borderRadius: BORDER_RADIUS.lg,
        };
      case 'xl':
        return {
          paddingHorizontal: tokens.spacing['2xl'],
          paddingVertical: tokens.spacing.lg,
          minHeight: 60,
          borderRadius: BORDER_RADIUS.xl,
        };
      default: // md
        return {
          paddingHorizontal: tokens.spacing.lg,
          paddingVertical: tokens.spacing.sm,
          minHeight: 44,
          borderRadius: BORDER_RADIUS.lg,
        };
    }
  };

  const getTextSize = () => {
    const typography = createTypographyStyles(colors);
    switch (size) {
      case 'sm':
        return {
          fontSize: tokens.fontSize.sm,
          fontWeight: tokens.fontWeight.medium,
          letterSpacing: tokens.letterSpacing.wide,
        };
      case 'lg':
      case 'xl':
        return {
          fontSize: tokens.fontSize.lg,
          fontWeight: tokens.fontWeight.semibold,
          letterSpacing: tokens.letterSpacing.wide,
        };
      default:
        return typography.button;
    }
  };

  const getButtonContent = () => {
    const sizeStyles = getSizeStyles();
    const textSize = getTextSize();
    const contentStyle = [styles.buttonBase, sizeStyles];

    switch (variant) {
      case 'gradient':
        return (
          <LinearGradient
            colors={[
              colors.primary,
              '#E91E63', // Pink accent for modern gradient
              colors.primaryHover
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[contentStyle, SHADOWS.md]}
          >
            {renderButtonContent(textSize, colors.white)}
          </LinearGradient>
        );

      case 'glass':
        return (
          <BlurView 
            intensity={30} 
            tint={isDark ? 'dark' : 'light'}
            style={[contentStyle, styles.glassButton, { borderColor: colors.border }, SHADOWS.sm]}
          >
            <View style={[styles.glassOverlay, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)' }]} />
            {renderButtonContent(textSize, colors.text)}
          </BlurView>
        );

      case 'neumorphic':
        return (
          <View 
            style={[
              contentStyle, 
              styles.neumorphicButton, 
              { backgroundColor: colors.surface },
              SHADOWS.md,
              {
                shadowColor: isDark ? colors.white : colors.black,
                shadowOpacity: isDark ? 0.05 : 0.1,
              }
            ]}
          >
            {renderButtonContent(textSize, colors.text)}
          </View>
        );

      case 'outline':
        return (
          <View 
            style={[
              contentStyle, 
              styles.outlineButton, 
              { borderColor: colors.primary, backgroundColor: 'transparent' }
            ]}
          >
            {renderButtonContent(textSize, colors.primary)}
          </View>
        );

      case 'ghost':
        return (
          <View 
            style={[
              contentStyle, 
              { backgroundColor: 'transparent' }
            ]}
          >
            {renderButtonContent(textSize, colors.primary)}
          </View>
        );

      default: // solid
        return (
          <View 
            style={[
              contentStyle, 
              { backgroundColor: colors.primary },
              SHADOWS.sm
            ]}
          >
            {renderButtonContent(textSize, colors.white)}
          </View>
        );
    }
  };

  const renderButtonContent = (textSize: any, textColor: string) => (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={textColor} 
          style={icon ? styles.iconSpacing : undefined}
        />
      ) : (
        icon && <View style={styles.iconSpacing}>{icon}</View>
      )}
      
      <Text 
        style={[
          textSize, 
          { color: textColor }, 
          disabled && styles.disabledText,
          textStyle
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
      
      {rightIcon && <View style={styles.rightIconSpacing}>{rightIcon}</View>}
    </View>
  );

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading }}
        testID={testID}
      >
        {getButtonContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSpacing: {
    marginRight: tokens.spacing.xs,
  },
  rightIconSpacing: {
    marginLeft: tokens.spacing.xs,
  },
  glassButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  neumorphicButton: {
    shadowColor: '#000',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  outlineButton: {
    borderWidth: 2,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default ModernButton;
