import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, type Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Lazy initialization variables
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Lazy initialization function
function initializeFirebase() {
  if (app && auth && db) return { app, auth, db };

  try {
    // Initialize Firebase app
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

    // Initialize Auth with proper RN persistence on native
    if (typeof document === 'undefined') {
      try {
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } catch (e) {
        // If Auth was already initialized (e.g., Fast Refresh), fall back
        auth = getAuth(app);
      }
    } else {
      auth = getAuth(app);
    }

    // Initialize Firestore
    db = getFirestore(app);

    if (__DEV__) {
      console.log('Firebase initialized with project:', firebaseConfig.projectId);
    }

    return { app, auth, db };
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw error;
  }
}

// Export lazy getters
export const getFirebaseApp = () => initializeFirebase().app;
export const getFirebaseAuth = () => initializeFirebase().auth;
export const getFirebaseDb = () => initializeFirebase().db;
export { firebaseConfig };

// For backward compatibility, export the lazy-initialized instances
export const { app: firebaseApp, auth: firebaseAuth, db: firebaseDb } = new Proxy({} as any, {
  get(target, prop) {
    const firebase = initializeFirebase();
    return firebase[prop as keyof typeof firebase];
  }
});

// Default exports for convenience
export { firebaseApp as app, firebaseAuth as auth, firebaseDb as db };