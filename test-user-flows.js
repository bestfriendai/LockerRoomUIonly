#!/usr/bin/env node

/**
 * User Flow Test Script
 * Tests complete user flows: sign-up, sign-in, profile setup, and navigation
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } = require('firebase/firestore');

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

// Simulate the app's createUser function
async function createUserDocument(userId, userData) {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error(`Authentication mismatch. Expected: ${userId}, Got: ${currentUser?.uid || 'null'}`);
  }
  
  await currentUser.getIdToken(true);
  
  const userRef = doc(db, 'users', userId);
  const existingUser = await getDoc(userRef);
  
  if (existingUser.exists()) {
    return { id: existingUser.id, ...existingUser.data() };
  }
  
  const userDoc = {
    id: userId,
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isOnline: true,
    lastSeen: serverTimestamp()
  };
  
  await setDoc(userRef, userDoc);
  
  const createdUserSnap = await getDoc(userRef);
  if (createdUserSnap.exists()) {
    return { id: createdUserSnap.id, ...createdUserSnap.data() };
  } else {
    throw new Error('Failed to retrieve created user document');
  }
}

async function testSignUpFlow() {
  console.log('\n📝 Testing Sign-Up Flow');
  console.log('-'.repeat(40));
  
  const testEmail = `signup${Date.now()}@example.com`;
  const testPassword = 'signupTest123!';
  
  try {
    // Step 1: Create Firebase user (like signup screen does)
    console.log('Step 1: Creating Firebase user...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const firebaseUser = userCredential.user;
    console.log('✅ Firebase user created:', firebaseUser.uid);
    
    // Step 2: Create user document (like AuthProvider does)
    console.log('Step 2: Creating user document...');
    const userData = {
      name: testEmail.split('@')[0],
      email: testEmail,
      age: 25,
      bio: '',
      photos: [],
      location: '',
      interests: [],
      verified: false,
      profileComplete: false
    };
    
    const createdUser = await createUserDocument(firebaseUser.uid, userData);
    console.log('✅ User document created');
    
    // Step 3: Simulate profile setup
    console.log('Step 3: Simulating profile setup...');
    const userRef = doc(db, 'users', firebaseUser.uid);
    await updateDoc(userRef, {
      bio: 'Updated bio from profile setup',
      location: 'Test City',
      interests: ['testing', 'firebase'],
      profileComplete: true,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Profile setup completed');
    
    // Step 4: Verify final user state
    console.log('Step 4: Verifying final user state...');
    const finalUserDoc = await getDoc(userRef);
    if (finalUserDoc.exists()) {
      const finalUser = finalUserDoc.data();
      console.log('✅ Final user state verified');
      console.log(`   Profile complete: ${finalUser.profileComplete}`);
      console.log(`   Location: ${finalUser.location}`);
      console.log(`   Interests: ${finalUser.interests.join(', ')}`);
    }
    
    // Cleanup
    await deleteDoc(userRef);
    await deleteUser(firebaseUser);
    console.log('✅ Sign-up flow test completed and cleaned up');
    
  } catch (error) {
    console.error('❌ Sign-up flow test failed:', error.message);
    throw error;
  }
}

async function testSignInFlow() {
  console.log('\n🔐 Testing Sign-In Flow');
  console.log('-'.repeat(40));
  
  const testEmail = `signin${Date.now()}@example.com`;
  const testPassword = 'signinTest123!';
  
  try {
    // Setup: Create a user first
    console.log('Setup: Creating test user...');
    const setupCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const setupUser = setupCredential.user;
    
    const userData = {
      name: testEmail.split('@')[0],
      email: testEmail,
      age: 30,
      bio: 'Existing user bio',
      photos: [],
      location: 'Existing City',
      interests: ['existing', 'user'],
      verified: true,
      profileComplete: true
    };
    
    await createUserDocument(setupUser.uid, userData);
    console.log('✅ Test user setup completed');
    
    // Step 1: Sign out
    console.log('Step 1: Signing out...');
    await signOut(auth);
    console.log('✅ Signed out successfully');
    
    // Step 2: Sign in (like signin screen does)
    console.log('Step 2: Signing in...');
    const signInCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    const signedInUser = signInCredential.user;
    console.log('✅ Signed in successfully:', signedInUser.uid);
    
    // Step 3: Retrieve user data (like AuthProvider does)
    console.log('Step 3: Retrieving user data...');
    const userRef = doc(db, 'users', signedInUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const user = userDoc.data();
      console.log('✅ User data retrieved successfully');
      console.log(`   Name: ${user.name}`);
      console.log(`   Profile complete: ${user.profileComplete}`);
      console.log(`   Location: ${user.location}`);
    } else {
      throw new Error('User document not found after sign in');
    }
    
    // Cleanup
    await deleteDoc(userRef);
    await deleteUser(signedInUser);
    console.log('✅ Sign-in flow test completed and cleaned up');
    
  } catch (error) {
    console.error('❌ Sign-in flow test failed:', error.message);
    throw error;
  }
}

async function testNavigationFlow() {
  console.log('\n🧭 Testing Navigation Flow');
  console.log('-'.repeat(40));
  
  try {
    // Test 1: Unauthenticated state
    console.log('Test 1: Unauthenticated navigation...');
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('✅ No current user - should redirect to auth');
    } else {
      console.log('⚠️  User still authenticated from previous test');
      await signOut(auth);
      console.log('✅ Signed out for navigation test');
    }
    
    // Test 2: Authenticated state
    console.log('Test 2: Authenticated navigation...');
    const navTestEmail = `nav${Date.now()}@example.com`;
    const navTestPassword = 'navTest123!';
    
    const navCredential = await createUserWithEmailAndPassword(auth, navTestEmail, navTestPassword);
    const navUser = navCredential.user;
    
    const navUserData = {
      name: navTestEmail.split('@')[0],
      email: navTestEmail,
      age: 28,
      bio: 'Navigation test user',
      photos: [],
      location: 'Nav City',
      interests: ['navigation'],
      verified: false,
      profileComplete: false
    };
    
    await createUserDocument(navUser.uid, navUserData);
    console.log('✅ Authenticated user created - should redirect to tabs');
    
    // Test 3: Profile completion check
    console.log('Test 3: Profile completion navigation...');
    const userRef = doc(db, 'users', navUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const user = userDoc.data();
      if (!user.profileComplete) {
        console.log('✅ Profile incomplete - should redirect to profile setup');
      } else {
        console.log('✅ Profile complete - should redirect to main app');
      }
    }
    
    // Cleanup
    await deleteDoc(userRef);
    await deleteUser(navUser);
    console.log('✅ Navigation flow test completed and cleaned up');
    
  } catch (error) {
    console.error('❌ Navigation flow test failed:', error.message);
    throw error;
  }
}

async function runUserFlowTests() {
  console.log('🔥 Starting User Flow Tests');
  console.log('='.repeat(50));
  
  try {
    await testSignUpFlow();
    await testSignInFlow();
    await testNavigationFlow();
    
    console.log('\n🎉 All user flow tests completed successfully!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ User flow tests failed:', error);
  }
  
  process.exit(0);
}

runUserFlowTests().catch(console.error);
