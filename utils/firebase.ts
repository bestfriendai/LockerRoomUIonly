/**
 * Firebase configuration with React Native compatibility
 * Production-ready setup with proper error handling and platform detection
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  getFirestore,
  initializeFirestore,
  type Firestore
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// App Check for security (production)
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Firebase configuration with validation
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development' || __DEV__;
const isProduction = process.env.NODE_ENV === 'production';
const useEmulators = process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS === 'true' && isDevelopment;

// Validate config
const validateConfig = () => {
  const required = ['apiKey', 'projectId', 'appId'];
  for (const field of required) {
    if (!firebaseConfig[field as keyof typeof firebaseConfig]) {
      console.error(`Missing required Firebase config: ${field}`);
      return false;
    }
  }
  return true;
};

// Initialize Firebase services
const initializeFirebase = () => {
  let firebaseApp: FirebaseApp;
  let firebaseAuth: Auth;
  let firebaseDb: Firestore;
  let firebaseStorage: FirebaseStorage;

  try {
    // Validate configuration
    if (!validateConfig()) {
      throw new Error('Invalid Firebase configuration');
    }

    // Check for existing app
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
      if (__DEV__) {
        console.log('🔥 Using existing Firebase app');
      }
    } else {
      firebaseApp = initializeApp(firebaseConfig);
      if (__DEV__) {
        console.log('🔥 Initialized new Firebase app');
      }
    }

    // Initialize auth with persistence for React Native
    if (Platform.OS === 'web') {
      // For web, use default persistence
      firebaseAuth = getAuth(firebaseApp);
    } else {
      // For React Native, use AsyncStorage persistence
      try {
        firebaseAuth = initializeAuth(firebaseApp, {
          persistence: getReactNativePersistence(AsyncStorage)
        });
        if (isDevelopment) {
          console.log('🔐 Auth initialized with AsyncStorage persistence');
        }
      } catch (authError) {
        // If auth already initialized, get the existing instance
        firebaseAuth = getAuth(firebaseApp);
        if (isDevelopment) {
          console.log('🔐 Using existing auth instance');
        }
      }
    }

    // Initialize Firestore with platform-specific settings
    try {
      if (Platform.OS !== 'web') {
        // React Native specific settings for better performance
        firebaseDb = initializeFirestore(firebaseApp, {
          experimentalForceLongPolling: true,
          useFetchStreams: false,
        });
      } else {
        firebaseDb = getFirestore(firebaseApp);
      }
    } catch (firestoreError) {
      // If Firestore already initialized, get the existing instance
      firebaseDb = getFirestore(firebaseApp);
      if (isDevelopment) {
        console.log('🔥 Using existing Firestore instance');
      }
    }

    firebaseStorage = getStorage(firebaseApp);

    // Connect to emulators in development
    if (useEmulators && isDevelopment) {
      try {
        // Import emulator connection functions
        import('firebase/auth').then(({ connectAuthEmulator }) => {
          try {
            connectAuthEmulator(firebaseAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
          } catch (error) {
            // Already connected
          }
        });

        import('firebase/firestore').then(({ connectFirestoreEmulator }) => {
          try {
            connectFirestoreEmulator(firebaseDb, '127.0.0.1', 8080);
          } catch (error) {
            // Already connected
          }
        });

        import('firebase/storage').then(({ connectStorageEmulator }) => {
          try {
            connectStorageEmulator(firebaseStorage, '127.0.0.1', 9199);
          } catch (error) {
            // Already connected
          }
        });

        if (isDevelopment) {
          console.log('🔧 Connecting to Firebase emulators...');
        }
      } catch (error) {
        if (isDevelopment) {
          console.warn('⚠️ Failed to connect to emulators:', error);
        }
      }
    }

    if (isDevelopment) {
      console.log('🔥 Firebase initialized successfully');
      console.log('📱 Platform:', Platform.OS);
      console.log('🔐 Auth persistence:', Platform.OS === 'web' ? 'default' : 'AsyncStorage');
      console.log('🔧 Using emulators:', useEmulators);
    }

    return {
      app: firebaseApp,
      auth: firebaseAuth,
      db: firebaseDb,
      storage: firebaseStorage
    };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    // Return mock objects to prevent crashes
    return {
      app: {} as FirebaseApp,
      auth: {} as Auth,
      db: {} as Firestore,
      storage: {} as FirebaseStorage,
    };
  }
};

// Initialize Firebase App Check for production security
export const initializeFirebaseAppCheck = async () => {
  try {
    if (isProduction && Platform.OS === 'web') {
      // Only initialize App Check in production for web
      // For React Native, App Check requires additional setup
      const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY || ''),
        isTokenAutoRefreshEnabled: true
      });
      if (isDevelopment) {
        console.log('🛡️ Firebase App Check initialized');
      }
      return appCheck;
    }
  } catch (error) {
    if (isDevelopment) {
      console.warn('⚠️ App Check initialization failed:', error);
    }
  }
  return null;
};

// Initialize on import
const firebase = initializeFirebase();

// Export initialized instances
export const app = firebase.app;
export const auth = firebase.auth;
export const db = firebase.db;
export const storage = firebase.storage;

// Backward compatibility exports
export const firebaseApp = app;
export const firebaseAuth = auth;
export const firebaseDb = db;

// Export getters for components that need them
export const getFirebaseApp = () => app;
export const getFirebaseAuth = () => auth;
export const getFirebaseDb = () => db;
export const getFirebaseStorage = () => storage;

// Export config for reference
export { firebaseConfig };

// Default export for convenience
export default {
  app,
  auth,
  db,
  storage,
};