#!/usr/bin/env node

/**
 * Security Rules Test Suite
 * Tests the new Firestore security rules to ensure proper access control
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp, collection, addDoc } = require('firebase/firestore');

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

const generateTestEmail = (prefix) => `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 5)}@example.com`;

async function testUserAccessControl() {
  console.log('\n👤 Testing User Access Control');
  console.log('='.repeat(50));
  
  const testResults = [];
  let user1 = null;
  let user2 = null;
  
  try {
    // Create two test users
    const email1 = generateTestEmail('user1');
    const email2 = generateTestEmail('user2');
    const password = 'testPassword123!';
    
    const userCred1 = await createUserWithEmailAndPassword(auth, email1, password);
    user1 = userCred1.user;
    
    // Create user1 document
    const user1Data = {
      id: user1.uid,
      name: 'Test User 1',
      email: email1,
      age: 25,
      bio: 'User 1 bio',
      photos: ['photo1.jpg'],
      location: 'City 1',
      interests: ['test1'],
      verified: false,
      profileComplete: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isOnline: true,
      lastSeen: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', user1.uid), user1Data);
    testResults.push({ test: 'User1 document creation', result: 'PASS' });
    
    // Sign out and create user2
    await signOut(auth);
    const userCred2 = await createUserWithEmailAndPassword(auth, email2, password);
    user2 = userCred2.user;
    
    // Create user2 document
    const user2Data = {
      id: user2.uid,
      name: 'Test User 2',
      email: email2,
      age: 30,
      bio: 'User 2 bio',
      photos: ['photo2.jpg'],
      location: 'City 2',
      interests: ['test2'],
      verified: false,
      profileComplete: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isOnline: true,
      lastSeen: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', user2.uid), user2Data);
    testResults.push({ test: 'User2 document creation', result: 'PASS' });
    
    // Test 1: User can read their own data
    console.log('Test 1: User can read their own data');
    try {
      const ownDoc = await getDoc(doc(db, 'users', user2.uid));
      if (ownDoc.exists()) {
        testResults.push({ test: 'Read own user data', result: 'PASS' });
      } else {
        testResults.push({ test: 'Read own user data', result: 'FAIL - Document not found' });
      }
    } catch (error) {
      testResults.push({ test: 'Read own user data', result: `FAIL - ${error.code}` });
    }
    
    // Test 2: User can update their own data
    console.log('Test 2: User can update their own data');
    try {
      await updateDoc(doc(db, 'users', user2.uid), {
        bio: 'Updated bio',
        updatedAt: serverTimestamp()
      });
      testResults.push({ test: 'Update own user data', result: 'PASS' });
    } catch (error) {
      testResults.push({ test: 'Update own user data', result: `FAIL - ${error.code}` });
    }
    
    // Test 3: User can read basic info of other users
    console.log('Test 3: User can read basic info of other users');
    try {
      const otherDoc = await getDoc(doc(db, 'users', user1.uid));
      if (otherDoc.exists()) {
        testResults.push({ test: 'Read other user basic info', result: 'PASS' });
      } else {
        testResults.push({ test: 'Read other user basic info', result: 'FAIL - Document not found' });
      }
    } catch (error) {
      testResults.push({ test: 'Read other user basic info', result: `FAIL - ${error.code}` });
    }
    
    // Test 4: User cannot update other user's data
    console.log('Test 4: User cannot update other user\'s data');
    try {
      await updateDoc(doc(db, 'users', user1.uid), {
        bio: 'Malicious update',
        updatedAt: serverTimestamp()
      });
      testResults.push({ test: 'Prevent updating other user data', result: 'FAIL - Should have been blocked' });
    } catch (error) {
      if (error.code === 'permission-denied') {
        testResults.push({ test: 'Prevent updating other user data', result: 'PASS' });
      } else {
        testResults.push({ test: 'Prevent updating other user data', result: `UNEXPECTED - ${error.code}` });
      }
    }
    
  } catch (error) {
    console.error('User access control test failed:', error);
    testResults.push({ test: 'User access control', result: `CRITICAL ERROR: ${error.message}` });
  }
  
  return { testResults, user1, user2 };
}

async function testReviewsAccessControl() {
  console.log('\n📝 Testing Reviews Access Control');
  console.log('='.repeat(50));
  
  const testResults = [];
  
  try {
    // Test 1: Authenticated user can create review
    console.log('Test 1: Authenticated user can create review');
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const reviewData = {
          authorId: currentUser.uid,
          targetName: 'Test Target',
          rating: 4,
          content: 'Test review content',
          category: 'dating',
          isAnonymous: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const reviewRef = await addDoc(collection(db, 'reviews'), reviewData);
        testResults.push({ test: 'Create review', result: 'PASS' });
        
        // Test 2: User can read reviews
        console.log('Test 2: User can read reviews');
        const createdReview = await getDoc(reviewRef);
        if (createdReview.exists()) {
          testResults.push({ test: 'Read reviews', result: 'PASS' });
        } else {
          testResults.push({ test: 'Read reviews', result: 'FAIL - Review not found' });
        }
        
        // Test 3: User can update their own review
        console.log('Test 3: User can update their own review');
        await updateDoc(reviewRef, {
          content: 'Updated review content',
          updatedAt: serverTimestamp()
        });
        testResults.push({ test: 'Update own review', result: 'PASS' });
        
        // Cleanup
        await deleteDoc(reviewRef);
        
      } catch (error) {
        testResults.push({ test: 'Review operations', result: `FAIL - ${error.code}` });
      }
    } else {
      testResults.push({ test: 'Review operations', result: 'FAIL - No authenticated user' });
    }
    
  } catch (error) {
    console.error('Reviews access control test failed:', error);
    testResults.push({ test: 'Reviews access control', result: `CRITICAL ERROR: ${error.message}` });
  }
  
  return testResults;
}

async function testUnauthenticatedAccess() {
  console.log('\n🚫 Testing Unauthenticated Access');
  console.log('='.repeat(50));
  
  const testResults = [];
  
  try {
    // Sign out to test unauthenticated access
    await signOut(auth);
    
    // Test 1: Unauthenticated user cannot read user data
    console.log('Test 1: Unauthenticated user cannot read user data');
    try {
      const randomUserId = 'test-user-id';
      await getDoc(doc(db, 'users', randomUserId));
      testResults.push({ test: 'Block unauthenticated user read', result: 'FAIL - Should have been blocked' });
    } catch (error) {
      if (error.code === 'permission-denied') {
        testResults.push({ test: 'Block unauthenticated user read', result: 'PASS' });
      } else {
        testResults.push({ test: 'Block unauthenticated user read', result: `UNEXPECTED - ${error.code}` });
      }
    }
    
    // Test 2: Unauthenticated user cannot create user data
    console.log('Test 2: Unauthenticated user cannot create user data');
    try {
      await setDoc(doc(db, 'users', 'malicious-user'), {
        name: 'Malicious User',
        email: 'malicious@example.com'
      });
      testResults.push({ test: 'Block unauthenticated user write', result: 'FAIL - Should have been blocked' });
    } catch (error) {
      if (error.code === 'permission-denied') {
        testResults.push({ test: 'Block unauthenticated user write', result: 'PASS' });
      } else {
        testResults.push({ test: 'Block unauthenticated user write', result: `UNEXPECTED - ${error.code}` });
      }
    }
    
    // Test 3: Unauthenticated user cannot read reviews
    console.log('Test 3: Unauthenticated user cannot read reviews');
    try {
      const reviewsQuery = collection(db, 'reviews');
      await getDoc(doc(reviewsQuery, 'test-review'));
      testResults.push({ test: 'Block unauthenticated review read', result: 'FAIL - Should have been blocked' });
    } catch (error) {
      if (error.code === 'permission-denied') {
        testResults.push({ test: 'Block unauthenticated review read', result: 'PASS' });
      } else {
        testResults.push({ test: 'Block unauthenticated review read', result: `UNEXPECTED - ${error.code}` });
      }
    }
    
  } catch (error) {
    console.error('Unauthenticated access test failed:', error);
    testResults.push({ test: 'Unauthenticated access', result: `CRITICAL ERROR: ${error.message}` });
  }
  
  return testResults;
}

async function runSecurityTests() {
  console.log('🔒 Starting Security Rules Tests');
  console.log('='.repeat(70));
  
  const allResults = [];
  let testUsers = { user1: null, user2: null };
  
  try {
    // Test user access control
    const userAccessResult = await testUserAccessControl();
    allResults.push(...userAccessResult.testResults);
    testUsers = { user1: userAccessResult.user1, user2: userAccessResult.user2 };
    
    // Test reviews access control
    const reviewsResults = await testReviewsAccessControl();
    allResults.push(...reviewsResults);
    
    // Test unauthenticated access
    const unauthResults = await testUnauthenticatedAccess();
    allResults.push(...unauthResults);
    
    // Print results
    console.log('\n🔒 SECURITY TEST RESULTS');
    console.log('='.repeat(70));
    
    let passCount = 0;
    let failCount = 0;
    let errorCount = 0;
    
    allResults.forEach((result) => {
      const status = result.result.includes('PASS') ? '✅' : 
                   result.result.includes('FAIL') ? '❌' : 
                   result.result.includes('ERROR') ? '🚨' : '⚠️';
      
      console.log(`${status} ${result.test}: ${result.result}`);
      
      if (result.result.includes('PASS')) passCount++;
      else if (result.result.includes('FAIL')) failCount++;
      else if (result.result.includes('ERROR')) errorCount++;
    });
    
    console.log('\n📊 SECURITY SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`🚨 Errors: ${errorCount}`);
    console.log(`📊 Total Tests: ${allResults.length}`);
    
    const successRate = ((passCount / allResults.length) * 100).toFixed(1);
    console.log(`🔒 Security Score: ${successRate}%`);
    
    if (successRate >= 95) {
      console.log('\n🛡️  EXCELLENT! Security rules are properly configured.');
    } else if (successRate >= 80) {
      console.log('\n🔒 GOOD! Security rules are mostly secure with minor issues.');
    } else {
      console.log('\n⚠️  WARNING! Security rules need immediate attention.');
    }
    
  } catch (error) {
    console.error('\n💥 CRITICAL ERROR in security testing:', error);
  } finally {
    // Cleanup test users
    try {
      if (testUsers.user1) {
        await deleteDoc(doc(db, 'users', testUsers.user1.uid));
        await deleteUser(testUsers.user1);
      }
      if (testUsers.user2) {
        await deleteDoc(doc(db, 'users', testUsers.user2.uid));
        await deleteUser(testUsers.user2);
      }
    } catch (cleanupError) {
      console.log('Cleanup error:', cleanupError.message);
    }
  }
  
  process.exit(0);
}

runSecurityTests().catch(console.error);
