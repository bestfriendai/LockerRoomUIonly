/**
 * Firebase configuration with React Native compatibility
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
  type Firestore 
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

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
        if (__DEV__) {
          console.log('🔐 Auth initialized with AsyncStorage persistence');
        }
      } catch (authError) {
        // If auth already initialized, get the existing instance
        firebaseAuth = getAuth(firebaseApp);
        if (__DEV__) {
          console.log('🔐 Using existing auth instance');
        }
      }
    }
    
    firebaseDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);

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