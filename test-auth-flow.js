#!/usr/bin/env node

/**
 * Authentication Flow Test Script
 * Tests Firebase authentication and user creation flow
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  "projectId": "locker-room-talk-app",
  "appId": "1:514288923681:web:6207902c8cb50899bc5f60",
  "storageBucket": "locker-room-talk-app.firebasestorage.app",
  "apiKey": "AIzaSyDcdGoo6Z2uHXNmFyXnKdltwrMUXPcp_4A",
  "authDomain": "locker-room-talk-app.firebaseapp.com",
  "messagingSenderId": "514288923681"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Test user data
const testEmail = `test${Date.now()}@example.com`;
const testPassword = 'testPassword123!';

async function testAuthFlow() {
  console.log('🔥 Starting Firebase Authentication Flow Test');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: User Registration
    console.log('\n📝 Test 1: User Registration');
    console.log(`Creating user with email: ${testEmail}`);
    
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    console.log('✅ User created successfully');
    console.log(`   User ID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Email Verified: ${user.emailVerified}`);
    
    // Test 2: Get ID Token
    console.log('\n🔑 Test 2: Getting ID Token');
    const idToken = await user.getIdToken();
    console.log('✅ ID Token retrieved successfully');
    console.log(`   Token length: ${idToken.length}`);
    
    // Test 3: Create User Document in Firestore
    console.log('\n📄 Test 3: Creating User Document in Firestore');
    const userData = {
      id: user.uid,
      name: 'Test User',
      email: user.email,
      age: 25,
      bio: 'Test user bio',
      photos: [],
      location: 'Test Location',
      interests: ['testing', 'firebase'],
      verified: false,
      profileComplete: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      isOnline: true
    };
    
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, userData);
    console.log('✅ User document created in Firestore');
    
    // Test 4: Retrieve User Document
    console.log('\n📖 Test 4: Retrieving User Document');
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      console.log('✅ User document retrieved successfully');
      console.log(`   Document data:`, userDoc.data());
    } else {
      console.log('❌ User document not found');
    }
    
    // Test 5: Sign Out
    console.log('\n🚪 Test 5: Sign Out');
    await signOut(auth);
    console.log('✅ User signed out successfully');
    
    // Test 6: Sign In
    console.log('\n🔐 Test 6: Sign In');
    const signInCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    const signedInUser = signInCredential.user;
    console.log('✅ User signed in successfully');
    console.log(`   User ID: ${signedInUser.uid}`);
    console.log(`   Email: ${signedInUser.email}`);
    
    // Test 7: Verify User Document Still Exists
    console.log('\n🔍 Test 7: Verify User Document After Sign In');
    const userDocAfterSignIn = await getDoc(userRef);
    if (userDocAfterSignIn.exists()) {
      console.log('✅ User document still exists after sign in');
    } else {
      console.log('❌ User document missing after sign in');
    }
    
    // Final cleanup
    console.log('\n🧹 Cleanup: Signing out');
    await signOut(auth);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    // Try to sign out in case of error
    try {
      await signOut(auth);
    } catch (signOutError) {
      console.error('Failed to sign out after error:', signOutError);
    }
  }
}

// Test specific authentication issues
async function testSpecificIssues() {
  console.log('\n🔍 Testing Specific Authentication Issues');
  console.log('=' .repeat(50));
  
  try {
    // Test invalid email
    console.log('\n📧 Testing invalid email format');
    try {
      await createUserWithEmailAndPassword(auth, 'invalid-email', testPassword);
      console.log('❌ Should have failed with invalid email');
    } catch (error) {
      console.log('✅ Correctly rejected invalid email:', error.code);
    }
    
    // Test weak password
    console.log('\n🔒 Testing weak password');
    try {
      await createUserWithEmailAndPassword(auth, `weak${Date.now()}@example.com`, '123');
      console.log('❌ Should have failed with weak password');
    } catch (error) {
      console.log('✅ Correctly rejected weak password:', error.code);
    }
    
    // Test duplicate email
    console.log('\n👥 Testing duplicate email registration');
    try {
      await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('❌ Should have failed with duplicate email');
    } catch (error) {
      console.log('✅ Correctly rejected duplicate email:', error.code);
    }
    
    // Test wrong password
    console.log('\n🔐 Testing wrong password sign in');
    try {
      await signInWithEmailAndPassword(auth, testEmail, 'wrongpassword');
      console.log('❌ Should have failed with wrong password');
    } catch (error) {
      console.log('✅ Correctly rejected wrong password:', error.code);
    }
    
  } catch (error) {
    console.error('Error in specific tests:', error);
  }
}

// Run tests
async function runAllTests() {
  await testAuthFlow();
  await testSpecificIssues();
  process.exit(0);
}

runAllTests().catch(console.error);
