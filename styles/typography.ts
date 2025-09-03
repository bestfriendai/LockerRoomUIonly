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
    
    // Headings with improved hierarchy - optimized for better readability
    h1: {
      fontSize: 28,  // Reduced from tokens.fontSize['4xl'] (36) for better balance
      fontWeight: tokens.fontWeight.bold,
      color: colors.text,
      lineHeight: 34,  // Tighter line height for better density
      letterSpacing: -0.3, // Slightly tighter letter spacing
    },
    h2: {
      fontSize: 22,  // Reduced from tokens.fontSize['3xl'] (30)
      fontWeight: tokens.fontWeight.bold,
      color: colors.text,
      lineHeight: 28,  // Better proportions
      letterSpacing: -0.2,
    },
    h3: {
      fontSize: 18,  // Reduced from tokens.fontSize['2xl'] (24)
      fontWeight: tokens.fontWeight.semibold,
      color: colors.text,
      lineHeight: 24,  // Improved readability
      letterSpacing: -0.1,
    },
    h4: {
      fontSize: 16,  // Reduced from tokens.fontSize.xl (20)
      fontWeight: tokens.fontWeight.semibold,
      color: colors.text,
      lineHeight: 22,  // Better line height
      letterSpacing: 0,
    },
    h5: {
      fontSize: 14,  // Reduced from tokens.fontSize.lg (18)
      fontWeight: tokens.fontWeight.medium,
      color: colors.text,
      lineHeight: 20,  // Improved spacing
      letterSpacing: 0.1,
    },
    
    // Body text variants - improved for better readability
    body: {
      fontSize: 15,    // Slightly smaller than tokens.fontSize.base (16)
      fontWeight: tokens.fontWeight.normal,
      color: colors.text, // Changed from textSecondary for better contrast
      lineHeight: 22,     // Better line height for readability
      letterSpacing: 0.1,
    },
    bodyLarge: {
      fontSize: 16,    // Reduced from tokens.fontSize.lg (18)
      fontWeight: tokens.fontWeight.normal,
      color: colors.text,
      lineHeight: 24,  // Improved spacing
      letterSpacing: 0.1,
    },
    bodySmall: {
      fontSize: 13,    // Reduced from tokens.fontSize.sm (14)
      fontWeight: tokens.fontWeight.normal,
      color: colors.textSecondary, // Keep secondary for smaller text
      lineHeight: tokens.lineHeight.sm,
    },
    
    // Labels and captions - improved for better hierarchy
    label: {
      fontSize: 12,    // Reduced from tokens.fontSize.sm (14)
      fontWeight: tokens.fontWeight.medium,
      color: colors.textSecondary, // Better hierarchy
      letterSpacing: 0.5, // More subtle than tokens.letterSpacing.wide
      lineHeight: 16,
    },
    caption: {
      fontSize: 11,    // Reduced from tokens.fontSize.sm (14)
      fontWeight: tokens.fontWeight.normal,
      color: colors.textTertiary,
      lineHeight: 15,  // Tighter line height
      letterSpacing: 0.2,
    },

    // Button text - optimized for different button sizes
    button: {
      fontSize: 15,    // Slightly smaller than tokens.fontSize.base
      fontWeight: tokens.fontWeight.medium,
      color: colors.onPrimary,
      letterSpacing: 0.3, // More subtle letter spacing
    },
    buttonSmall: {
      fontSize: 13,    // Reduced from tokens.fontSize.sm
      fontWeight: tokens.fontWeight.medium,
      color: colors.onPrimary,
      letterSpacing: 0.2,
    },
    buttonLarge: {
      fontSize: 16,    // Reduced from tokens.fontSize.lg
      fontWeight: tokens.fontWeight.semibold,
      color: colors.onPrimary,
      letterSpacing: 0.4,
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