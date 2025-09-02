import { AccessibilityInfo, Platform } from 'react-native';

// Accessibility utilities for LockerRoom Talk
export interface AccessibilityProps {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  accessible?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

// Screen reader utilities
export const screenReader = {
  // Check if screen reader is enabled
  isEnabled: async (): Promise<boolean> => {
    try {
      return await AccessibilityInfo.isScreenReaderEnabled();
    } catch {
      return false;
    }
  },

  // Announce message to screen reader
  announce: (message: string): void => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    } else {
      // Android equivalent
      AccessibilityInfo.announceForAccessibility(message);
    }
  },

  // Set focus to element (iOS only)
  setFocus: (reactTag: number): void => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  },
};

// Color contrast utilities
export const colorContrast = {
  // Calculate contrast ratio between two colors
  getContrastRatio: (color1: string, color2: string): number => {
    const getLuminance = (color: string): number => {
      // Convert hex to RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      // Calculate relative luminance
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if contrast meets WCAG standards
  meetsWCAG: (color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = colorContrast.getContrastRatio(color1, color2);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  },
};

// Touch target utilities
export const touchTarget = {
  // Minimum touch target size (44x44 dp)
  minSize: 44,

  // Ensure minimum touch target size
  ensureMinimumSize: (width: number, height: number) => ({
    minWidth: Math.max(width, touchTarget.minSize),
    minHeight: Math.max(height, touchTarget.minSize),
  }),

  // Add padding to reach minimum touch target
  addPadding: (width: number, height: number) => {
    const paddingHorizontal = Math.max(0, (touchTarget.minSize - width) / 2);
    const paddingVertical = Math.max(0, (touchTarget.minSize - height) / 2);
    return { paddingHorizontal, paddingVertical };
  },
};

// Accessibility role helpers
export const accessibilityRoles = {
  button: 'button' as const,
  link: 'link' as const,
  text: 'text' as const,
  heading: 'header' as const,
  image: 'image' as const,
  imageButton: 'imagebutton' as const,
  search: 'search' as const,
  tab: 'tab' as const,
  tabList: 'tablist' as const,
  list: 'list' as const,
  listItem: 'listitem' as const,
  checkbox: 'checkbox' as const,
  radio: 'radio' as const,
  switch: 'switch' as const,
  progressBar: 'progressbar' as const,
  alert: 'alert' as const,
  menu: 'menu' as const,
  menuItem: 'menuitem' as const,
  toolbar: 'toolbar' as const,
  summary: 'summary' as const,
  none: 'none' as const,
};

// Common accessibility patterns
export const accessibilityPatterns = {
  // Button with loading state
  loadingButton: (isLoading: boolean, label: string): AccessibilityProps => ({
    accessibilityRole: accessibilityRoles.button,
    accessibilityLabel: label,
    accessibilityState: { busy: isLoading },
    accessibilityHint: isLoading ? 'Loading, please wait' : undefined,
  }),

  // Toggle button (like/favorite)
  toggleButton: (isToggled: boolean, label: string, hint?: string): AccessibilityProps => ({
    accessibilityRole: accessibilityRoles.button,
    accessibilityLabel: label,
    accessibilityState: { selected: isToggled },
    accessibilityHint: hint,
  }),

  // Form input with validation
  formInput: (label: string, error?: string, required?: boolean): AccessibilityProps => ({
    accessibilityLabel: `${label}${required ? ', required' : ''}`,
    accessibilityHint: error || undefined,
    accessibilityState: { disabled: false },
  }),

  // Rating component
  rating: (currentRating: number, maxRating: number): AccessibilityProps => ({
    accessibilityRole: accessibilityRoles.button,
    accessibilityLabel: `Rating`,
    accessibilityValue: {
      now: currentRating,
      min: 0,
      max: maxRating,
      text: `${currentRating} out of ${maxRating} stars`,
    },
  }),

  // Progress indicator
  progress: (current: number, total: number, label?: string): AccessibilityProps => ({
    accessibilityRole: accessibilityRoles.progressBar,
    accessibilityLabel: label || 'Progress',
    accessibilityValue: {
      now: current,
      min: 0,
      max: total,
      text: `${current} of ${total}`,
    },
  }),

  // Card with action
  actionCard: (title: string, description?: string): AccessibilityProps => ({
    accessibilityRole: accessibilityRoles.button,
    accessibilityLabel: title,
    accessibilityHint: description || 'Double tap to open',
  }),

  // List item
  listItem: (title: string, subtitle?: string, position?: { index: number; total: number }): AccessibilityProps => ({
    accessibilityRole: accessibilityRoles.listItem,
    accessibilityLabel: `${title}${subtitle ? `, ${subtitle}` : ''}`,
    accessibilityHint: position ? `Item ${position.index + 1} of ${position.total}` : undefined,
  }),

  // Tab navigation
  tab: (label: string, isSelected: boolean, position: { index: number; total: number }): AccessibilityProps => ({
    accessibilityRole: accessibilityRoles.tab,
    accessibilityLabel: label,
    accessibilityState: { selected: isSelected },
    accessibilityHint: `Tab ${position.index + 1} of ${position.total}`,
  }),

  // Search input
  searchInput: (placeholder: string, hasResults?: boolean, resultCount?: number): AccessibilityProps => ({
    accessibilityRole: accessibilityRoles.search,
    accessibilityLabel: placeholder,
    accessibilityHint: hasResults && resultCount !== undefined 
      ? `${resultCount} results found` 
      : 'Enter text to search',
  }),

  // Empty state
  emptyState: (title: string, description: string): AccessibilityProps => ({
    accessibilityRole: accessibilityRoles.text,
    accessibilityLabel: `${title}. ${description}`,
    importantForAccessibility: 'yes',
  }),
};

// Accessibility testing helpers
export const accessibilityTesting = {
  // Generate test IDs for automated testing
  generateTestId: (component: string, variant?: string, index?: number): string => {
    let testId = `${component}`;
    if (variant) testId += `-${variant}`;
    if (index !== undefined) testId += `-${index}`;
    return testId.toLowerCase().replace(/\s+/g, '-');
  },

  // Validate accessibility props
  validateProps: (props: AccessibilityProps): string[] => {
    const warnings: string[] = [];

    if (props.accessibilityRole === accessibilityRoles.button && !props.accessibilityLabel) {
      warnings.push('Button should have accessibilityLabel');
    }

    if (props.accessibilityRole === accessibilityRoles.image && !props.accessibilityLabel) {
      warnings.push('Image should have accessibilityLabel');
    }

    return warnings;
  },
};

// Reduced motion utilities
export const reducedMotion = {
  // Check if user prefers reduced motion
  isEnabled: async (): Promise<boolean> => {
    try {
      return await AccessibilityInfo.isReduceMotionEnabled();
    } catch {
      return false;
    }
  },

  // Get animation duration based on reduced motion preference
  getDuration: async (normalDuration: number, reducedDuration: number = 0): Promise<number> => {
    const isReduced = await reducedMotion.isEnabled();
    return isReduced ? reducedDuration : normalDuration;
  },
};

// Focus management utilities
export const focusManagement = {
  // Trap focus within a container
  trapFocus: (containerRef: React.RefObject<any>) => {
    // Implementation would depend on specific focus trapping needs
    // This is a placeholder for focus trap logic
  },

  // Restore focus to previous element
  restoreFocus: (previousElement: React.RefObject<any>) => {
    if (previousElement.current) {
      previousElement.current.focus();
    }
  },
};

// High contrast mode utilities
export const highContrast = {
  // Check if high contrast mode is enabled (iOS only)
  isEnabled: async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      try {
        return await AccessibilityInfo.isHighContrastEnabled();
      } catch {
        return false;
      }
    }
    return false;
  },

  // Get high contrast colors
  getColors: (isDark: boolean) => ({
    text: isDark ? '#FFFFFF' : '#000000',
    background: isDark ? '#000000' : '#FFFFFF',
    border: isDark ? '#FFFFFF' : '#000000',
    primary: isDark ? '#00FFFF' : '#0000FF',
    error: '#FF0000',
    success: '#00FF00',
    warning: '#FFFF00',
  }),
};

export default {
  screenReader,
  colorContrast,
  touchTarget,
  accessibilityRoles,
  accessibilityPatterns,
  accessibilityTesting,
  reducedMotion,
  focusManagement,
  highContrast,
};
