import { Alert, Platform } from 'react-native';

// Firebase auth error codes to user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email. Please sign up first.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your internet connection.',
  'auth/requires-recent-login': 'Please sign in again to continue.',
  'auth/invalid-verification-code': 'Invalid verification code. Please try again.',
  'auth/invalid-verification-id': 'Verification expired. Please request a new code.',
  
  // Firestore errors
  'permission-denied': 'You don\'t have permission to perform this action.',
  'unavailable': 'Service temporarily unavailable. Please try again later.',
  'deadline-exceeded': 'Request timed out. Please check your connection and try again.',
  'resource-exhausted': 'Too many requests. Please slow down.',
  'failed-precondition': 'Operation failed. Please try again.',
  'aborted': 'Operation was cancelled. Please try again.',
  'out-of-range': 'Invalid request. Please check your input.',
  'unimplemented': 'This feature is not available yet.',
  'internal': 'An internal error occurred. Please try again later.',
  'data-loss': 'Data loss detected. Please contact support.',
  
  // Default
  'default': 'An unexpected error occurred. Please try again.',
};

export interface ErrorInfo {
  title: string;
  message: string;
  code?: string;
  originalError?: any;
}

/**
 * Get user-friendly error message from Firebase error
 */
export function getErrorMessage(error: any): string {
  if (!error) return ERROR_MESSAGES.default;
  
  // Handle Firebase Auth errors
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  
  // Handle Firestore errors
  if (error.message) {
    const lowerMessage = error.message.toLowerCase();
    for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
      if (lowerMessage.includes(key.replace('auth/', ''))) {
        return value;
      }
    }
  }
  
  // Return original message if it's somewhat readable
  if (error.message && error.message.length < 100) {
    return error.message;
  }
  
  return ERROR_MESSAGES.default;
}

/**
 * Show error alert to user
 */
export function showErrorAlert(
  error: any,
  title: string = 'Error',
  onDismiss?: () => void
): void {
  const message = getErrorMessage(error);
  
  if (Platform.OS === 'web') {
    // For web, use browser alert
    window.alert(`${title}\n\n${message}`);
    onDismiss?.();
  } else {
    // For mobile, use React Native Alert
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          onPress: onDismiss,
          style: 'default',
        },
      ],
      { cancelable: true, onDismiss }
    );
  }
}

/**
 * Show success alert to user
 */
export function showSuccessAlert(
  message: string,
  title: string = 'Success',
  onDismiss?: () => void
): void {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    onDismiss?.();
  } else {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          onPress: onDismiss,
          style: 'default',
        },
      ],
      { cancelable: false }
    );
  }
}

/**
 * Show confirmation dialog
 */
export function showConfirmDialog(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = 'Confirm',
  cancelText: string = 'Cancel',
  destructive: boolean = false
): void {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      onConfirm();
    } else {
      onCancel?.();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        {
          text: cancelText,
          onPress: onCancel,
          style: 'cancel',
        },
        {
          text: confirmText,
          onPress: onConfirm,
          style: destructive ? 'destructive' : 'default',
        },
      ],
      { cancelable: true, onDismiss: onCancel }
    );
  }
}

/**
 * Log error for debugging (only in dev mode)
 */
export function logError(error: any, context?: string): void {
  if (__DEV__) {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
    if (error.code) console.error('Error Code:', error.code);
    if (error.message) console.error('Error Message:', error.message);
    if (error.stack) console.error('Stack Trace:', error.stack);
  }
}