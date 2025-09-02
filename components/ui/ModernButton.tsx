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
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, borderRadius, shadows } from '../../utils/spacing';
import { textStyles } from '../../utils/typography';
import { createSpringAnimation, createScaleAnimation } from '../../utils/animations';

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

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    Animated.parallel([
      createSpringAnimation(scaleAnim, 0.95),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    Animated.parallel([
      createSpringAnimation(scaleAnim, 1),
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
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          minHeight: 36,
          borderRadius: borderRadius.md,
        };
      case 'lg':
        return {
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          minHeight: 52,
          borderRadius: borderRadius.lg,
        };
      case 'xl':
        return {
          paddingHorizontal: spacing['2xl'],
          paddingVertical: spacing.lg,
          minHeight: 60,
          borderRadius: borderRadius.xl,
        };
      default: // md
        return {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          minHeight: 44,
          borderRadius: borderRadius.lg,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return textStyles.buttonSmall;
      case 'lg':
      case 'xl':
        return textStyles.buttonLarge;
      default:
        return textStyles.button;
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
            colors={[colors.primary, colors.primary + 'DD']}
            style={contentStyle}
          >
            {renderButtonContent(textSize, colors.white)}
          </LinearGradient>
        );

      case 'glass':
        return (
          <BlurView 
            intensity={20} 
            style={[contentStyle, styles.glassButton, { borderColor: colors.border }]}
          >
            <View style={styles.glassOverlay} />
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
              shadows.md
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
              shadows.sm
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
        onPress={onPress}
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
    marginRight: spacing.xs,
  },
  rightIconSpacing: {
    marginLeft: spacing.xs,
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
