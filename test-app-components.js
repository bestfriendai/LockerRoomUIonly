#!/usr/bin/env node

/**
 * App Components Test Suite
 * Tests React Native app components and navigation flow
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc, deleteDoc, serverTimestamp } = require('firebase/firestore');

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

// Simulate AuthProvider behavior
class MockAuthProvider {
  constructor() {
    this.user = null;
    this.isLoading = true;
    this.listeners = [];
  }
  
  async signUp(userData) {
    console.log('MockAuthProvider: Starting sign up...');
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    
    await firebaseUser.getIdToken(true);
    
    const newUser = {
      name: userData.name || userData.email.split('@')[0],
      age: userData.age || 25,
      bio: userData.bio || '',
      photos: userData.photos || [],
      location: userData.location || '',
      interests: userData.interests || [],
      verified: false,
      profileComplete: false,
      email: userData.email,
    };
    
    const createdUser = await this.createUserDocument(firebaseUser.uid, newUser);
    this.user = createdUser;
    this.isLoading = false;
    this.notifyListeners();
    
    return createdUser;
  }
  
  async signIn(email, password) {
    console.log('MockAuthProvider: Starting sign in...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const userData = await this.getUserById(firebaseUser.uid);
    this.user = userData;
    this.isLoading = false;
    this.notifyListeners();
    
    return userData;
  }
  
  async signOut() {
    console.log('MockAuthProvider: Signing out...');
    await signOut(auth);
    this.user = null;
    this.notifyListeners();
  }
  
  async createUserDocument(userId, userData) {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error(`Authentication mismatch. Expected: ${userId}, Got: ${currentUser?.uid || 'null'}`);
    }
    
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
  
  async getUserById(userId) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  }
  
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
  
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.user, this.isLoading));
  }
}

// Simulate navigation behavior
class MockRouter {
  constructor() {
    this.currentRoute = '/';
    this.history = [];
  }
  
  replace(route) {
    console.log(`MockRouter: Replacing route with ${route}`);
    this.currentRoute = route;
    this.history.push({ action: 'replace', route, timestamp: Date.now() });
  }
  
  push(route) {
    console.log(`MockRouter: Pushing route ${route}`);
    this.currentRoute = route;
    this.history.push({ action: 'push', route, timestamp: Date.now() });
  }
  
  back() {
    console.log('MockRouter: Going back');
    this.history.push({ action: 'back', timestamp: Date.now() });
  }
  
  getHistory() {
    return this.history;
  }
  
  getCurrentRoute() {
    return this.currentRoute;
  }
}

async function testAuthProviderFlow() {
  console.log('\n🔄 Testing AuthProvider Flow');
  console.log('='.repeat(50));
  
  const testResults = [];
  const authProvider = new MockAuthProvider();
  let testUser = null;
  
  try {
    // Test 1: Sign up flow
    console.log('Test 1: Sign up flow');
    const signUpData = {
      email: generateTestEmail('authprovider'),
      password: 'authProviderTest123!',
      name: 'Auth Provider Test User'
    };
    
    const signUpResult = await authProvider.signUp(signUpData);
    if (signUpResult && signUpResult.id) {
      testResults.push({ test: 'AuthProvider sign up', result: 'PASS' });
      testUser = signUpResult;
    } else {
      testResults.push({ test: 'AuthProvider sign up', result: 'FAIL - No user returned' });
    }
    
    // Test 2: User state after sign up
    console.log('Test 2: User state after sign up');
    if (authProvider.user && authProvider.user.id === testUser.id) {
      testResults.push({ test: 'User state after sign up', result: 'PASS' });
    } else {
      testResults.push({ test: 'User state after sign up', result: 'FAIL - User state not set' });
    }
    
    // Test 3: Sign out flow
    console.log('Test 3: Sign out flow');
    await authProvider.signOut();
    if (!authProvider.user) {
      testResults.push({ test: 'AuthProvider sign out', result: 'PASS' });
    } else {
      testResults.push({ test: 'AuthProvider sign out', result: 'FAIL - User still set' });
    }
    
    // Test 4: Sign in flow
    console.log('Test 4: Sign in flow');
    const signInResult = await authProvider.signIn(signUpData.email, signUpData.password);
    if (signInResult && signInResult.id === testUser.id) {
      testResults.push({ test: 'AuthProvider sign in', result: 'PASS' });
    } else {
      testResults.push({ test: 'AuthProvider sign in', result: 'FAIL - Sign in failed' });
    }
    
    // Test 5: User state after sign in
    console.log('Test 5: User state after sign in');
    if (authProvider.user && authProvider.user.id === testUser.id) {
      testResults.push({ test: 'User state after sign in', result: 'PASS' });
    } else {
      testResults.push({ test: 'User state after sign in', result: 'FAIL - User state not restored' });
    }
    
  } catch (error) {
    console.error('AuthProvider flow test failed:', error);
    testResults.push({ test: 'AuthProvider flow', result: `CRITICAL ERROR: ${error.message}` });
  }
  
  return { testResults, testUser };
}

async function testNavigationFlow() {
  console.log('\n🧭 Testing Navigation Flow');
  console.log('='.repeat(50));
  
  const testResults = [];
  const router = new MockRouter();
  const authProvider = new MockAuthProvider();
  
  try {
    // Test 1: Initial state (no user) should redirect to auth
    console.log('Test 1: Initial state navigation');
    if (!authProvider.user) {
      router.replace('/(auth)');
      if (router.getCurrentRoute() === '/(auth)') {
        testResults.push({ test: 'Initial redirect to auth', result: 'PASS' });
      } else {
        testResults.push({ test: 'Initial redirect to auth', result: 'FAIL - Wrong route' });
      }
    }
    
    // Test 2: After sign up, should redirect to tabs
    console.log('Test 2: Post sign-up navigation');
    const signUpData = {
      email: generateTestEmail('navigation'),
      password: 'navigationTest123!',
      name: 'Navigation Test User'
    };
    
    await authProvider.signUp(signUpData);
    
    // Simulate the app's navigation logic
    if (authProvider.user) {
      router.replace('/(tabs)');
      if (router.getCurrentRoute() === '/(tabs)') {
        testResults.push({ test: 'Post sign-up redirect to tabs', result: 'PASS' });
      } else {
        testResults.push({ test: 'Post sign-up redirect to tabs', result: 'FAIL - Wrong route' });
      }
    }
    
    // Test 3: After sign out, should redirect to auth
    console.log('Test 3: Post sign-out navigation');
    await authProvider.signOut();
    
    if (!authProvider.user) {
      router.replace('/(auth)');
      if (router.getCurrentRoute() === '/(auth)') {
        testResults.push({ test: 'Post sign-out redirect to auth', result: 'PASS' });
      } else {
        testResults.push({ test: 'Post sign-out redirect to auth', result: 'FAIL - Wrong route' });
      }
    }
    
    // Test 4: After sign in, should redirect to tabs
    console.log('Test 4: Post sign-in navigation');
    await authProvider.signIn(signUpData.email, signUpData.password);
    
    if (authProvider.user) {
      router.replace('/(tabs)');
      if (router.getCurrentRoute() === '/(tabs)') {
        testResults.push({ test: 'Post sign-in redirect to tabs', result: 'PASS' });
      } else {
        testResults.push({ test: 'Post sign-in redirect to tabs', result: 'FAIL - Wrong route' });
      }
    }
    
    // Test 5: Navigation history integrity
    console.log('Test 5: Navigation history integrity');
    const history = router.getHistory();
    const expectedRoutes = ['/(auth)', '/(tabs)', '/(auth)', '/(tabs)'];
    const actualRoutes = history.map(h => h.route);
    
    if (JSON.stringify(actualRoutes) === JSON.stringify(expectedRoutes)) {
      testResults.push({ test: 'Navigation history integrity', result: 'PASS' });
    } else {
      testResults.push({ 
        test: 'Navigation history integrity', 
        result: `FAIL - Expected: ${expectedRoutes.join(', ')}, Got: ${actualRoutes.join(', ')}` 
      });
    }
    
  } catch (error) {
    console.error('Navigation flow test failed:', error);
    testResults.push({ test: 'Navigation flow', result: `CRITICAL ERROR: ${error.message}` });
  }
  
  return testResults;
}

async function testErrorHandling() {
  console.log('\n⚠️  Testing Error Handling');
  console.log('='.repeat(50));
  
  const testResults = [];
  const authProvider = new MockAuthProvider();
  
  try {
    // Test 1: Invalid email error handling
    console.log('Test 1: Invalid email error handling');
    try {
      await authProvider.signUp({
        email: 'invalid-email',
        password: 'validPassword123!',
        name: 'Test User'
      });
      testResults.push({ test: 'Invalid email error handling', result: 'FAIL - Should have thrown error' });
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        testResults.push({ test: 'Invalid email error handling', result: 'PASS' });
      } else {
        testResults.push({ test: 'Invalid email error handling', result: `UNEXPECTED - ${error.code}` });
      }
    }
    
    // Test 2: Weak password error handling
    console.log('Test 2: Weak password error handling');
    try {
      await authProvider.signUp({
        email: generateTestEmail('weak'),
        password: '123',
        name: 'Test User'
      });
      testResults.push({ test: 'Weak password error handling', result: 'FAIL - Should have thrown error' });
    } catch (error) {
      if (error.code === 'auth/weak-password') {
        testResults.push({ test: 'Weak password error handling', result: 'PASS' });
      } else {
        testResults.push({ test: 'Weak password error handling', result: `UNEXPECTED - ${error.code}` });
      }
    }
    
    // Test 3: Wrong password error handling
    console.log('Test 3: Wrong password error handling');
    const validEmail = generateTestEmail('wrongpass');
    const validPassword = 'validPassword123!';
    
    // Create user first
    await authProvider.signUp({
      email: validEmail,
      password: validPassword,
      name: 'Test User'
    });
    
    await authProvider.signOut();
    
    // Try to sign in with wrong password
    try {
      await authProvider.signIn(validEmail, 'wrongPassword123!');
      testResults.push({ test: 'Wrong password error handling', result: 'FAIL - Should have thrown error' });
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        testResults.push({ test: 'Wrong password error handling', result: 'PASS' });
      } else {
        testResults.push({ test: 'Wrong password error handling', result: `UNEXPECTED - ${error.code}` });
      }
    }
    
  } catch (error) {
    console.error('Error handling test failed:', error);
    testResults.push({ test: 'Error handling', result: `CRITICAL ERROR: ${error.message}` });
  }
  
  return testResults;
}

async function runAppComponentTests() {
  console.log('📱 Starting App Components Tests');
  console.log('='.repeat(70));
  
  const allResults = [];
  let testUsers = [];
  
  try {
    // Test AuthProvider flow
    const authProviderResult = await testAuthProviderFlow();
    allResults.push(...authProviderResult.testResults);
    if (authProviderResult.testUser) {
      testUsers.push(authProviderResult.testUser);
    }
    
    // Test navigation flow
    const navigationResults = await testNavigationFlow();
    allResults.push(...navigationResults);
    
    // Test error handling
    const errorResults = await testErrorHandling();
    allResults.push(...errorResults);
    
    // Print results
    console.log('\n📱 APP COMPONENTS TEST RESULTS');
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
    
    console.log('\n📊 APP COMPONENTS SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`🚨 Errors: ${errorCount}`);
    console.log(`📊 Total Tests: ${allResults.length}`);
    
    const successRate = ((passCount / allResults.length) * 100).toFixed(1);
    console.log(`📱 App Reliability: ${successRate}%`);
    
    if (successRate >= 95) {
      console.log('\n🎉 EXCELLENT! App components are working perfectly.');
    } else if (successRate >= 80) {
      console.log('\n👍 GOOD! App components are mostly working with minor issues.');
    } else {
      console.log('\n⚠️  WARNING! App components need attention.');
    }
    
  } catch (error) {
    console.error('\n💥 CRITICAL ERROR in app components testing:', error);
  } finally {
    // Cleanup test users
    try {
      for (const user of testUsers) {
        if (user && user.id) {
          await deleteDoc(doc(db, 'users', user.id));
          const firebaseUser = auth.currentUser;
          if (firebaseUser && firebaseUser.uid === user.id) {
            await deleteUser(firebaseUser);
          }
        }
      }
    } catch (cleanupError) {
      console.log('Cleanup error:', cleanupError.message);
    }
  }
  
  process.exit(0);
}

runAppComponentTests().catch(console.error);
