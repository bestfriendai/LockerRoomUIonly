// MODERN DESIGN SYSTEM 2024
// Advanced gradients, glassmorphism, and modern effects

export const modernGradients = {
  // HERO GRADIENTS - Multi-color, sophisticated
  sunset: ['#FF6B6B', '#FF8E53', '#FF6B9D'],
  ocean: ['#667eea', '#764ba2', '#f093fb'],
  aurora: ['#a8edea', '#fed6e3', '#d299c2'],
  cosmic: ['#667eea', '#764ba2', '#f093fb'],
  neon: ['#00f5ff', '#fc00ff', '#fffc00'],
  
  // CARD GRADIENTS - Subtle, elegant
  glass: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.05)'],
  darkGlass: ['rgba(0, 0, 0, 0.25)', 'rgba(0, 0, 0, 0.05)'],
  primary: ['#667eea', '#764ba2'],
  secondary: ['#f093fb', '#f5576c'],
  
  // BACKGROUND GRADIENTS - Atmospheric
  mesh: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
  holographic: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5'],
  
  // BUTTON GRADIENTS - Interactive
  cta: ['#667eea', '#764ba2'],
  success: ['#56ab2f', '#a8e6cf'],
  warning: ['#f093fb', '#f5576c'],
  danger: ['#ff416c', '#ff4b2b'],
} as const;

// React Native Web compatible shadows (simplified)
export const modernShadows = {
  // GLASSMORPHISM SHADOWS - Soft, realistic
  glass: {
    elevation: 8,
  },

  // FLOATING SHADOWS - Modern depth
  float: {
    elevation: 10,
  },

  // CARD SHADOWS - Layered depth
  card: {
    elevation: 4,
  },

  // BUTTON SHADOWS - Interactive depth
  button: {
    elevation: 2,
  },

  // HERO SHADOWS - Dramatic depth
  hero: {
    elevation: 20,
  },
} as const;

export const modernColors = {
  // SOPHISTICATED PALETTE
  primary: {
    50: '#f0f4ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // Main primary
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  
  // MODERN GRAYS - Warmer, more sophisticated
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // ACCENT COLORS - Vibrant, modern
  accent: {
    pink: '#f093fb',
    purple: '#667eea',
    blue: '#3a86ff',
    green: '#06ffa5',
    orange: '#ff8e53',
    red: '#ff416c',
  },
  
  // GLASSMORPHISM COLORS
  glass: {
    white: 'rgba(255, 255, 255, 0.25)',
    dark: 'rgba(0, 0, 0, 0.25)',
    primary: 'rgba(102, 126, 234, 0.25)',
    secondary: 'rgba(240, 147, 251, 0.25)',
  },
} as const;

export const modernTypography = {
  // MODERN FONT SYSTEM - Better hierarchy
  fontSizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 19,
    '2xl': 22,
    '3xl': 28,
    '4xl': 34,
    '5xl': 42,
    '6xl': 52,
  },
  
  // MODERN FONT WEIGHTS - More variety
  fontWeights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // MODERN LINE HEIGHTS - Better readability
  lineHeights: {
    xs: 16,
    sm: 18,
    base: 22,
    lg: 24,
    xl: 26,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
    '5xl': 48,
    '6xl': 58,
  },
  
  // MODERN LETTER SPACING - Refined spacing (React Native compatible)
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
  },
} as const;

export const modernBorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

export const modernSpacing = {
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

// GLASSMORPHISM HELPER
// React Native Web compatible glassmorphism
export const createGlassmorphism = (opacity: number = 0.25) => ({
  backgroundColor: `rgba(255, 255, 255, ${opacity})`,
  borderWidth: 1,
  borderColor: `rgba(255, 255, 255, ${opacity * 2})`,
  ...modernShadows.glass,
});

// MODERN CARD HELPER
export const createModernCard = (variant: 'glass' | 'float' | 'hero' = 'float') => {
  const variants = {
    glass: {
      ...createGlassmorphism(0.15),
      borderRadius: modernBorderRadius.xl,
    },
    float: {
      backgroundColor: '#ffffff',
      borderRadius: modernBorderRadius.xl,
      ...modernShadows.float,
    },
    hero: {
      backgroundColor: '#ffffff',
      borderRadius: modernBorderRadius['2xl'],
      ...modernShadows.hero,
    },
  };
  
  return variants[variant];
};
