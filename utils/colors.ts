/**
 * Modern color system for LockerRoom Talk
 * Replacing harsh blacks with sophisticated dark grays and refined color palette
 */

export const colors = {
  // Primary Colors - Professional blue palette
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
  
  // Neutral Colors - Sophisticated dark grays replacing harsh black
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
    950: '#0A0A0A', // Softer than pure black for better eye comfort
  },
  
  // Semantic Colors for UI feedback
  success: {
    light: '#4ADE80',
    main: '#22C55E',
    dark: '#16A34A',
  },
  warning: {
    light: '#FED7AA',
    main: '#FB923C',
    dark: '#EA580C',
  },
  error: {
    light: '#FCA5A5',
    main: '#EF4444',
    dark: '#DC2626',
  },
  info: {
    light: '#93C5FD',
    main: '#3B82F6',
    dark: '#1E40AF',
  },
  
  // Gradient Combinations for visual interest
  gradients: {
    primary: 'linear-gradient(135deg, #4285F4 0%, #669DF6 100%)',
    dark: 'linear-gradient(180deg, #0A0A0A 0%, #171717 100%)',
    card: 'linear-gradient(145deg, rgba(66,133,244,0.05) 0%, rgba(102,157,246,0.02) 100%)',
    success: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
    error: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    premium: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  },

  // Special UI Colors
  background: {
    primary: '#0A0A0A',
    secondary: '#171717',
    elevated: '#262626',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  text: {
    primary: '#FAFAFA',
    secondary: '#A3A3A3',
    disabled: '#525252',
    inverse: '#0A0A0A',
  },

  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    strong: 'rgba(255, 255, 255, 0.3)',
  },
};

export default colors;