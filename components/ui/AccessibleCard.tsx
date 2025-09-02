import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  AccessibilityInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, borderRadius, shadows } from '../../utils/spacing';
import { createSpringAnimation } from '../../utils/animations';
import { 
  accessibilityPatterns, 
  touchTarget, 
  colorContrast,
  screenReader,
  AccessibilityProps 
} from '../../utils/accessibility';

interface AccessibleCardProps extends AccessibilityProps {
  variant?: 'elevated' | 'glass' | 'gradient' | 'neumorphic' | 'outline' | 'flat';
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  padding?: keyof typeof spacing | number;
  shadow?: keyof typeof shadows;
  borderRadius?: keyof typeof borderRadius | number;
  disabled?: boolean;
  
  // Enhanced accessibility props
  title?: string;
  description?: string;
  semanticRole?: 'card' | 'button' | 'link' | 'article' | 'listitem';
  position?: { index: number; total: number };
  hasSubElements?: boolean;
  announceOnFocus?: string;
  customTestId?: string;
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  variant = 'elevated',
  children,
  onPress,
  onLongPress,
  style,
  contentStyle,
  padding = 'lg',
  shadow = 'md',
  borderRadius: borderRadiusProp = 'xl',
  disabled = false,
  
  // Accessibility props
  title,
  description,
  semanticRole = 'card',
  position,
  hasSubElements = false,
  announceOnFocus,
  customTestId,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  accessibilityState,
  accessibilityValue,
  accessible = true,
  importantForAccessibility = 'yes',
  ...props
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const cardRef = useRef<TouchableOpacity>(null);

  // Generate accessibility props based on semantic role and content
  const getAccessibilityProps = (): AccessibilityProps => {
    const baseLabel = accessibilityLabel || title || 'Card';
    const fullDescription = description ? `${baseLabel}. ${description}` : baseLabel;
    
    switch (semanticRole) {
      case 'button':
        return accessibilityPatterns.actionCard(baseLabel, description);
      case 'listitem':
        return accessibilityPatterns.listItem(baseLabel, description, position);
      case 'link':
        return {
          accessibilityRole: 'link',
          accessibilityLabel: fullDescription,
          accessibilityHint: accessibilityHint || 'Double tap to navigate',
        };
      case 'article':
        return {
          accessibilityRole: 'text',
          accessibilityLabel: fullDescription,
          importantForAccessibility: 'yes',
        };
      default: // card
        return {
          accessibilityRole: onPress ? 'button' : 'text',
          accessibilityLabel: fullDescription,
          accessibilityHint: onPress ? (accessibilityHint || 'Double tap to interact') : undefined,
          accessibilityState: { disabled },
        };
    }
  };

  // Ensure minimum touch target size for interactive cards
  const getTouchTargetStyle = () => {
    if (!onPress && !onLongPress) return {};
    
    const minSize = touchTarget.ensureMinimumSize(0, 0);
    return {
      minHeight: minSize.minHeight,
      minWidth: minSize.minWidth,
    };
  };

  // Generate test ID for automated testing
  const getTestId = () => {
    if (customTestId) return customTestId;
    
    let testId = `accessible-card-${variant}`;
    if (semanticRole !== 'card') testId += `-${semanticRole}`;
    if (position) testId += `-${position.index}`;
    return testId;
  };

  // Handle press interactions with accessibility feedback
  const handlePressIn = () => {
    if (disabled || (!onPress && !onLongPress)) return;
    
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
    if (disabled || (!onPress && !onLongPress)) return;
    
    Animated.parallel([
      createSpringAnimation(scaleAnim, 1),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled || !onPress) return;
    
    // Provide haptic feedback for better accessibility
    if (onPress) {
      onPress();
      
      // Announce action completion for screen readers
      if (announceOnFocus) {
        screenReader.announce(announceOnFocus);
      }
    }
  };

  const handleLongPress = () => {
    if (disabled || !onLongPress) return;
    onLongPress();
  };

  // Focus management for accessibility
  const handleFocus = () => {
    if (announceOnFocus) {
      screenReader.announce(announceOnFocus);
    }
  };

  const getPaddingValue = () => {
    if (typeof padding === 'number') return padding;
    return spacing[padding] || spacing.lg;
  };

  const getBorderRadiusValue = () => {
    if (typeof borderRadiusProp === 'number') return borderRadiusProp;
    return borderRadius[borderRadiusProp] || borderRadius.xl;
  };

  const getShadowStyle = () => {
    if (variant === 'flat' || variant === 'outline') return {};
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
      getTouchTargetStyle(),
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
              `${colors.primary}08`,
              `${colors.primary}03`,
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

  const accessibilityProps = getAccessibilityProps();

  if (onPress || onLongPress) {
    return (
      <Animated.View 
        style={[
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          disabled && styles.disabled,
          style
        ]}
      >
        <TouchableOpacity
          ref={cardRef}
          onPress={handlePress}
          onLongPress={handleLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onFocus={handleFocus}
          disabled={disabled}
          activeOpacity={1}
          testID={getTestId()}
          {...accessibilityProps}
          {...props}
        >
          {getCardContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View 
      style={style}
      testID={getTestId()}
      {...accessibilityProps}
      {...props}
    >
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

export default AccessibleCard;
