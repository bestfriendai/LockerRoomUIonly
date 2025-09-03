// Design tokens for consistent styling across the app

// Typography tokens
export const tokens = {
  // Font sizes based on a modular scale - ORIGINAL
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

  // COMPACT FONT SIZES - TeaOnHer-style compact typography (15% reduction)
  compactFontSize: {
    xs: 10,    // was 12
    sm: 12,    // was 14
    base: 14,  // was 16
    lg: 15,    // was 18
    xl: 17,    // was 20
    '2xl': 20, // was 24
    '3xl': 26, // was 30
    '4xl': 31, // was 36
    '5xl': 41, // was 48
    '6xl': 51, // was 60
  },

  // Line heights for optimal readability - ORIGINAL
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

  // COMPACT LINE HEIGHTS - Tighter for compact design (15% reduction)
  compactLineHeight: {
    xs: 14,    // was 16
    sm: 17,    // was 20
    base: 20,  // was 24
    lg: 24,    // was 28
    xl: 24,    // was 28
    '2xl': 27, // was 32
    '3xl': 31, // was 36
    '4xl': 34, // was 40
    '5xl': 48, // was 56
    '6xl': 61, // was 72
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

  // Spacing values - ORIGINAL
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
    // Semantic spacing - ORIGINAL VALUES
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  // COMPACT SPACING - TeaOnHer-style compact layout (30% reduction)
  compactSpacing: {
    0: 0,
    px: 1,
    0.5: 1,
    1: 3,
    1.5: 4,
    2: 6,
    2.5: 7,
    3: 8,
    3.5: 10,
    4: 11,
    5: 14,
    6: 17,
    7: 20,
    8: 22,
    9: 25,
    10: 28,
    11: 31,
    12: 34,
    14: 39,
    16: 45,
    20: 56,
    24: 67,
    28: 78,
    32: 90,
    36: 101,
    40: 112,
    44: 123,
    48: 134,
    52: 146,
    56: 157,
    60: 168,
    64: 179,
    72: 202,
    80: 224,
    96: 269,
    // Semantic compact spacing
    xs: 3,    // was 4
    sm: 6,    // was 8
    md: 11,   // was 16
    lg: 17,   // was 24
    xl: 22,   // was 32
    '2xl': 34, // was 48
    '3xl': 45, // was 64
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

// COMPACT TEXT PRESETS - TeaOnHer-style compact typography
export const compactTextPresets = {
  // Display text (large headings) - compact
  display: {
    fontSize: tokens.compactFontSize['5xl'],
    lineHeight: tokens.compactLineHeight['5xl'],
    fontWeight: tokens.fontWeight.bold,
    letterSpacing: tokens.letterSpacing.tight,
  },

  // Headings - compact
  h1: {
    fontSize: tokens.compactFontSize['4xl'],
    lineHeight: tokens.compactLineHeight['4xl'],
    fontWeight: tokens.fontWeight.bold,
    letterSpacing: tokens.letterSpacing.tight,
  },
  h2: {
    fontSize: tokens.compactFontSize['3xl'],
    lineHeight: tokens.compactLineHeight['3xl'],
    fontWeight: tokens.fontWeight.semibold,
    letterSpacing: tokens.letterSpacing.tight,
  },
  h3: {
    fontSize: tokens.compactFontSize['2xl'],
    lineHeight: tokens.compactLineHeight['2xl'],
    fontWeight: tokens.fontWeight.semibold,
    letterSpacing: tokens.letterSpacing.normal,
  },
  h4: {
    fontSize: tokens.compactFontSize.xl,
    lineHeight: tokens.compactLineHeight.xl,
    fontWeight: tokens.fontWeight.medium,
    letterSpacing: tokens.letterSpacing.normal,
  },

  // Body text - compact
  body: {
    fontSize: tokens.compactFontSize.base,
    lineHeight: tokens.compactLineHeight.base,
    fontWeight: tokens.fontWeight.normal,
    letterSpacing: tokens.letterSpacing.normal,
  },
  bodyLarge: {
    fontSize: tokens.compactFontSize.lg,
    lineHeight: tokens.compactLineHeight.lg,
    fontWeight: tokens.fontWeight.normal,
    letterSpacing: tokens.letterSpacing.normal,
  },
  bodySmall: {
    fontSize: tokens.compactFontSize.sm,
    lineHeight: tokens.compactLineHeight.sm,
    fontWeight: tokens.fontWeight.normal,
    letterSpacing: tokens.letterSpacing.normal,
  },

  // Labels and captions - compact
  label: {
    fontSize: tokens.compactFontSize.sm,
    lineHeight: tokens.compactLineHeight.sm,
    fontWeight: tokens.fontWeight.medium,
    letterSpacing: tokens.letterSpacing.wide,
  },
  caption: {
    fontSize: tokens.compactFontSize.xs,
    lineHeight: tokens.compactLineHeight.xs,
    fontWeight: tokens.fontWeight.normal,
    letterSpacing: tokens.letterSpacing.wide,
  },

  // Button text - compact
  button: {
    fontSize: tokens.compactFontSize.base,
    lineHeight: tokens.compactLineHeight.base,
    fontWeight: tokens.fontWeight.medium,
    letterSpacing: tokens.letterSpacing.wide,
  },
  buttonSmall: {
    fontSize: tokens.compactFontSize.sm,
    lineHeight: tokens.compactLineHeight.sm,
    fontWeight: tokens.fontWeight.medium,
    letterSpacing: tokens.letterSpacing.wide,
  },
} as const;

// COMPACT LAYOUT PRESETS - Smaller, less clunky UI components
export const compactLayoutPresets = {
  // Card padding - reduced by 25%
  cardPadding: {
    xs: tokens.compactSpacing.xs, // 3 instead of 4
    sm: tokens.compactSpacing.sm, // 6 instead of 8
    md: tokens.compactSpacing.md, // 11 instead of 16
    lg: tokens.compactSpacing.lg, // 17 instead of 24
    xl: tokens.compactSpacing.xl, // 22 instead of 32
  },

  // Button sizes - more compact
  buttonHeight: {
    sm: 32, // instead of 40
    md: 40, // instead of 48
    lg: 44, // instead of 56
  },

  // Input heights - more compact
  inputHeight: {
    sm: 36, // instead of 44
    md: 44, // instead of 52
    lg: 48, // instead of 60
  },

  // Header heights - more compact
  headerHeight: {
    sm: 48, // instead of 60
    md: 56, // instead of 72
    lg: 64, // instead of 80
  },

  // Tab bar height - more compact
  tabBarHeight: 60, // instead of 80

  // Avatar sizes - more compact
  avatarSize: {
    xs: 24, // instead of 32
    sm: 32, // instead of 40
    md: 40, // instead of 48
    lg: 48, // instead of 64
    xl: 64, // instead of 80
  },

  // Icon sizes - more compact
  iconSize: {
    xs: 12, // instead of 16
    sm: 16, // instead of 20
    md: 20, // instead of 24
    lg: 24, // instead of 28
    xl: 28, // instead of 32
  }
} as const;