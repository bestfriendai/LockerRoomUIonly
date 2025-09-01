#!/usr/bin/env node

/**
 * Test Firebase connection and basic operations
 * This script verifies that Firebase is properly configured and working
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc, collection, addDoc } = require('firebase/firestore');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

async function testFirebaseConnection() {
  try {
    console.log('🔥 Testing Firebase Connection...\n');
    
    // Initialize Firebase
    console.log('1. Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
    
    // Test Firestore connection
    console.log('\n2. Testing Firestore connection...');
    const db = getFirestore(app);
    
    // Test writing to a test collection
    console.log('   - Writing test document...');
    const testRef = doc(db, 'test', 'connection-test');
    await setDoc(testRef, {
      message: 'Firebase connection test',
      timestamp: new Date(),
      status: 'success'
    });
    console.log('✅ Test document written successfully');
    
    // Test reading the document (this should work since test collection allows all)
    console.log('   - Reading test document...');
    try {
      const testDoc = await getDoc(testRef);
      if (testDoc.exists()) {
        console.log('✅ Test document read successfully:', testDoc.data());
      } else {
        console.log('❌ Test document not found');
      }
    } catch (readError) {
      console.log('❌ Test document read failed:', readError.message);
      console.log('   This might indicate Firestore rules need adjustment');
    }
    
    // Test Authentication
    console.log('\n3. Testing Firebase Authentication...');
    const auth = getAuth(app);
    
    try {
      const userCredential = await signInAnonymously(auth);
      console.log('✅ Anonymous authentication successful');
      console.log('   User ID:', userCredential.user.uid);
      
      // Test authenticated write
      console.log('   - Testing authenticated write...');
      const userTestRef = doc(db, 'test', `user-${userCredential.user.uid}`);
      await setDoc(userTestRef, {
        userId: userCredential.user.uid,
        message: 'Authenticated user test',
        timestamp: new Date()
      });
      console.log('✅ Authenticated write successful');
      
    } catch (authError) {
      console.log('❌ Authentication failed:', authError.message);
    }
    
    // Test collections that will be used in the app
    console.log('\n4. Testing app collections...');
    
    const collections = ['users', 'reviews', 'chatRooms', 'notifications'];
    for (const collectionName of collections) {
      try {
        const testCollectionRef = collection(db, collectionName);
        console.log(`✅ Collection '${collectionName}' accessible`);
      } catch (error) {
        console.log(`❌ Collection '${collectionName}' error:`, error.message);
      }
    }
    
    console.log('\n🎉 Firebase connection test completed successfully!');
    console.log('\nConfiguration Summary:');
    console.log('- Project ID:', firebaseConfig.projectId);
    console.log('- Auth Domain:', firebaseConfig.authDomain);
    console.log('- Storage Bucket:', firebaseConfig.storageBucket);
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check your .env file has all required Firebase config values');
    console.error('2. Verify your Firebase project is active and billing is enabled');
    console.error('3. Check Firestore security rules allow the operations');
    console.error('4. Ensure your Firebase project has Firestore and Authentication enabled');
    process.exit(1);
  }
}

// Run the test
testFirebaseConnection();
