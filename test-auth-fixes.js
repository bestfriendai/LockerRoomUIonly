#!/usr/bin/env node

/**
 * Test script to verify the authentication and Firestore permission fixes
 * Run with: node test-auth-fixes.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc, updateDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyD8JJcABLnaDRL87R-hS_xgIUWJG4heQZI",
  authDomain: "lockerroom-24cce.firebaseapp.com",
  projectId: "lockerroom-24cce",
  storageBucket: "lockerroom-24cce.firebasestorage.app",
  messagingSenderId: "558579625519",
  appId: "1:558579625519:web:e936e08e757c9bb25c0ae5",
  measurementId: "G-PWCR2XVMLF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Test user credentials
const testEmail = `test${Date.now()}@example.com`;
const testPassword = 'TestPassword123!';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, type = 'info') {
  const color = type === 'success' ? colors.green : 
                type === 'error' ? colors.red : 
                type === 'warning' ? colors.yellow : 
                colors.blue;
  console.log(`${color}${message}${colors.reset}`);
}

async function testSignupAndPermissions() {
  log('\n=== Testing Authentication and Firestore Permissions ===\n', 'info');

  try {
    // Test 1: Create a new user account
    log('Test 1: Creating new user account...', 'info');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    log(`✓ User created successfully: ${user.uid}`, 'success');

    // Test 2: Create user document in Firestore
    log('\nTest 2: Creating user document in Firestore...', 'info');
    const userDoc = {
      email: testEmail,
      name: 'Test User',
      isAnonymous: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      profileComplete: false,
      verified: false
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);
    log('✓ User document created successfully', 'success');

    // Test 3: Read user document
    log('\nTest 3: Reading user document...', 'info');
    const docSnap = await getDoc(doc(db, 'users', user.uid));
    if (docSnap.exists()) {
      log('✓ User document read successfully', 'success');
      log(`  Data: ${JSON.stringify(docSnap.data(), null, 2)}`, 'info');
    } else {
      throw new Error('User document not found');
    }

    // Test 4: Update user document
    log('\nTest 4: Updating user document...', 'info');
    await updateDoc(doc(db, 'users', user.uid), {
      bio: 'Updated bio',
      location: 'Test City',
      updatedAt: new Date()
    });
    log('✓ User document updated successfully', 'success');

    // Test 5: Verify update
    log('\nTest 5: Verifying update...', 'info');
    const updatedDoc = await getDoc(doc(db, 'users', user.uid));
    const updatedData = updatedDoc.data();
    if (updatedData.bio === 'Updated bio' && updatedData.location === 'Test City') {
      log('✓ Update verified successfully', 'success');
    } else {
      throw new Error('Update verification failed');
    }

    // Test 6: Sign out and sign back in
    log('\nTest 6: Testing sign out and sign in...', 'info');
    await signOut(auth);
    log('  Signed out', 'info');
    
    const reAuthCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    log(`✓ Signed in successfully: ${reAuthCredential.user.uid}`, 'success');

    // Test 7: Concurrent updates (testing permission for multiple writes)
    log('\nTest 7: Testing concurrent updates...', 'info');
    const updates = [
      updateDoc(doc(db, 'users', reAuthCredential.user.uid), { age: 25 }),
      updateDoc(doc(db, 'users', reAuthCredential.user.uid), { interests: ['coding', 'testing'] }),
      updateDoc(doc(db, 'users', reAuthCredential.user.uid), { reputationScore: 100 })
    ];
    
    await Promise.all(updates);
    log('✓ Concurrent updates completed successfully', 'success');

    // Clean up
    log('\nCleaning up...', 'info');
    await signOut(auth);
    
    log('\n=== All Tests Passed! ===\n', 'success');
    log('Summary:', 'info');
    log('✓ User signup works correctly', 'success');
    log('✓ Firestore document creation works', 'success');
    log('✓ User can read their own data', 'success');
    log('✓ User can update their profile', 'success');
    log('✓ Concurrent writes are handled', 'success');
    log('✓ Authentication flow works end-to-end', 'success');
    
    process.exit(0);
  } catch (error) {
    log(`\n✗ Test failed: ${error.message}`, 'error');
    if (error.code) {
      log(`  Error code: ${error.code}`, 'error');
    }
    if (error.stack) {
      log(`  Stack trace: ${error.stack}`, 'error');
    }
    process.exit(1);
  }
}

// Run the tests
testSignupAndPermissions();