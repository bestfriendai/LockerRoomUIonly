import { StyleSheet } from 'react-native';
import { tokens } from '../constants/tokens';
import { ThemeColors } from '../providers/ThemeProvider'; // Assuming you export your colors type

export const createTypographyStyles = (colors: ThemeColors) =>
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