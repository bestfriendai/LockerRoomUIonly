import React from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  
} from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { useTheme } from '../../providers/ThemeProvider';
import { SPACING } from '../../constants/spacing';
import { createCardStyle, CARD_SHADOWS } from '../../constants/shadows';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  shadow?: keyof typeof CARD_SHADOWS;
  padding?: keyof typeof SPACING | number;
  onPress?: () => void;
  disabled?: boolean;
  hapticOnPress?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  contentStyle,
  shadow = 'default',
  padding = 'card',
  onPress,
  disabled = false,
  hapticOnPress = true,
}) => {
  const { colors } = useTheme();

  const getPaddingValue = () => {
    if (typeof padding === 'number') {
      return padding;
    }
    return SPACING[padding] || SPACING.card;
  };

  const cardStyle: ViewStyle = {
    ...createCardStyle({
      shadow,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      shadowColor: colors.black,
    }),
    padding: getPaddingValue(),
  };

  const combinedStyle = StyleSheet.flatten([cardStyle, style]);

  if (onPress) {
    return (
      <AnimatedPressable
        style={combinedStyle}
        onPress={onPress}
        disabled={disabled}
        hapticOnPress={hapticOnPress}
        scaleTo={0.98}
      >
        <View style={contentStyle}>
          {children}
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <View style={combinedStyle}>
      <View style={contentStyle}>
        {children}
      </View>
    </View>
  );
};

// Specialized card variants
export const InteractiveCard: React.FC<Omit<CardProps, 'shadow'>> = (props) => (
  <Card shadow="interactive" {...props} />
);

export const ElevatedCard: React.FC<Omit<CardProps, 'shadow'>> = (props) => (
  <Card shadow="elevated" {...props} />
);

export const FloatingCard: React.FC<Omit<CardProps, 'shadow'>> = (props) => (
  <Card shadow="floating" {...props} />
);

// Default export for backward compatibility
export default Card;