import { Timestamp } from 'firebase/firestore';

/**
 * Convert various timestamp formats to a JavaScript Date object
 */
export function toDate(timestamp: Timestamp | Date | number | string | null | undefined): Date | null {
  if (!timestamp) return null;
  
  // Handle Firestore Timestamp
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return timestamp.toDate();
  }
  
  // Handle Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // Handle number (milliseconds) or string
  if (typeof timestamp === 'number' || typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  
  return null;
}

/**
 * Convert various timestamp formats to milliseconds
 */
export function toMillis(timestamp: Timestamp | Date | number | string | null | undefined): number {
  if (!timestamp) return 0;
  
  // Handle Firestore Timestamp
  if (timestamp && typeof timestamp === 'object' && 'toMillis' in timestamp) {
    return timestamp.toMillis();
  }
  
  const date = toDate(timestamp);
  return date ? date.getTime() : 0;
}

/**
 * Format a timestamp to a time string
 */
export function formatTime(timestamp: Timestamp | Date | number | string | null | undefined): string {
  const date = toDate(timestamp);
  if (!date) return '';
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format a timestamp to a date string
 */
export function formatDate(timestamp: Timestamp | Date | number | string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  const date = toDate(timestamp);
  if (!date) return '';
  
  return date.toLocaleDateString('en-US', options);
}