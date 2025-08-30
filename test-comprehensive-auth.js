#!/usr/bin/env node

/**
 * Comprehensive Authentication Test Suite
 * Tests all edge cases, stress scenarios, and real-world conditions
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser, sendPasswordResetEmail } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs } = require('firebase/firestore');

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

// Test utilities
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const generateTestEmail = (prefix) => `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 5)}@example.com`;

// Simulate app's createUser function
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

async function testEdgeCases() {
  console.log('\n🔍 Testing Edge Cases');
  console.log('='.repeat(60));
  
  const testResults = [];
  
  try {
    // Test 1: Invalid email formats
    console.log('\n📧 Test 1: Invalid Email Formats');
    const invalidEmails = [
      'invalid-email',
      '@gmail.com',
      'test@',
      'test..test@gmail.com',
      'test@gmail',
      ''
    ];
    
    for (const email of invalidEmails) {
      try {
        await createUserWithEmailAndPassword(auth, email, 'password123');
        testResults.push({ test: `Invalid email: ${email}`, result: 'FAIL - Should have been rejected' });
      } catch (error) {
        if (error.code === 'auth/invalid-email') {
          testResults.push({ test: `Invalid email: ${email}`, result: 'PASS' });
        } else {
          testResults.push({ test: `Invalid email: ${email}`, result: `UNEXPECTED ERROR: ${error.code}` });
        }
      }
    }
    
    // Test 2: Weak passwords
    console.log('\n🔒 Test 2: Weak Password Validation');
    const weakPasswords = ['123', 'password', 'abc', '12345', ''];
    
    for (const password of weakPasswords) {
      try {
        const email = generateTestEmail('weak');
        await createUserWithEmailAndPassword(auth, email, password);
        testResults.push({ test: `Weak password: ${password}`, result: 'FAIL - Should have been rejected' });
      } catch (error) {
        if (error.code === 'auth/weak-password' || error.code === 'auth/invalid-password') {
          testResults.push({ test: `Weak password: ${password}`, result: 'PASS' });
        } else {
          testResults.push({ test: `Weak password: ${password}`, result: `UNEXPECTED ERROR: ${error.code}` });
        }
      }
    }
    
    // Test 3: Duplicate email registration
    console.log('\n👥 Test 3: Duplicate Email Registration');
    const duplicateEmail = generateTestEmail('duplicate');
    const duplicatePassword = 'duplicateTest123!';
    
    // Create first user
    const firstUser = await createUserWithEmailAndPassword(auth, duplicateEmail, duplicatePassword);
    testResults.push({ test: 'First user creation', result: 'PASS' });
    
    // Try to create duplicate
    try {
      await createUserWithEmailAndPassword(auth, duplicateEmail, duplicatePassword);
      testResults.push({ test: 'Duplicate email rejection', result: 'FAIL - Should have been rejected' });
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        testResults.push({ test: 'Duplicate email rejection', result: 'PASS' });
      } else {
        testResults.push({ test: 'Duplicate email rejection', result: `UNEXPECTED ERROR: ${error.code}` });
      }
    }
    
    // Cleanup
    await deleteUser(firstUser.user);
    
  } catch (error) {
    console.error('Edge case testing failed:', error);
    testResults.push({ test: 'Edge case testing', result: `CRITICAL ERROR: ${error.message}` });
  }
  
  return testResults;
}

async function testConcurrentOperations() {
  console.log('\n⚡ Testing Concurrent Operations');
  console.log('='.repeat(60));
  
  const testResults = [];
  
  try {
    // Test 1: Concurrent user creation
    console.log('\n👥 Test 1: Concurrent User Creation');
    const concurrentPromises = [];
    const userCount = 5;
    
    for (let i = 0; i < userCount; i++) {
      const email = generateTestEmail(`concurrent${i}`);
      const password = 'concurrentTest123!';
      
      concurrentPromises.push(
        createUserWithEmailAndPassword(auth, email, password)
          .then(async (userCred) => {
            const userData = {
              name: `Concurrent User ${i}`,
              email: email,
              age: 25 + i,
              bio: `Concurrent test user ${i}`,
              photos: [],
              location: `City ${i}`,
              interests: [`interest${i}`],
              verified: false,
              profileComplete: false
            };
            
            await createUserDocument(userCred.user.uid, userData);
            return { success: true, userId: userCred.user.uid, user: userCred.user };
          })
          .catch(error => ({ success: false, error: error.message }))
      );
    }
    
    const results = await Promise.all(concurrentPromises);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    testResults.push({ 
      test: 'Concurrent user creation', 
      result: `${successCount}/${userCount} successful, ${failCount} failed` 
    });
    
    // Cleanup concurrent users
    for (const result of results) {
      if (result.success && result.user) {
        try {
          await deleteDoc(doc(db, 'users', result.userId));
          await deleteUser(result.user);
        } catch (cleanupError) {
          console.log('Cleanup error:', cleanupError.message);
        }
      }
    }
    
    // Test 2: Rapid sign in/out cycles
    console.log('\n🔄 Test 2: Rapid Sign In/Out Cycles');
    const rapidEmail = generateTestEmail('rapid');
    const rapidPassword = 'rapidTest123!';
    
    const rapidUser = await createUserWithEmailAndPassword(auth, rapidEmail, rapidPassword);
    await createUserDocument(rapidUser.user.uid, {
      name: 'Rapid Test User',
      email: rapidEmail,
      age: 30,
      bio: 'Rapid test',
      photos: [],
      location: 'Rapid City',
      interests: ['rapid'],
      verified: false,
      profileComplete: true
    });
    
    let rapidCycles = 0;
    for (let i = 0; i < 10; i++) {
      try {
        await signOut(auth);
        await delay(50); // Small delay
        await signInWithEmailAndPassword(auth, rapidEmail, rapidPassword);
        await delay(50); // Small delay
        rapidCycles++;
      } catch (error) {
        console.log(`Rapid cycle ${i} failed:`, error.message);
        break;
      }
    }
    
    testResults.push({ 
      test: 'Rapid sign in/out cycles', 
      result: `${rapidCycles}/10 cycles completed` 
    });
    
    // Cleanup rapid test user
    await deleteDoc(doc(db, 'users', rapidUser.user.uid));
    await deleteUser(rapidUser.user);
    
  } catch (error) {
    console.error('Concurrent operations testing failed:', error);
    testResults.push({ test: 'Concurrent operations', result: `CRITICAL ERROR: ${error.message}` });
  }
  
  return testResults;
}

async function testDataIntegrity() {
  console.log('\n🔒 Testing Data Integrity');
  console.log('='.repeat(60));
  
  const testResults = [];
  
  try {
    // Test 1: User data consistency
    console.log('\n📊 Test 1: User Data Consistency');
    const integrityEmail = generateTestEmail('integrity');
    const integrityPassword = 'integrityTest123!';
    
    const integrityUser = await createUserWithEmailAndPassword(auth, integrityEmail, integrityPassword);
    
    const originalData = {
      name: 'Integrity Test User',
      email: integrityEmail,
      age: 28,
      bio: 'Original bio',
      photos: ['photo1.jpg', 'photo2.jpg'],
      location: 'Integrity City',
      interests: ['integrity', 'testing'],
      verified: false,
      profileComplete: false
    };
    
    const createdUser = await createUserDocument(integrityUser.user.uid, originalData);
    
    // Verify data was saved correctly
    const userRef = doc(db, 'users', integrityUser.user.uid);
    const savedUser = await getDoc(userRef);
    
    if (savedUser.exists()) {
      const savedData = savedUser.data();
      const fieldsMatch = 
        savedData.name === originalData.name &&
        savedData.email === originalData.email &&
        savedData.age === originalData.age &&
        savedData.bio === originalData.bio &&
        JSON.stringify(savedData.photos) === JSON.stringify(originalData.photos) &&
        savedData.location === originalData.location &&
        JSON.stringify(savedData.interests) === JSON.stringify(originalData.interests);
      
      testResults.push({ 
        test: 'User data consistency', 
        result: fieldsMatch ? 'PASS' : 'FAIL - Data mismatch' 
      });
    } else {
      testResults.push({ test: 'User data consistency', result: 'FAIL - User document not found' });
    }
    
    // Test 2: Data update integrity
    console.log('\n🔄 Test 2: Data Update Integrity');
    const updateData = {
      bio: 'Updated bio',
      location: 'Updated City',
      interests: ['updated', 'interests'],
      profileComplete: true,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(userRef, updateData);
    
    const updatedUser = await getDoc(userRef);
    if (updatedUser.exists()) {
      const updatedData = updatedUser.data();
      const updatesMatch = 
        updatedData.bio === updateData.bio &&
        updatedData.location === updateData.location &&
        JSON.stringify(updatedData.interests) === JSON.stringify(updateData.interests) &&
        updatedData.profileComplete === updateData.profileComplete;
      
      testResults.push({ 
        test: 'Data update integrity', 
        result: updatesMatch ? 'PASS' : 'FAIL - Update mismatch' 
      });
    } else {
      testResults.push({ test: 'Data update integrity', result: 'FAIL - Updated user not found' });
    }
    
    // Cleanup integrity test user
    await deleteDoc(userRef);
    await deleteUser(integrityUser.user);
    
  } catch (error) {
    console.error('Data integrity testing failed:', error);
    testResults.push({ test: 'Data integrity', result: `CRITICAL ERROR: ${error.message}` });
  }
  
  return testResults;
}

async function runComprehensiveTests() {
  console.log('🔥 Starting Comprehensive Authentication Tests');
  console.log('='.repeat(80));
  
  const allResults = [];
  
  try {
    const edgeCaseResults = await testEdgeCases();
    const concurrentResults = await testConcurrentOperations();
    const integrityResults = await testDataIntegrity();
    
    allResults.push(...edgeCaseResults, ...concurrentResults, ...integrityResults);
    
    // Print comprehensive results
    console.log('\n📊 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(80));
    
    let passCount = 0;
    let failCount = 0;
    let errorCount = 0;
    
    allResults.forEach((result, index) => {
      const status = result.result.includes('PASS') ? '✅' : 
                   result.result.includes('FAIL') ? '❌' : 
                   result.result.includes('ERROR') ? '🚨' : '⚠️';
      
      console.log(`${status} ${result.test}: ${result.result}`);
      
      if (result.result.includes('PASS')) passCount++;
      else if (result.result.includes('FAIL')) failCount++;
      else if (result.result.includes('ERROR')) errorCount++;
    });
    
    console.log('\n📈 SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`🚨 Errors: ${errorCount}`);
    console.log(`📊 Total Tests: ${allResults.length}`);
    
    const successRate = ((passCount / allResults.length) * 100).toFixed(1);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    if (successRate >= 90) {
      console.log('\n🎉 EXCELLENT! Authentication system is highly reliable.');
    } else if (successRate >= 75) {
      console.log('\n👍 GOOD! Authentication system is mostly reliable with minor issues.');
    } else {
      console.log('\n⚠️  WARNING! Authentication system needs attention.');
    }
    
  } catch (error) {
    console.error('\n💥 CRITICAL ERROR in comprehensive testing:', error);
  }
  
  process.exit(0);
}

runComprehensiveTests().catch(console.error);
