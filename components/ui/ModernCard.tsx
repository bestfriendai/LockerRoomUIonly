import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, borderRadius, shadows } from '../../utils/spacing';
import { createSpringAnimation } from '../../utils/animations';

interface ModernCardProps {
  variant?: 'elevated' | 'glass' | 'gradient' | 'neumorphic' | 'outline' | 'flat';
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  padding?: keyof typeof spacing | number;
  shadow?: keyof typeof shadows;
  borderRadius?: keyof typeof borderRadius | number;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  testID?: string;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  variant = 'elevated',
  children,
  onPress,
  style,
  contentStyle,
  padding = 'lg',
  shadow = 'md',
  borderRadius: borderRadiusProp = 'xl',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  testID,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || !onPress) return;
    
    Animated.parallel([
      createSpringAnimation(scaleAnim, 0.98),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || !onPress) return;
    
    Animated.parallel([
      createSpringAnimation(scaleAnim, 1),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getPaddingValue = () => {
    if (typeof padding === 'number') {
      return padding;
    }
    return spacing[padding] || spacing.lg;
  };

  const getBorderRadiusValue = () => {
    if (typeof borderRadiusProp === 'number') {
      return borderRadiusProp;
    }
    return borderRadius[borderRadiusProp] || borderRadius.xl;
  };

  const getShadowStyle = () => {
    if (variant === 'flat' || variant === 'outline') {
      return {};
    }
    return shadows[shadow] || shadows.md;
  };

  const getCardContent = () => {
    const paddingValue = getPaddingValue();
    const borderRadiusValue = getBorderRadiusValue();
    const shadowStyle = getShadowStyle();
    
    const baseStyle = [
      styles.cardBase,
      {
        borderRadius: borderRadiusValue,
        padding: paddingValue,
      },
      shadowStyle,
    ];

    switch (variant) {
      case 'glass':
        return (
          <BlurView 
            intensity={20} 
            style={[
              baseStyle,
              styles.glassCard,
              { borderColor: colors.border }
            ]}
          >
            <View style={styles.glassOverlay} />
            <View style={contentStyle}>
              {children}
            </View>
          </BlurView>
        );

      case 'gradient':
        return (
          <LinearGradient
            colors={[
              `${colors.primary}08`, // 5% opacity
              `${colors.primary}03`, // 2% opacity
            ]}
            style={[
              baseStyle,
              styles.gradientCard,
              { backgroundColor: colors.surface }
            ]}
          >
            <View style={contentStyle}>
              {children}
            </View>
          </LinearGradient>
        );

      case 'neumorphic':
        return (
          <View 
            style={[
              baseStyle,
              styles.neumorphicCard,
              { 
                backgroundColor: colors.surface,
                shadowColor: isDark ? colors.white : colors.black,
              }
            ]}
          >
            <View style={contentStyle}>
              {children}
            </View>
          </View>
        );

      case 'outline':
        return (
          <View 
            style={[
              baseStyle,
              styles.outlineCard,
              { 
                backgroundColor: 'transparent',
                borderColor: colors.border,
              }
            ]}
          >
            <View style={contentStyle}>
              {children}
            </View>
          </View>
        );

      case 'flat':
        return (
          <View 
            style={[
              baseStyle,
              { backgroundColor: colors.surface }
            ]}
          >
            <View style={contentStyle}>
              {children}
            </View>
          </View>
        );

      default: // elevated
        return (
          <View 
            style={[
              baseStyle,
              styles.elevatedCard,
              { 
                backgroundColor: colors.surface,
                shadowColor: colors.black,
              }
            ]}
          >
            <View style={contentStyle}>
              {children}
            </View>
          </View>
        );
    }
  };

  if (onPress) {
    return (
      <Animated.View 
        style={[
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          disabled && styles.disabled,
          style
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={1}
          accessibilityRole={accessibilityRole || 'button'}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
          testID={testID}
        >
          {getCardContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={style}>
      {getCardContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    overflow: 'hidden',
  },
  elevatedCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gradientCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  neumorphicCard: {
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  outlineCard: {
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.6,
  },
});

// Specialized card variants for convenience
export const ElevatedCard: React.FC<Omit<ModernCardProps, 'variant'>> = (props) => (
  <ModernCard variant="elevated" {...props} />
);

export const GlassCard: React.FC<Omit<ModernCardProps, 'variant'>> = (props) => (
  <ModernCard variant="glass" {...props} />
);

export const GradientCard: React.FC<Omit<ModernCardProps, 'variant'>> = (props) => (
  <ModernCard variant="gradient" {...props} />
);

export const NeumorphicCard: React.FC<Omit<ModernCardProps, 'variant'>> = (props) => (
  <ModernCard variant="neumorphic" {...props} />
);

export const OutlineCard: React.FC<Omit<ModernCardProps, 'variant'>> = (props) => (
  <ModernCard variant="outline" {...props} />
);

export const FlatCard: React.FC<Omit<ModernCardProps, 'variant'>> = (props) => (
  <ModernCard variant="flat" {...props} />
);

export default ModernCard;
