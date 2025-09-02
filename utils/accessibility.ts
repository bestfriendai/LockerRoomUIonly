import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Accessibility utilities for better user experience
 */

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
}

/**
 * Generate accessibility label for buttons with dynamic content
 */
export const generateButtonAccessibilityLabel = (
  text: string,
  isLoading?: boolean,
  isDisabled?: boolean,
  additionalInfo?: string
): string => {
  let label = text;
  
  if (isLoading) {
    label += ', loading';
  }
  
  if (isDisabled) {
    label += ', disabled';
  }
  
  if (additionalInfo) {
    label += `, ${additionalInfo}`;
  }
  
  return label;
};

/**
 * Generate accessibility label for form inputs
 */
export const generateInputAccessibilityLabel = (
  label: string,
  value?: string,
  isRequired?: boolean,
  hasError?: boolean,
  errorMessage?: string
): string => {
  let accessibilityLabel = label;
  
  if (isRequired) {
    accessibilityLabel += ', required';
  }
  
  if (hasError && errorMessage) {
    accessibilityLabel += `, error: ${errorMessage}`;
  }
  
  if (value) {
    accessibilityLabel += `, current value: ${value}`;
  }
  
  return accessibilityLabel;
};

/**
 * Generate accessibility label for lists and counts
 */
export const generateListAccessibilityLabel = (
  itemCount: number,
  itemType: string,
  isLoading?: boolean
): string => {
  if (isLoading) {
    return `Loading ${itemType}`;
  }
  
  if (itemCount === 0) {
    return `No ${itemType} available`;
  }
  
  if (itemCount === 1) {
    return `1 ${itemType}`;
  }
  
  return `${itemCount} ${itemType}`;
};

/**
 * Check if screen reader is enabled
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    console.warn('Failed to check screen reader status:', error);
    return false;
  }
};

/**
 * Check if reduce motion is enabled
 */
export const isReduceMotionEnabled = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      return await AccessibilityInfo.isReduceMotionEnabled();
    }
    // Android doesn't have this API yet
    return false;
  } catch (error) {
    console.warn('Failed to check reduce motion status:', error);
    return false;
  }
};

/**
 * Announce message to screen reader
 */
export const announceForAccessibility = (message: string): void => {
  try {
    AccessibilityInfo.announceForAccessibility(message);
  } catch (error) {
    console.warn('Failed to announce for accessibility:', error);
  }
};

/**
 * Set accessibility focus to an element
 */
export const setAccessibilityFocus = (reactTag: number): void => {
  try {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  } catch (error) {
    console.warn('Failed to set accessibility focus:', error);
  }
};

/**
 * Common accessibility props for interactive elements
 */
export const getInteractiveElementProps = (
  label: string,
  hint?: string,
  role: string = 'button',
  state?: AccessibilityProps['accessibilityState']
): AccessibilityProps => ({
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: role,
  accessibilityState: state,
});

/**
 * Common accessibility props for text elements
 */
export const getTextElementProps = (
  text: string,
  role: string = 'text'
): AccessibilityProps => ({
  accessibilityLabel: text,
  accessibilityRole: role,
});

/**
 * Common accessibility props for images
 */
export const getImageElementProps = (
  altText: string,
  isDecorative: boolean = false
): AccessibilityProps => {
  if (isDecorative) {
    return {
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
    } as any;
  }
  
  return {
    accessibilityLabel: altText,
    accessibilityRole: 'image',
  };
};

/**
 * Format time for accessibility
 */
export const formatTimeForAccessibility = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
};
