// Design tokens for consistent styling across the app

// Typography tokens
export const tokens = {
  // Font sizes based on a modular scale
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

  // Line heights for optimal readability
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
    '4xl': 40,
    '5xl': 56,
    '6xl': 72,
  },

  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Letter spacing for different text styles
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },

  // Animation durations
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 500,
  },

  // Animation easing curves
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  // Z-index layers
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Opacity values
  opacity: {
    0: 0,
    5: 0.05,
    10: 0.1,
    20: 0.2,
    25: 0.25,
    30: 0.3,
    40: 0.4,
    50: 0.5,
    60: 0.6,
    70: 0.7,
    75: 0.75,
    80: 0.8,
    90: 0.9,
    95: 0.95,
    100: 1,
  },

  // Border radius values
  radii: {
    none: 0,
    xs: 2,
    sm: 4,
    base: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
  },

  // Spacing values
  spacing: {
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
    36: 144,
    40: 160,
    44: 176,
    48: 192,
    52: 208,
    56: 224,
    60: 240,
    64: 256,
    72: 288,
    80: 320,
    96: 384,
    // Semantic spacing
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  // White alpha colors for overlays
  whiteAlpha: {
    50: 'rgba(255, 255, 255, 0.04)',
    100: 'rgba(255, 255, 255, 0.06)',
    200: 'rgba(255, 255, 255, 0.08)',
    300: 'rgba(255, 255, 255, 0.16)',
    400: 'rgba(255, 255, 255, 0.24)',
    500: 'rgba(255, 255, 255, 0.36)',
    600: 'rgba(255, 255, 255, 0.48)',
    700: 'rgba(255, 255, 255, 0.64)',
    800: 'rgba(255, 255, 255, 0.80)',
    900: 'rgba(255, 255, 255, 0.92)',
    56: 'rgba(255, 255, 255, 0.56)',
  },
} as const;

// Helper function to get token values
export const getToken = <T extends keyof typeof tokens>(
  category: T,
  key: keyof typeof tokens[T]
): typeof tokens[T][keyof typeof tokens[T]] => {
  return tokens[category][key];
};

// Typography presets for common text styles
export const textPresets = {
  // Display text (large headings)
  display: {
    fontSize: tokens.fontSize['5xl'],
    lineHeight: tokens.lineHeight['5xl'],
    fontWeight: tokens.fontWeight.bold,
    letterSpacing: tokens.letterSpacing.tight,
  },

  // Headings
  h1: {
    fontSize: tokens.fontSize['4xl'],
    lineHeight: tokens.lineHeight['4xl'],
    fontWeight: tokens.fontWeight.bold,
    letterSpacing: tokens.letterSpacing.tight,
  },
  h2: {
    fontSize: tokens.fontSize['3xl'],
    lineHeight: tokens.lineHeight['3xl'],
    fontWeight: tokens.fontWeight.semibold,
    letterSpacing: tokens.letterSpacing.tight,
  },
  h3: {
    fontSize: tokens.fontSize['2xl'],
    lineHeight: tokens.lineHeight['2xl'],
    fontWeight: tokens.fontWeight.semibold,
    letterSpacing: tokens.letterSpacing.normal,
  },
  h4: {
    fontSize: tokens.fontSize.xl,
    lineHeight: tokens.lineHeight.xl,
    fontWeight: tokens.fontWeight.medium,
    letterSpacing: tokens.letterSpacing.normal,
  },

  // Body text
  body: {
    fontSize: tokens.fontSize.base,
    lineHeight: tokens.lineHeight.base,
    fontWeight: tokens.fontWeight.normal,
    letterSpacing: tokens.letterSpacing.normal,
  },
  bodyLarge: {
    fontSize: tokens.fontSize.lg,
    lineHeight: tokens.lineHeight.lg,
    fontWeight: tokens.fontWeight.normal,
    letterSpacing: tokens.letterSpacing.normal,
  },
  bodySmall: {
    fontSize: tokens.fontSize.sm,
    lineHeight: tokens.lineHeight.sm,
    fontWeight: tokens.fontWeight.normal,
    letterSpacing: tokens.letterSpacing.normal,
  },

  // Labels and captions
  label: {
    fontSize: tokens.fontSize.sm,
    lineHeight: tokens.lineHeight.sm,
    fontWeight: tokens.fontWeight.medium,
    letterSpacing: tokens.letterSpacing.wide,
  },
  caption: {
    fontSize: tokens.fontSize.xs,
    lineHeight: tokens.lineHeight.xs,
    fontWeight: tokens.fontWeight.normal,
    letterSpacing: tokens.letterSpacing.wide,
  },

  // Button text
  button: {
    fontSize: tokens.fontSize.base,
    lineHeight: tokens.lineHeight.base,
    fontWeight: tokens.fontWeight.medium,
    letterSpacing: tokens.letterSpacing.wide,
  },
  buttonSmall: {
    fontSize: tokens.fontSize.sm,
    lineHeight: tokens.lineHeight.sm,
    fontWeight: tokens.fontWeight.medium,
    letterSpacing: tokens.letterSpacing.wide,
  },
} as const;