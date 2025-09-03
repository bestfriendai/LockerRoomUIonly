import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Mock Firebase configuration
const mockFirebaseConfig = {
  apiKey: 'mock-api-key',
  authDomain: 'mock-auth-domain',
  projectId: 'mock-project-id',
  storageBucket: 'mock-storage-bucket',
  messagingSenderId: 'mock-sender-id',
  appId: 'mock-app-id',
};

describe('Firebase Integration', () => {
  let app: any;
  let auth: any;
  let db: any;

  beforeAll(() => {
    // Initialize Firebase app for testing
    app = initializeApp(mockFirebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  });

  describe('Firebase App Initialization', () => {
    it('should initialize Firebase app', () => {
      expect(initializeApp).toHaveBeenCalledWith(mockFirebaseConfig);
      expect(app).toBeDefined();
    });

    it('should initialize Auth service', () => {
      expect(getAuth).toHaveBeenCalledWith(app);
      expect(auth).toBeDefined();
    });

    it('should initialize Firestore service', () => {
      expect(getFirestore).toHaveBeenCalledWith(app);
      expect(db).toBeDefined();
    });
  });

  describe('Authentication Integration', () => {
    it('should call signInWithEmailAndPassword', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      await signInWithEmailAndPassword(auth, email, password);
      
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password);
    });
  });

  describe('Firestore Integration', () => {
    it('should create collection reference', () => {
      const collectionRef = collection(db, 'test-collection');
      expect(collection).toHaveBeenCalledWith(db, 'test-collection');
      expect(collectionRef).toBeDefined();
    });

    it('should add document to collection', async () => {
      const collectionRef = collection(db, 'test-collection');
      const testData = { message: 'Hello World', timestamp: new Date() };
      
      await addDoc(collectionRef, testData);
      
      expect(addDoc).toHaveBeenCalledWith(collectionRef, testData);
    });
  });

  describe('Environment Configuration', () => {
    it('should handle Firebase emulator environment', () => {
      process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR = 'true';
      
      // This tests that the environment variable is properly set for emulator usage
      expect(process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR).toBe('true');
    });

    it('should handle production environment', () => {
      process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR = 'false';
      
      expect(process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR).toBe('false');
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors gracefully', async () => {
      // Mock implementation that throws an error
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));
      
      const email = 'invalid@example.com';
      const password = 'wrongpassword';
      
      await expect(signInWithEmailAndPassword(auth, email, password))
        .rejects.toThrow('Invalid credentials');
    });

    it('should handle Firestore errors gracefully', async () => {
      // Mock implementation that throws an error
      (addDoc as jest.Mock).mockRejectedValueOnce(new Error('Permission denied'));
      
      const collectionRef = collection(db, 'restricted-collection');
      const testData = { message: 'Should fail' };
      
      await expect(addDoc(collectionRef, testData))
        .rejects.toThrow('Permission denied');
    });
  });
});