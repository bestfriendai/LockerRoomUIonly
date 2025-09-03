/**
 * Typography system for LockerRoom Talk
 * Comprehensive type scale and text styles for consistent UI
 */

import { Platform, StyleSheet, TextStyle } from 'react-native';

// Type-safe font weight values
export type FontWeight = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';

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
    '6xl': 60,
  },
  
  fontWeight: {
    thin: '100' as FontWeight,
    light: '300' as FontWeight,
    regular: '400' as FontWeight,
    medium: '500' as FontWeight,
    semibold: '600' as FontWeight,
    bold: '700' as FontWeight,
    extrabold: '800' as FontWeight,
    black: '900' as FontWeight,
  },
  
  lineHeight: {
    none: 1,
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  letterSpacing: {
    tighter: -1.5,
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
};

// Predefined text styles for consistency
export const textStyles = StyleSheet.create({
  h1: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
    lineHeight: typography.fontSize['4xl'] * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h2: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.semibold as TextStyle['fontWeight'],
    lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold as TextStyle['fontWeight'],
    lineHeight: typography.fontSize['2xl'] * typography.lineHeight.normal,
  },
  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium as TextStyle['fontWeight'],
    lineHeight: typography.fontSize.xl * typography.lineHeight.normal,
  },
  h5: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium as TextStyle['fontWeight'],
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular as TextStyle['fontWeight'],
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  bodyLarge: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.regular as TextStyle['fontWeight'],
    lineHeight: typography.fontSize.lg * typography.lineHeight.relaxed,
  },
  bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular as TextStyle['fontWeight'],
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular as TextStyle['fontWeight'],
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
    opacity: 0.7,
  },
  button: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold as TextStyle['fontWeight'],
    lineHeight: typography.fontSize.base * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.wide,
  },
  buttonSmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as TextStyle['fontWeight'],
    lineHeight: typography.fontSize.sm * typography.lineHeight.tight,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as TextStyle['fontWeight'],
    lineHeight: typography.fontSize.sm * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.wide,
  },
  link: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as TextStyle['fontWeight'],
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    textDecorationLine: 'underline' as const,
  },
});

export default typography;