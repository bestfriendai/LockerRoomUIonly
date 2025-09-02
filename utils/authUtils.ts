import { getFirebaseAuth } from './firebase';

/**
 * Utility functions for authentication checks
 */

/**
 * Check if user is currently authenticated and ready for Firestore operations
 */
export const isUserAuthenticated = (): boolean => {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    
    // User must exist and be properly initialized
    return user !== null && user.uid !== undefined;
  } catch (error) {
    if (__DEV__) {
      console.warn('Auth check failed:', error);
    }
    return false;
  }
};

/**
 * Get current user ID if authenticated
 */
export const getCurrentUserId = (): string | null => {
  try {
    const auth = getFirebaseAuth();
    return auth.currentUser?.uid || null;
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to get current user ID:', error);
    }
    return null;
  }
};

/**
 * Wait for authentication to be ready (with timeout)
 */
export const waitForAuth = (timeoutMs: number = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    const auth = getFirebaseAuth();
    
    if (auth.currentUser) {
      resolve(true);
      return;
    }

    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeoutMs);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(true);
      }
    });
  });
};

/**
 * Create a standardized authentication error
 */
export const createAuthError = (operation: string): Error => {
  return new Error(`Authentication required for ${operation}. Please sign in and try again.`);
};
