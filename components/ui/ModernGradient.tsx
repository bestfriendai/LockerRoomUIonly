import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { modernGradients, modernBorderRadius } from '../../constants/modernDesign';

interface ModernGradientProps {
  gradient: keyof typeof modernGradients;
  children?: React.ReactNode;
  style?: ViewStyle;
  borderRadius?: keyof typeof modernBorderRadius;
  opacity?: number;
  angle?: number;
}

export const ModernGradient: React.FC<ModernGradientProps> = ({
  gradient,
  children,
  style,
  borderRadius = 'xl',
  opacity = 1,
  angle = 45,
}) => {
  const colors = modernGradients[gradient];
  
  // Convert angle to start/end points for LinearGradient
  const getGradientPoints = (angle: number) => {
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians);
    const y = Math.sin(radians);
    
    return {
      start: { x: 0.5 - x * 0.5, y: 0.5 - y * 0.5 },
      end: { x: 0.5 + x * 0.5, y: 0.5 + y * 0.5 },
    };
  };
  
  const { start, end } = getGradientPoints(angle);
  
  return (
    <LinearGradient
      colors={colors.map(color => 
        color.includes('rgba') ? color : `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
      )}
      start={start}
      end={end}
      style={[
        {
          borderRadius: modernBorderRadius[borderRadius],
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
};

// Preset gradient backgrounds
export const GradientBackground: React.FC<{
  children: React.ReactNode;
  variant?: 'mesh' | 'holographic' | 'aurora' | 'cosmic';
  style?: ViewStyle;
}> = ({ children, variant = 'mesh', style }) => (
  <ModernGradient
    gradient={variant}
    style={[{ flex: 1 }, style]}
    borderRadius="none"
  >
    {children}
  </ModernGradient>
);

// Glassmorphism card with gradient border
export const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  borderGradient?: keyof typeof modernGradients;
}> = ({ children, style, borderGradient = 'primary' }) => (
  <View style={[{ padding: 2, borderRadius: modernBorderRadius.xl }, style]}>
    <ModernGradient
      gradient={borderGradient}
      style={{ borderRadius: modernBorderRadius.xl, padding: 1 }}
    >
      <View
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: modernBorderRadius.xl - 1,
          backdropFilter: 'blur(10px)',
        }}
      >
        {children}
      </View>
    </ModernGradient>
  </View>
);

// Modern button with gradient
export const GradientButton: React.FC<{
  children: React.ReactNode;
  onPress?: () => void;
  gradient?: keyof typeof modernGradients;
  style?: ViewStyle;
  disabled?: boolean;
}> = ({ children, onPress, gradient = 'cta', style, disabled = false }) => (
  <ModernGradient
    gradient={gradient}
    style={[
      {
        borderRadius: modernBorderRadius.lg,
        opacity: disabled ? 0.6 : 1,
      },
      style,
    ]}
  >
    <View
      style={{
        paddingHorizontal: 24,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  </ModernGradient>
);
