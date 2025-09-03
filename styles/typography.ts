import { StyleSheet } from 'react-native';
import { tokens } from '../constants/tokens';

type ColorRole =
  | 'background'
  | 'surface'
  | 'surfaceHover'
  | 'surfaceDisabled'
  | 'surfaceElevated'
  | 'border'
  | 'borderSubtle'
  | 'overlay'
  | 'text'
  | 'textSecondary'
  | 'textTertiary'
  | 'textDisabled'
  | 'primary'
  | 'primaryHover'
  | 'primaryDisabled'
  | 'onPrimary'
  | 'success'
  | 'error'
  | 'warning'
  | 'white'
  | 'black'
  | 'info'
  | 'chipBg'
  | 'chipBgActive'
  | 'chipBorder'
  | 'chipText'
  | 'chipTextActive'
  | 'divider'
  | 'errorContainer'
  | 'card'
  | 'warningBg'
  | 'cardBg'
  | 'errorBg';

export const createTypographyStyles = (colors: Record<ColorRole, string>) =>
  StyleSheet.create({
    // Display text for hero sections
    display: {
      fontSize: tokens.fontSize['5xl'],
      fontWeight: tokens.fontWeight.bold,
      color: colors.text,
      lineHeight: tokens.lineHeight['5xl'],
      letterSpacing: tokens.letterSpacing.tight,
    },
    
    // Headings with improved hierarchy
    h1: {
      fontSize: tokens.fontSize['4xl'],
      fontWeight: tokens.fontWeight.bold,
      color: colors.text,
      lineHeight: tokens.lineHeight['4xl'],
      letterSpacing: tokens.letterSpacing.tight,
    },
    h2: {
      fontSize: tokens.fontSize['3xl'],
      fontWeight: tokens.fontWeight.bold,
      color: colors.text,
      lineHeight: tokens.lineHeight['3xl'],
      letterSpacing: tokens.letterSpacing.tight,
    },
    h3: {
      fontSize: tokens.fontSize['2xl'],
      fontWeight: tokens.fontWeight.semibold,
      color: colors.text,
      lineHeight: tokens.lineHeight['2xl'],
    },
    h4: {
      fontSize: tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.semibold,
      color: colors.text,
      lineHeight: tokens.lineHeight.xl,
    },
    h5: {
      fontSize: tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.medium,
      color: colors.text,
      lineHeight: tokens.lineHeight.lg,
    },
    
    // Body text variants
    body: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.normal,
      color: colors.textSecondary,
      lineHeight: tokens.lineHeight.base,
    },
    bodyLarge: {
      fontSize: tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.normal,
      color: colors.textSecondary,
      lineHeight: tokens.lineHeight.lg,
    },
    bodySmall: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.normal,
      color: colors.textSecondary,
      lineHeight: tokens.lineHeight.sm,
    },
    
    // Labels and captions
    label: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color: colors.text,
      letterSpacing: tokens.letterSpacing.wide,
      textTransform: 'uppercase' as const,
    },
    caption: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.normal,
      color: colors.textTertiary,
      lineHeight: tokens.lineHeight.sm,
    },
    
    // Button text
    button: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: colors.onPrimary,
      letterSpacing: tokens.letterSpacing.wide,
    },
    buttonSmall: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color: colors.onPrimary,
      letterSpacing: tokens.letterSpacing.wide,
    },
    buttonLarge: {
      fontSize: tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.semibold,
      color: colors.onPrimary,
      letterSpacing: tokens.letterSpacing.wide,
    },
    
    // Utility text styles
    overline: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.medium,
      color: colors.textTertiary,
      letterSpacing: tokens.letterSpacing.widest,
      textTransform: 'uppercase' as const,
    },
    link: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    error: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.normal,
      color: colors.error,
      lineHeight: tokens.lineHeight.sm,
    },
  });