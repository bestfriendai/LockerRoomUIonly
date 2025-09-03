import React from 'react';
import { View, ViewStyle, Pressable, PressableProps } from 'react-native';
import { modernShadows, modernBorderRadius, modernColors } from '../../constants/modernDesign';

interface GlassmorphismCardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  borderGradient?: boolean;
  shadow?: keyof typeof modernShadows;
  borderRadius?: keyof typeof modernBorderRadius;
  padding?: number;
  interactive?: boolean;
}

export const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({
  children,
  style,
  intensity = 20,
  tint = 'light',
  borderGradient = false,
  shadow = 'glass',
  borderRadius = 'xl',
  padding = 20,
  interactive = false,
  onPress,
  ...pressableProps
}) => {
  const cardStyle: ViewStyle = {
    borderRadius: modernBorderRadius[borderRadius],
    overflow: 'hidden',
    backgroundColor: tint === 'light'
      ? 'rgba(255, 255, 255, 0.25)'
      : 'rgba(0, 0, 0, 0.25)',
    borderWidth: 1,
    borderColor: tint === 'light'
      ? 'rgba(255, 255, 255, 0.18)'
      : 'rgba(255, 255, 255, 0.1)',
    // Remove shadow for React Native Web compatibility
    ...(style || {}),
  };

  const content = (
    <View style={[cardStyle, { padding }]}>
      {/* BlurView replaced with simple View for React Native Web compatibility */}
      {children}
    </View>
  );

  if (interactive && onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          {
            transform: [{ scale: pressed ? 0.98 : 1 }],
            opacity: pressed ? 0.9 : 1,
          },
        ]}
        {...pressableProps}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

// Floating modern card with advanced shadows
export const FloatingCard: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'low' | 'medium' | 'high';
  borderRadius?: keyof typeof modernBorderRadius;
  padding?: number;
  interactive?: boolean;
  onPress?: () => void;
}> = ({
  children,
  style,
  elevation = 'medium',
  borderRadius = 'xl',
  padding = 20,
  interactive = false,
  onPress,
}) => {
  const elevationShadows = {
    low: modernShadows.card,
    medium: modernShadows.float,
    high: modernShadows.hero,
  };

  const cardStyle: ViewStyle = {
    backgroundColor: '#ffffff',
    borderRadius: modernBorderRadius[borderRadius],
    padding,
    ...elevationShadows[elevation],
    ...style,
  };

  if (interactive && onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          {
            transform: [{ scale: pressed ? 0.98 : 1 }],
            opacity: pressed ? 0.95 : 1,
          },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

// Neumorphic card (soft, inset/outset effects)
export const NeumorphicCard: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'inset' | 'outset';
  borderRadius?: keyof typeof modernBorderRadius;
  padding?: number;
  backgroundColor?: string;
}> = ({
  children,
  style,
  variant = 'outset',
  borderRadius = 'xl',
  padding = 20,
  backgroundColor = '#f0f0f3',
}) => {
  const neumorphicStyle: ViewStyle = {
    backgroundColor,
    borderRadius: modernBorderRadius[borderRadius],
    padding,
    ...(variant === 'outset' ? {
      shadowColor: '#ffffff',
      shadowOffset: { width: -5, height: -5 },
      shadowOpacity: 0.7,
      shadowRadius: 10,
      elevation: 5,
    } : {
      shadowColor: '#babecc',
      shadowOffset: { width: 5, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: -5,
    }),
    ...style,
  };

  return <View style={neumorphicStyle}>{children}</View>;
};

// Hero card with dramatic effects
export const HeroCard: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  borderRadius?: keyof typeof modernBorderRadius;
  padding?: number;
}> = ({
  children,
  style,
  gradient = false,
  borderRadius = '2xl',
  padding = 32,
}) => {
  const heroStyle: ViewStyle = {
    backgroundColor: gradient ? 'transparent' : '#ffffff',
    borderRadius: modernBorderRadius[borderRadius],
    padding,
    ...modernShadows.hero,
    ...style,
  };

  return <View style={heroStyle}>{children}</View>;
};
