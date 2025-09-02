/**
 * Firebase configuration optimized for React Native
 * This file provides a more compatible Firebase setup for iOS/Android
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  type Firestore 
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Initialize Firebase App
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  // Check if app already exists
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    console.log('🔥 Using existing Firebase app');
  } else {
    app = initializeApp(firebaseConfig);
    console.log('🔥 Initialized new Firebase app');
  }

  // Initialize Auth - simplified for React Native
  try {
    auth = getAuth(app);
  } catch (authError) {
    console.warn('⚠️ Standard auth failed, trying basic initialization');
    auth = getAuth(app);
  }

  // Initialize Firestore with React Native settings
  try {
    if (Platform.OS !== 'web') {
      // React Native specific settings
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        useFetchStreams: false,
      });
    } else {
      db = getFirestore(app);
    }
  } catch (firestoreError) {
    console.warn('⚠️ Custom Firestore init failed, using default');
    db = getFirestore(app);
  }

  // Initialize Storage
  storage = getStorage(app);

} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  // Create dummy instances to prevent app crash
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
}

// Export instances
export { app, auth, db, storage };
export const firebaseApp = app;
export const firebaseAuth = auth;
export const firebaseDb = db;

// Export getters for lazy initialization
export const getFirebaseApp = () => app;
export const getFirebaseAuth = () => auth;
export const getFirebaseDb = () => db;
export const getFirebaseStorage = () => storage;