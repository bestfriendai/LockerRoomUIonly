import { Platform } from 'react-native';

// Enhanced shadow and border system for consistent card styling
export const SHADOWS = {
  // Elevation levels based on Material Design principles
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  // Light shadows for subtle elevation - enhanced for better depth
  xs: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,  // Increased from 0.05 for better visibility
      shadowRadius: 2,      // Increased from 1 for softer shadow
    },
    android: {
      elevation: 1,
    },
  }),

  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,  // Increased from 0.08 for better definition
      shadowRadius: 4,      // Increased from 3 for softer edges
    },
    android: {
      elevation: 3,         // Increased from 2 for better Android shadow
    },
  }),

  // Medium shadows for cards and modals - enhanced for modern look
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,  // Increased from 0.12 for better depth
      shadowRadius: 8,      // Increased from 6 for softer shadow
    },
    android: {
      elevation: 6,         // Increased from 4 for better elevation
    },
  }),
  
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,  // Increased from 0.15 for better prominence
      shadowRadius: 16,     // Increased from 12 for softer shadow
    },
    android: {
      elevation: 8,
    },
  }),

  // Heavy shadows for floating elements - enhanced for modern depth
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.22,  // Increased from 0.18 for better depth
      shadowRadius: 20,     // Increased from 16 for softer edges
    },
    android: {
      elevation: 12,
    },
  }),

  xxl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.25,  // Increased from 0.22 for dramatic effect
      shadowRadius: 28,     // Increased from 24 for very soft shadow
    },
    android: {
      elevation: 16,
    },
  }),
} as const;

// Border radius constants for consistent rounded corners
export const BORDER_RADIUS = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  full: 9999,
} as const;

// Border width constants
export const BORDER_WIDTH = {
  none: 0,
  hairline: 0.5,
  thin: 1,
  medium: 2,
  thick: 3,
} as const;

// Semantic shadow presets for specific UI elements
export const CARD_SHADOWS = {
  // Basic card with subtle shadow
  default: SHADOWS.sm,
  
  // Elevated card for important content
  elevated: SHADOWS.md,
  
  // Floating card for overlays and modals
  floating: SHADOWS.lg,
  
  // Interactive card that responds to press
  interactive: SHADOWS.xs,
  interactivePressed: SHADOWS.md,
  
  // FAB and primary action buttons
  fab: SHADOWS.xl,
  
  // Modal and dialog shadows
  modal: SHADOWS.xxl,
} as const;

// Helper function to get shadow style with theme-aware colors
export const getShadowStyle = (shadowLevel: keyof typeof SHADOWS, shadowColor?: string) => {
  const shadow = SHADOWS[shadowLevel];
  if (!shadow) return SHADOWS.none;
  
  if (Platform.OS === 'ios' && shadowColor) {
    return {
      ...shadow,
      shadowColor,
    };
  }
  
  return shadow;
};

// Helper function to create card style with shadow and border
export const createCardStyle = ({
  shadow = 'default',
  borderRadius = 'md',
  borderWidth = 'none',
  borderColor,
  backgroundColor,
  shadowColor,
}: {
  shadow?: keyof typeof CARD_SHADOWS;
  borderRadius?: keyof typeof BORDER_RADIUS;
  borderWidth?: keyof typeof BORDER_WIDTH;
  borderColor?: string;
  backgroundColor?: string;
  shadowColor?: string;
} = {}) => {
  return {
    ...getShadowStyle(CARD_SHADOWS[shadow] === SHADOWS.xs ? 'xs' : 
                     CARD_SHADOWS[shadow] === SHADOWS.sm ? 'sm' :
                     CARD_SHADOWS[shadow] === SHADOWS.md ? 'md' :
                     CARD_SHADOWS[shadow] === SHADOWS.lg ? 'lg' :
                     CARD_SHADOWS[shadow] === SHADOWS.xl ? 'xl' : 'sm', shadowColor),
    borderRadius: BORDER_RADIUS[borderRadius],
    borderWidth: BORDER_WIDTH[borderWidth],
    ...(borderColor && { borderColor }),
    ...(backgroundColor && { backgroundColor }),
  };
};

// Modern shadow presets for specific UI elements
export const MODERN_SHADOWS = {
  // For buttons and interactive elements
  button: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
  }),

  // For cards and content containers
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),

  // For floating action buttons
  fab: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
  }),

  // For modals and overlays
  modal: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
    },
    android: {
      elevation: 16,
    },
  }),

  // For navigation bars and headers
  header: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
    },
  }),
} as const;