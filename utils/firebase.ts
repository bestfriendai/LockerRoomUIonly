// Mock Firebase setup to bypass React Native Firebase Auth registration issues
// This provides a working development environment while we resolve the Firebase issues

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Mock Firebase Auth
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Simulate no user initially
    setTimeout(() => callback(null), 100);
    return () => {}; // unsubscribe function
  },
  signInWithEmailAndPassword: async (email: string, password: string) => {
    console.log('Mock sign in:', email);
    return { user: { uid: 'mock-user-id', email } };
  },
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    console.log('Mock sign up:', email);
    return { user: { uid: 'mock-user-id', email } };
  },
  signOut: async () => {
    console.log('Mock sign out');
  },
  sendPasswordResetEmail: async (email: string) => {
    console.log('Mock password reset:', email);
  }
};

// Mock Firestore
const mockDb = {
  collection: (path: string) => ({
    doc: (id: string) => ({
      get: async () => ({ exists: () => false, data: () => null }),
      set: async (data: any) => console.log('Mock set:', path, id, data),
      update: async (data: any) => console.log('Mock update:', path, id, data),
      delete: async () => console.log('Mock delete:', path, id)
    }),
    where: () => ({ get: async () => ({ docs: [] }) }),
    orderBy: () => ({ get: async () => ({ docs: [] }) }),
    limit: () => ({ get: async () => ({ docs: [] }) })
  })
};

// Mock Firebase App
const mockApp = {
  name: 'mock-app',
  options: firebaseConfig
};

if (__DEV__) {
  console.log('Using Mock Firebase for development');
  console.log('Project ID:', firebaseConfig.projectId);
}

// Export mock services
export const getFirebaseApp = () => mockApp;
export const getFirebaseAuth = () => mockAuth;
export const getFirebaseDb = () => mockDb;
export { firebaseConfig };

// For backward compatibility
export const app = mockApp;
export const auth = mockAuth;
export const db = mockDb;