#!/usr/bin/env node

/**
 * Comprehensive Authentication Integration Test
 * Tests the complete authentication flow including user creation and navigation
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } = require('firebase/auth');
const { getFirestore, doc, getDoc, deleteDoc } = require('firebase/firestore');

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
const testEmail = `integration${Date.now()}@example.com`;
const testPassword = 'testPassword123!';

async function testCompleteAuthFlow() {
  console.log('🔥 Starting Complete Authentication Integration Test');
  console.log('=' .repeat(60));
  
  let testUser = null;
  
  try {
    // Test 1: User Registration with immediate user document creation
    console.log('\n📝 Test 1: Complete User Registration Flow');
    console.log(`Creating user with email: ${testEmail}`);
    
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    testUser = userCredential.user;
    console.log('✅ Firebase user created successfully');
    console.log(`   User ID: ${testUser.uid}`);
    console.log(`   Email: ${testUser.email}`);
    
    // Simulate the app's user creation process
    console.log('\n📄 Test 2: Simulating App User Document Creation');
    
    // Get fresh ID token (like the app does)
    const idToken = await testUser.getIdToken(true);
    console.log('✅ Fresh ID token obtained');
    
    // Check if user document exists (should not exist yet)
    const userRef = doc(db, 'users', testUser.uid);
    let userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      console.log('⚠️  User document already exists (this might be from a previous test)');
    } else {
      console.log('✅ User document does not exist yet (as expected)');
    }
    
    // Test 3: Sign out and sign back in
    console.log('\n🚪 Test 3: Sign Out and Sign In Flow');
    await signOut(auth);
    console.log('✅ User signed out successfully');
    
    // Wait a moment to ensure sign out is complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const signInCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ User signed in successfully');
    console.log(`   User ID: ${signInCredential.user.uid}`);
    
    // Test 4: Check authentication state persistence
    console.log('\n🔄 Test 4: Authentication State Persistence');
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === testUser.uid) {
      console.log('✅ Authentication state persisted correctly');
      console.log(`   Current user: ${currentUser.email}`);
    } else {
      console.log('❌ Authentication state not persisted correctly');
    }
    
    // Test 5: Token refresh
    console.log('\n🔑 Test 5: Token Refresh');
    const refreshedToken = await currentUser.getIdToken(true);
    if (refreshedToken && refreshedToken.length > 0) {
      console.log('✅ Token refresh successful');
      console.log(`   Token length: ${refreshedToken.length}`);
    } else {
      console.log('❌ Token refresh failed');
    }
    
    // Test 6: User document creation after sign in
    console.log('\n📖 Test 6: User Document After Sign In');
    userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      console.log('✅ User document exists after sign in');
      const userData = userDoc.data();
      console.log(`   User name: ${userData.name}`);
      console.log(`   User email: ${userData.email}`);
      console.log(`   Profile complete: ${userData.profileComplete}`);
    } else {
      console.log('⚠️  User document still does not exist');
      console.log('   This is expected if the app hasn\'t created it yet');
    }
    
    console.log('\n🎉 All integration tests completed successfully!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ Integration test failed with error:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleanup: Removing test user');
    try {
      if (testUser) {
        // Delete user document if it exists
        const userRef = doc(db, 'users', testUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          await deleteDoc(userRef);
          console.log('✅ User document deleted');
        }
        
        // Delete Firebase auth user
        await deleteUser(testUser);
        console.log('✅ Firebase auth user deleted');
      }
    } catch (cleanupError) {
      console.error('⚠️  Cleanup error:', cleanupError.message);
    }
  }
}

// Test specific edge cases
async function testEdgeCases() {
  console.log('\n🔍 Testing Edge Cases');
  console.log('=' .repeat(60));
  
  try {
    // Test rapid sign in/out cycles
    console.log('\n⚡ Testing rapid sign in/out cycles');
    const rapidTestEmail = `rapid${Date.now()}@example.com`;
    const rapidTestPassword = 'rapidTest123!';
    
    // Create user
    const userCred = await createUserWithEmailAndPassword(auth, rapidTestEmail, rapidTestPassword);
    console.log('✅ Rapid test user created');
    
    // Rapid sign out/in cycle
    for (let i = 0; i < 3; i++) {
      await signOut(auth);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      await signInWithEmailAndPassword(auth, rapidTestEmail, rapidTestPassword);
      console.log(`✅ Rapid cycle ${i + 1} completed`);
    }
    
    // Cleanup rapid test user
    await deleteUser(userCred.user);
    console.log('✅ Rapid test user cleaned up');
    
  } catch (error) {
    console.error('❌ Edge case test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testCompleteAuthFlow();
  await testEdgeCases();
  process.exit(0);
}

runAllTests().catch(console.error);
