/**
 * Spacing constants based on 8px grid system
 * All spacing values should be multiples of 8px for consistency
 */

export const SPACING = {
  // Base unit (8px) - optimized for better visual balance
  xs: 4,   // 0.5x
  sm: 8,   // 1x
  md: 14,  // 1.75x - better than 16 for most components
  lg: 20,  // 2.5x - more balanced than 24
  xl: 28,  // 3.5x - reduced from 32
  xxl: 36, // 4.5x - reduced from 40
  xxxl: 44, // 5.5x - reduced from 48

  // Semantic spacing - improved for better proportions
  component: 14,    // Reduced from 16 for tighter layouts
  section: 20,      // Reduced from 24 for better flow
  screen: 16,       // Reduced from 20 for more content space
  card: 14,         // Reduced from 16 for less clunky cards
  button: 12,       // Keep button padding tight
  input: 14,        // Reduced from 16 for better proportions

  // Layout spacing - optimized
  header: 14,       // Reduced from 16
  footer: 14,       // Reduced from 16
  list: 6,          // Reduced from 8 for tighter lists
  grid: 12,         // Reduced from 16 for better grid density
} as const;

// Helper function to get spacing value
export const getSpacing = (key: keyof typeof SPACING): number => {
  return SPACING[key];
};

// Helper function for custom multiples
export const spacing = (multiplier: number): number => {
  return SPACING.sm * multiplier;
};