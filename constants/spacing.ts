/**
 * Spacing constants based on 8px grid system
 * All spacing values should be multiples of 8px for consistency
 */

export const SPACING = {
  // Base unit (8px)
  xs: 4,   // 0.5x
  sm: 8,   // 1x
  md: 16,  // 2x
  lg: 24,  // 3x
  xl: 32,  // 4x
  xxl: 40, // 5x
  xxxl: 48, // 6x
  
  // Semantic spacing
  component: 16,    // Standard component padding
  section: 24,      // Section spacing
  screen: 20,       // Screen edge padding
  card: 16,         // Card internal padding
  button: 12,       // Button padding
  input: 16,        // Input field padding
  
  // Layout spacing
  header: 16,       // Header padding
  footer: 16,       // Footer padding
  list: 8,          // List item spacing
  grid: 16,         // Grid gap
} as const;

// Helper function to get spacing value
export const getSpacing = (key: keyof typeof SPACING): number => {
  return SPACING[key];
};

// Helper function for custom multiples
export const spacing = (multiplier: number): number => {
  return SPACING.sm * multiplier;
};