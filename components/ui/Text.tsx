import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  TextStyle
} from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { tokens, textPresets } from '../../constants/tokens';

type Variant = 
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodyLarge'
  | 'bodySmall'
  | 'label'
  | 'caption'
  | 'button'
  | 'buttonSmall';

type Weight = 
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold';

type ColorRole = 
  | 'text'
  | 'textSecondary'
  | 'textTertiary'
  | 'textDisabled'
  | 'primary'
  | 'success'
  | 'error'
  | 'warning'
  | 'white'
  | 'black';

interface TextProps extends RNTextProps {
  variant?: Variant;
  weight?: Weight;
  color?: ColorRole;
  align?: 'left' | 'center' | 'right' | 'justify';
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  weight,
  color = 'text',
  align = 'left',
  transform = 'none',
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();

  // Get preset styles for the variant
  const presetStyle = textPresets[variant];

  // Calculate dynamic styles
  const dynamicStyle: TextStyle = {
    fontSize: presetStyle.fontSize,
    lineHeight: presetStyle.lineHeight,
    color: colors[color],
    textAlign: align,
    fontWeight: weight ? tokens.fontWeight[weight] : presetStyle.fontWeight,
    letterSpacing: presetStyle.letterSpacing,
    textTransform: transform,
  };

  const combinedStyle = StyleSheet.compose(dynamicStyle, style);

  return (
    <RNText style={combinedStyle} {...props}>
      {children}
    </RNText>
  );
};

// Convenience components for common text variants
export const DisplayText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} />
);

export const Heading1: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} />
);

export const Heading2: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} />
);

export const Heading3: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} />
);

export const Heading4: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} />
);

export const BodyText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} />
);

export const BodyLargeText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} />
);

export const BodySmallText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} />
);

export const LabelText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} />
);

export const CaptionText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} />
);

export const ButtonText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} />
);

export const ButtonSmallText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} />
);

// Default export for backward compatibility
export default Text;