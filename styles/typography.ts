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
  | 'chipBorder'
  | 'chipText'
  | 'divider'
  | 'errorContainer'
  | 'card'
  | 'warningBg'
  | 'cardBg'
  | 'errorBg';

export const createTypographyStyles = (colors: Record<ColorRole, string>) =>
  StyleSheet.create({
    h1: {
      fontSize: tokens.fontSize['3xl'],
      fontWeight: tokens.fontWeight.bold,
      color: colors.text,
    },
    h2: {
      fontSize: tokens.fontSize['2xl'],
      fontWeight: tokens.fontWeight.semibold,
      color: colors.text,
    },
    body: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.normal,
      color: colors.textSecondary,
      lineHeight: tokens.lineHeight.base,
    },
    caption: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.normal,
      color: colors.textTertiary,
    },
    button: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: colors.onPrimary,
    },
  });