import { Timestamp } from 'firebase/firestore';

/**
 * Safely converts Firestore timestamps to Date objects
 * Handles various timestamp formats across React Native and Web platforms
 */
export function toDate(timestamp: Timestamp | Date | number | string | null | undefined | { seconds: number; nanoseconds?: number; toDate?: () => Date }): Date | null {
  if (!timestamp) return null;
  
  // Already a Date object
  if (timestamp instanceof Date) return timestamp;
  
  // Firestore Timestamp object with toDate method
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // Handle plain object with seconds/nanoseconds (serialized Firestore timestamp)
  if (typeof timestamp.seconds === 'number') {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds || 0).toDate();
  }
  
  // Handle number (milliseconds) or string
  if (typeof timestamp === 'number' || typeof timestamp === 'string') {
    try {
      return new Date(timestamp);
    } catch (error) {
      console.warn('Unable to parse timestamp:', timestamp);
      return null;
    }
  }
  
  // Fallback: try to parse as regular Date
  try {
    return new Date(timestamp);
  } catch (error) {
    console.warn('Unable to parse timestamp:', timestamp);
    return null;
  }
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

/**
 * Formats a timestamp into a human-readable relative time string
 * Returns "Invalid Date" for unparseable timestamps
 */
export function formatRelativeTime(date: Timestamp | Date | number | string | null | undefined): string {
  const d = toDate(date);
  if (!d || isNaN(d.getTime())) return "Invalid Date";
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  // Future dates
  if (diffInSeconds < 0) {
    const absDiff = Math.abs(diffInSeconds);
    if (absDiff < 60) return 'in a moment';
    const diffInMinutes = Math.floor(absDiff / 60);
    if (diffInMinutes < 60) return `in ${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `in ${diffInHours}h`;
    return d.toLocaleDateString();
  }
  
  // Past dates
  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  // For older dates, show formatted date
  return d.toLocaleDateString();
}

/**
 * Formats a timestamp for display in a more detailed format
 * Useful for detailed views like message timestamps
 */
export function formatDetailedTime(date: Timestamp | Date | number | string | null | undefined): string {
  const d = toDate(date);
  if (!d || isNaN(d.getTime())) return "Invalid Date";
  
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === d.toDateString();
  
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (isYesterday) {
    return `Yesterday ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return d.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}

/**
 * Creates a Firestore-compatible timestamp from a Date
 * Useful for creating timestamps when writing to Firestore
 */
export function createTimestamp(date?: Date): Timestamp {
  return Timestamp.fromDate(date || new Date());
}

/**
 * Safely compares two timestamps
 * Returns -1 if a < b, 1 if a > b, 0 if equal, null if comparison fails
 */
export function compareTimestamps(a: Timestamp | Date | number | string | null | undefined, b: Timestamp | Date | number | string | null | undefined): number | null {
  const dateA = toDate(a);
  const dateB = toDate(b);
  
  if (!dateA || !dateB || isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
    return null;
  }
  
  if (dateA.getTime() < dateB.getTime()) return -1;
  if (dateA.getTime() > dateB.getTime()) return 1;
  return 0;
}