// Color palette for the LockerRoom Talk App
export const Colors = {
  // Primary brand colors (New Professional Blue Palette)
  primary: {
    50: '#E8F0FE',
    100: '#D2E3FC',
    200: '#AECBFA',
    300: '#8AB4F8',
    400: '#669DF6',
    500: '#4285F4', // Main brand color (Google Blue)
    600: '#1A73E8',
    700: '#1967D2',
    800: '#185ABC',
    900: '#174EA6',
  },

  // Neutral grays - Enhanced for better visual hierarchy
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Enhanced neutral colors (softer than pure black)
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A', // Softer than pure black
  },

  // Semantic colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Base colors
  white: '#FFFFFF',
  black: '#000000',

  // UI colors for light theme
  ui: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceHover: '#F8FAFC',
    surfaceDisabled: '#F1F5F9',
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // UI colors for dark theme - Enhanced with neutral colors
  uiDark: {
    background: '#0A0A0A', // Using neutral.950 instead of harsh black
    surface: '#171717',    // Using neutral.900
    surfaceHover: '#262626', // Using neutral.800
    surfaceDisabled: '#171717',
    border: 'rgba(255, 255, 255, 0.10)',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',
    overlay: 'rgba(0, 0, 0, 0.75)',
  },

  // Gradient combinations for modern UI
  gradients: {
    primary: 'linear-gradient(135deg, #E91E63 0%, #FF5AA3 100%)',
    dark: 'linear-gradient(180deg, #0A0A0A 0%, #171717 100%)',
    card: 'linear-gradient(145deg, rgba(233,30,99,0.05) 0%, rgba(255,90,163,0.02) 100%)',
    glass: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  },

  // Text colors
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    disabled: '#CBD5E1',
  },

  // Text colors for dark theme
  textDark: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.70)',
    tertiary: 'rgba(255, 255, 255, 0.50)',
    disabled: 'rgba(255, 255, 255, 0.38)',
  },
};

// Alpha values for white overlays (used in dark theme)
export const whiteAlpha = {
  4: 'rgba(255, 255, 255, 0.04)',
  6: 'rgba(255, 255, 255, 0.06)',
  8: 'rgba(255, 255, 255, 0.08)',
  12: 'rgba(255, 255, 255, 0.12)',
  16: 'rgba(255, 255, 255, 0.16)',
  24: 'rgba(255, 255, 255, 0.24)',
  38: 'rgba(255, 255, 255, 0.38)',
  48: 'rgba(255, 255, 255, 0.48)',
  56: 'rgba(255, 255, 255, 0.56)',
  64: 'rgba(255, 255, 255, 0.64)',
  72: 'rgba(255, 255, 255, 0.72)',
  92: 'rgba(255, 255, 255, 0.92)',
};

// Alpha values for black overlays (used in light theme)
export const blackAlpha = {
  4: 'rgba(0, 0, 0, 0.04)',
  6: 'rgba(0, 0, 0, 0.06)',
  8: 'rgba(0, 0, 0, 0.08)',
  12: 'rgba(0, 0, 0, 0.12)',
  16: 'rgba(0, 0, 0, 0.16)',
  24: 'rgba(0, 0, 0, 0.24)',
  38: 'rgba(0, 0, 0, 0.38)',
  48: 'rgba(0, 0, 0, 0.48)',
  56: 'rgba(0, 0, 0, 0.56)',
  64: 'rgba(0, 0, 0, 0.64)',
  72: 'rgba(0, 0, 0, 0.72)',
  92: 'rgba(0, 0, 0, 0.92)',
};