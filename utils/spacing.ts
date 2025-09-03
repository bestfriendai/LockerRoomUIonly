/**
 * Spacing, layout, and design tokens for LockerRoom Talk
 * Consistent spacing scale and visual effects
 */

import { ViewStyle } from 'react-native';

// Consistent spacing scale based on 4px grid
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
  '5xl': 128,
} as const;

// Border radius tokens for rounded corners
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// Shadow styles for elevation and depth
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  } as ViewStyle,
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  } as ViewStyle,
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 15,
  } as ViewStyle,
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 20,
  } as ViewStyle,
  inner: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: -5,
  } as ViewStyle,
};

// Glow effects for special elements
export const glows = {
  primary: {
    shadowColor: '#FF1E7D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 0,
  } as ViewStyle,
  success: {
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 0,
  } as ViewStyle,
  error: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 0,
  } as ViewStyle,
};

// Animation durations for consistent motion
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
} as const;

// Z-index layers for proper stacking
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  toast: 700,
} as const;

// Screen breakpoints for responsive design
export const breakpoints = {
  xs: 0,
  sm: 360,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Common layout utilities
export const layout = {
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  } as ViewStyle,
  column: {
    flexDirection: 'column' as const,
  } as ViewStyle,
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  } as ViewStyle,
  spaceBetween: {
    justifyContent: 'space-between' as const,
  } as ViewStyle,
  spaceAround: {
    justifyContent: 'space-around' as const,
  } as ViewStyle,
  spaceEvenly: {
    justifyContent: 'space-evenly' as const,
  } as ViewStyle,
};

export default {
  spacing,
  borderRadius,
  shadows,
  glows,
  animations,
  zIndex,
  breakpoints,
  layout,
};