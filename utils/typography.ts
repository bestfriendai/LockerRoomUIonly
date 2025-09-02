import { Platform, StyleSheet } from 'react-native';

// Enhanced typography system for LockerRoom Talk
export const typography = {
  fontFamily: {
    sans: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'SF Mono',
      android: 'Roboto Mono',
      default: 'monospace',
    }),
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  fontWeight: {
    thin: '100' as const,
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  letterSpacing: {
    tighter: -1,
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// Predefined text styles for consistent typography
export const textStyles = StyleSheet.create({
  // Headings
  h1: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize['4xl'] * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tighter,
    fontFamily: typography.fontFamily.sans,
  },
  h2: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
    fontFamily: typography.fontFamily.sans,
  },
  h3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize['2xl'] * typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.normal,
    fontFamily: typography.fontFamily.sans,
  },
  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.xl * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.sans,
  },
  h5: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.sans,
  },
  h6: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.sans,
  },
  
  // Body text
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    fontFamily: typography.fontFamily.sans,
  },
  bodyLarge: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.lg * typography.lineHeight.relaxed,
    fontFamily: typography.fontFamily.sans,
  },
  bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.sans,
  },
  
  // Captions and labels
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    opacity: 0.7,
    fontFamily: typography.fontFamily.sans,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.wide,
    fontFamily: typography.fontFamily.sans,
  },
  
  // Interactive elements
  button: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.base * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.wide,
    fontFamily: typography.fontFamily.sans,
  },
  buttonSmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.sm * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.wide,
    fontFamily: typography.fontFamily.sans,
  },
  buttonLarge: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.lg * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.wide,
    fontFamily: typography.fontFamily.sans,
  },
  
  // Special text styles
  overline: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase' as const,
    fontFamily: typography.fontFamily.sans,
  },
  code: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.mono,
  },
});

// Helper function to create responsive text styles
export const createResponsiveTextStyle = (
  baseSize: keyof typeof typography.fontSize,
  weight: keyof typeof typography.fontWeight = 'regular',
  lineHeightMultiplier: keyof typeof typography.lineHeight = 'normal'
) => ({
  fontSize: typography.fontSize[baseSize],
  fontWeight: typography.fontWeight[weight],
  lineHeight: typography.fontSize[baseSize] * typography.lineHeight[lineHeightMultiplier],
  fontFamily: typography.fontFamily.sans,
});

// Text color utilities (to be used with theme colors)
export const getTextColorForBackground = (isDark: boolean) => ({
  primary: isDark ? '#FFFFFF' : '#0A0A0B',
  secondary: isDark ? 'rgba(255, 255, 255, 0.70)' : '#4A4A4F',
  tertiary: isDark ? 'rgba(255, 255, 255, 0.50)' : '#6B6B70',
  disabled: isDark ? 'rgba(255, 255, 255, 0.38)' : '#9B9B9F',
});
