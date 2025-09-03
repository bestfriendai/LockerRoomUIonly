import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { modernTypography, modernColors } from '../../constants/modernDesign';

interface ModernTextProps extends TextProps {
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'overline';
  weight?: keyof typeof modernTypography.fontWeights;
  color?: string;
  gradient?: boolean;
  align?: 'left' | 'center' | 'right';
  spacing?: keyof typeof modernTypography.letterSpacing;
}

export const ModernText: React.FC<ModernTextProps> = ({
  children,
  variant = 'body',
  weight,
  color,
  gradient = false,
  align = 'left',
  spacing,
  style,
  ...props
}) => {
  const getVariantStyle = (): TextStyle => {
    const variants = {
      display: {
        fontSize: modernTypography.fontSizes['6xl'],
        lineHeight: modernTypography.lineHeights['6xl'],
        fontWeight: modernTypography.fontWeights.black,
        letterSpacing: modernTypography.letterSpacing.tight,
      },
      h1: {
        fontSize: modernTypography.fontSizes['5xl'],
        lineHeight: modernTypography.lineHeights['5xl'],
        fontWeight: modernTypography.fontWeights.bold,
        letterSpacing: modernTypography.letterSpacing.tight,
      },
      h2: {
        fontSize: modernTypography.fontSizes['4xl'],
        lineHeight: modernTypography.lineHeights['4xl'],
        fontWeight: modernTypography.fontWeights.bold,
        letterSpacing: modernTypography.letterSpacing.tight,
      },
      h3: {
        fontSize: modernTypography.fontSizes['3xl'],
        lineHeight: modernTypography.lineHeights['3xl'],
        fontWeight: modernTypography.fontWeights.semibold,
        letterSpacing: modernTypography.letterSpacing.normal,
      },
      h4: {
        fontSize: modernTypography.fontSizes['2xl'],
        lineHeight: modernTypography.lineHeights['2xl'],
        fontWeight: modernTypography.fontWeights.semibold,
        letterSpacing: modernTypography.letterSpacing.normal,
      },
      body: {
        fontSize: modernTypography.fontSizes.base,
        lineHeight: modernTypography.lineHeights.base,
        fontWeight: modernTypography.fontWeights.normal,
        letterSpacing: modernTypography.letterSpacing.normal,
      },
      bodyLarge: {
        fontSize: modernTypography.fontSizes.lg,
        lineHeight: modernTypography.lineHeights.lg,
        fontWeight: modernTypography.fontWeights.normal,
        letterSpacing: modernTypography.letterSpacing.normal,
      },
      bodySmall: {
        fontSize: modernTypography.fontSizes.sm,
        lineHeight: modernTypography.lineHeights.sm,
        fontWeight: modernTypography.fontWeights.normal,
        letterSpacing: modernTypography.letterSpacing.normal,
      },
      caption: {
        fontSize: modernTypography.fontSizes.xs,
        lineHeight: modernTypography.lineHeights.xs,
        fontWeight: modernTypography.fontWeights.medium,
        letterSpacing: modernTypography.letterSpacing.wide,
      },
      overline: {
        fontSize: modernTypography.fontSizes.xs,
        lineHeight: modernTypography.lineHeights.xs,
        fontWeight: modernTypography.fontWeights.bold,
        letterSpacing: modernTypography.letterSpacing.widest,
        // textTransform removed for React Native Web compatibility
      },
    };

    return variants[variant];
  };

  const textStyle: TextStyle = {
    ...getVariantStyle(),
    ...(weight && { fontWeight: modernTypography.fontWeights[weight] as any }),
    ...(color && { color }),
    ...(spacing && { letterSpacing: modernTypography.letterSpacing[spacing] }),
    textAlign: align,
    ...(style as TextStyle),
  };

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

// Gradient text component (for special effects)
export const GradientText: React.FC<{
  children: React.ReactNode;
  colors: string[];
  variant?: ModernTextProps['variant'];
  weight?: ModernTextProps['weight'];
  style?: TextStyle;
}> = ({ children, colors, variant = 'body', weight, style }) => {
  // Note: React Native doesn't support gradient text natively
  // This would need a native implementation or SVG solution
  // For now, we'll use the primary color as fallback
  return (
    <ModernText
      variant={variant}
      weight={weight}
      color={colors[0]}
      style={style}
    >
      {children}
    </ModernText>
  );
};

// Animated text with modern effects
export const AnimatedText: React.FC<ModernTextProps & {
  animation?: 'fadeIn' | 'slideUp' | 'typewriter';
}> = ({ animation = 'fadeIn', ...props }) => {
  // Animation would be implemented with react-native-reanimated
  // For now, return regular ModernText
  return <ModernText {...props} />;
};

// Text with modern styling presets
export const DisplayText: React.FC<Omit<ModernTextProps, 'variant'>> = (props) => (
  <ModernText variant="display" {...props} />
);

export const HeadingText: React.FC<Omit<ModernTextProps, 'variant'> & { level?: 1 | 2 | 3 | 4 }> = ({ 
  level = 1, 
  ...props 
}) => (
  <ModernText variant={`h${level}` as any} {...props} />
);

export const BodyText: React.FC<Omit<ModernTextProps, 'variant'> & { size?: 'small' | 'normal' | 'large' }> = ({ 
  size = 'normal', 
  ...props 
}) => {
  const variant = size === 'small' ? 'bodySmall' : size === 'large' ? 'bodyLarge' : 'body';
  return <ModernText variant={variant} {...props} />;
};

export const CaptionText: React.FC<Omit<ModernTextProps, 'variant'>> = (props) => (
  <ModernText variant="caption" {...props} />
);

export const OverlineText: React.FC<Omit<ModernTextProps, 'variant'>> = (props) => (
  <ModernText variant="overline" {...props} />
);
