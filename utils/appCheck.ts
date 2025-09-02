/**
 * Firebase App Check Configuration
 * Provides app attestation and anti-abuse protection
 */

import { initializeAppCheck, ReCaptchaV3Provider, getToken, AppCheck } from 'firebase/app-check';
import { Platform } from 'react-native';
import { getFirebaseApp } from './firebase';

let appCheck: AppCheck | null = null;

/**
 * Initialize Firebase App Check for abuse prevention
 */
export const initializeFirebaseAppCheck = async () => {
  try {
    const app = getFirebaseApp();
    
    if (Platform.OS === 'web') {
      // Use ReCaptcha for web
      const siteKey = process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY;
      
      if (!siteKey) {
        console.warn('ReCaptcha site key not configured. App Check disabled for web.');
        return null;
      }
      
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true
      });
    } else {
      // For mobile platforms, App Check requires native configuration
      // This would be configured in app.json or app.config.js
      if (__DEV__) {
        console.log('App Check requires native configuration for mobile platforms');
      }
      return null;
    }
    
    if (__DEV__) {
      console.log('✅ Firebase App Check initialized');
    }
    
    return appCheck;
  } catch (error) {
    console.error('Failed to initialize App Check:', error);
    return null;
  }
};

/**
 * Get App Check token for API requests
 */
export const getAppCheckToken = async (): Promise<string | null> => {
  if (!appCheck) {
    return null;
  }
  
  try {
    const tokenResponse = await getToken(appCheck);
    return tokenResponse.token;
  } catch (error) {
    console.error('Failed to get App Check token:', error);
    return null;
  }
};

/**
 * Verify App Check is properly configured
 */
export const verifyAppCheck = async (): Promise<boolean> => {
  try {
    const token = await getAppCheckToken();
    return token !== null;
  } catch {
    return false;
  }
};