/**
 * Centralized category definitions for the app
 * This ensures consistency between frontend forms and backend validation
 */

// Valid review categories that match backend sanitization
// Updated to new simplified categories: Men, Women, LGBT
export const REVIEW_CATEGORIES = [
  "Men",
  "Women",
  "LGBT"
] as const;

// Extended categories available in backend (for future use)
export const ALL_VALID_CATEGORIES = [
  'men',
  'women',
  'lgbt',
  // Legacy categories for backward compatibility
  'dating',
  'hookup',
  'relationship',
  'casual',
  'fwb',
  'sugarbaby',
  'sugardaddy',
  'escort',
  'massage',
  'party',
  'club',
  'bar',
  'social'
] as const;

// Home screen filter categories (different from review categories)
export const FILTER_CATEGORIES = [
  { id: "All", label: "All" },
  { id: "Women", label: "Women" },
  { id: "Men", label: "Men" },
  { id: "LGBT", label: "LGBT" },
] as const;

// Category display labels for UI
export const CATEGORY_LABELS: Record<string, string> = {
  men: "Men",
  women: "Women",
  lgbt: "LGBT",
  // Legacy labels
  dating: "Dating",
  hookup: "Hookup",
  relationship: "Relationship",
  casual: "Casual",
  social: "Social",
  fwb: "Friends with Benefits",
  sugarbaby: "Sugar Baby",
  sugardaddy: "Sugar Daddy",
  escort: "Escort",
  massage: "Massage",
  party: "Party",
  club: "Club",
  bar: "Bar"
};

// Type definitions
export type ReviewCategory = typeof REVIEW_CATEGORIES[number];
export type ValidCategory = typeof ALL_VALID_CATEGORIES[number];
export type FilterCategory = typeof FILTER_CATEGORIES[number];