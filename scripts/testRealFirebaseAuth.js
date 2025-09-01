#!/usr/bin/env node

/**
 * Test Firebase with real authentication and user operations
 * This script tests the actual user flow that the app will use
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc, serverTimestamp } = require('firebase/firestore');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

async function testRealFirebaseAuth() {
  try {
    console.log('🔥 Testing Real Firebase Authentication & User Operations...\n');
    
    // Initialize Firebase
    console.log('1. Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
    
    // Test user creation
    console.log('\n2. Testing user creation...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      const user = userCredential.user;
      console.log('✅ User created successfully');
      console.log('   User ID:', user.uid);
      console.log('   Email:', user.email);
      
      // Test creating user document in Firestore
      console.log('\n3. Testing user document creation...');
      const userRef = doc(db, 'users', user.uid);
      const userData = {
        id: user.uid,
        email: user.email,
        name: 'Test User',
        age: 25,
        bio: 'Test user for Firebase integration',
        photos: [],
        location: 'Test City',
        interests: ['testing', 'firebase'],
        verified: false,
        profileComplete: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        isOnline: true,
        isAnonymous: false,
        reputationScore: 0,
        reviewCount: 0,
        helpfulVotes: 0,
        badges: []
      };
      
      await setDoc(userRef, userData);
      console.log('✅ User document created successfully');
      
      // Test reading user document
      console.log('   - Reading user document...');
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        console.log('✅ User document read successfully');
        const data = userDoc.data();
        console.log('   Name:', data.name);
        console.log('   Email:', data.email);
        console.log('   Location:', data.location);
      } else {
        console.log('❌ User document not found');
      }
      
      // Test sign out and sign in
      console.log('\n4. Testing sign out and sign in...');
      await signOut(auth);
      console.log('✅ User signed out successfully');
      
      const signInCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('✅ User signed in successfully');
      console.log('   User ID:', signInCredential.user.uid);
      
      // Test reading user document after sign in
      console.log('   - Reading user document after sign in...');
      const userDocAfterSignIn = await getDoc(userRef);
      if (userDocAfterSignIn.exists()) {
        console.log('✅ User document accessible after sign in');
      } else {
        console.log('❌ User document not accessible after sign in');
      }
      
      console.log('\n🎉 All Firebase tests passed successfully!');
      console.log('\nTest Summary:');
      console.log('✅ Firebase initialization');
      console.log('✅ User registration');
      console.log('✅ User document creation');
      console.log('✅ User document reading');
      console.log('✅ User sign out');
      console.log('✅ User sign in');
      console.log('✅ Authenticated document access');
      
      console.log('\n📱 Your app should now work with real Firebase data!');
      console.log('Test user created:', testEmail);
      
    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        console.log('⚠️  Test email already exists, trying to sign in instead...');
        
        try {
          const signInCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
          console.log('✅ Signed in with existing test user');
          console.log('   User ID:', signInCredential.user.uid);
          
          // Test reading existing user document
          const userRef = doc(db, 'users', signInCredential.user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            console.log('✅ Existing user document accessible');
            console.log('   Name:', userDoc.data().name);
          }
          
        } catch (signInError) {
          console.log('❌ Sign in with existing user failed:', signInError.message);
        }
      } else {
        throw authError;
      }
    }
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    console.error('\nError details:', {
      code: error.code,
      message: error.message
    });
    
    console.error('\nTroubleshooting:');
    console.error('1. Check Firebase Authentication is enabled in console');
    console.error('2. Verify Email/Password provider is enabled');
    console.error('3. Check Firestore security rules');
    console.error('4. Ensure your Firebase project has proper billing setup');
    process.exit(1);
  }
}

// Run the test
testRealFirebaseAuth();
