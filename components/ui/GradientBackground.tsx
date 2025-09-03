import React from 'react';
import { ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../providers/ThemeProvider';

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'surface' | 'dark' | 'light';
  direction?: 'vertical' | 'horizontal' | 'diagonal';
  style?: ViewStyle;
  intensity?: 'subtle' | 'medium' | 'strong';
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  variant = 'primary',
  direction = 'vertical',
  style,
  intensity = 'medium',
}) => {
  const { colors, isDark } = useTheme();

  const getGradientColors = () => {
    const alpha = intensity === 'subtle' ? '10' : intensity === 'medium' ? '20' : '30';
    
    switch (variant) {
      case 'primary':
        return isDark 
          ? [colors.primary + alpha, colors.background]
          : [colors.primary + alpha, colors.surface];
      
      case 'secondary':
        return isDark
          ? [colors.secondary + alpha, colors.background]
          : [colors.secondary + alpha, colors.surface];
      
      case 'surface':
        return isDark
          ? [colors.surface, colors.background]
          : [colors.surface, colors.background];
      
      case 'dark':
        return ['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.4)'];
      
      case 'light':
        return ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)'];
      
      default:
        return [colors.background, colors.surface];
    }
  };

  const getGradientDirection = () => {
    switch (direction) {
      case 'horizontal':
        return { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };
      case 'diagonal':
        return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
      default: // vertical
        return { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };
    }
  };

  const gradientColors = getGradientColors();
  const gradientDirection = getGradientDirection();

  return (
    <LinearGradient
      colors={gradientColors}
      style={[{ flex: 1 }, style]}
      {...gradientDirection}
    >
      {children}
    </LinearGradient>
  );
};

// Preset gradient components for common use cases
export const PrimaryGradient: React.FC<Omit<GradientBackgroundProps, 'variant'>> = (props) => (
  <GradientBackground variant="primary" {...props} />
);

export const SurfaceGradient: React.FC<Omit<GradientBackgroundProps, 'variant'>> = (props) => (
  <GradientBackground variant="surface" {...props} />
);

export const DarkOverlay: React.FC<Omit<GradientBackgroundProps, 'variant'>> = (props) => (
  <GradientBackground variant="dark" intensity="medium" {...props} />
);

export const LightOverlay: React.FC<Omit<GradientBackgroundProps, 'variant'>> = (props) => (
  <GradientBackground variant="light" intensity="subtle" {...props} />
);

export default GradientBackground;
