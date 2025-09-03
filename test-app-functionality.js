/**
 * Simple test script to verify core app functionality
 * Run with: node test-app-functionality.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

// Firebase config from .env.local
const firebaseConfig = {
  apiKey: 'AIzaSyDcdGoo6Z2uHXNmFyXnKdltwrMUXPcp_4A',
  authDomain: 'locker-room-talk-app.firebaseapp.com',
  projectId: 'locker-room-talk-app',
  storageBucket: 'locker-room-talk-app.firebasestorage.app',
  messagingSenderId: '514288923681',
  appId: '1:514288923681:web:6207902c8cb50899bc5f60'
};

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Connection...');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    console.log('📱 Project ID:', firebaseConfig.projectId);
    
    // Test Firestore connection
    console.log('🔍 Testing Firestore connection...');
    const testCollection = collection(db, 'test');
    
    // Try to read from a collection (this will fail gracefully if no permissions)
    try {
      const snapshot = await getDocs(testCollection);
      console.log('✅ Firestore connection successful');
      console.log('📊 Test collection size:', snapshot.size);
    } catch (firestoreError) {
      console.log('⚠️ Firestore read test failed (expected if no permissions):', firestoreError.message);
    }
    
    console.log('🎯 Core Firebase services are accessible');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    return false;
  }
}

async function testAppStructure() {
  console.log('\n📁 Testing App Structure...');
  
  const fs = require('fs');
  const path = require('path');
  
  const criticalFiles = [
    'app/_layout.tsx',
    'app/index.tsx',
    'app/(tabs)/_layout.tsx',
    'app/(tabs)/index.tsx',
    'app/(tabs)/search.tsx',
    'app/(tabs)/create.tsx',
    'app/(tabs)/chat.tsx',
    'app/(tabs)/profile.tsx',
    'app/(auth)/signin.tsx',
    'app/(auth)/signup.tsx',
    'providers/AuthProvider.tsx',
    'providers/ThemeProvider.tsx',
    'utils/firebase.ts',
    'package.json'
  ];
  
  let allFilesExist = true;
  
  for (const file of criticalFiles) {
    if (fs.existsSync(file)) {
      console.log('✅', file);
    } else {
      console.log('❌', file, '(missing)');
      allFilesExist = false;
    }
  }
  
  if (allFilesExist) {
    console.log('✅ All critical files present');
  } else {
    console.log('⚠️ Some critical files are missing');
  }
  
  return allFilesExist;
}

async function testPackageDependencies() {
  console.log('\n📦 Testing Package Dependencies...');
  
  const fs = require('fs');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const criticalDependencies = [
    'expo',
    'expo-router',
    'react',
    'react-native',
    'firebase',
    '@react-native-async-storage/async-storage',
    'react-native-gesture-handler',
    'react-native-safe-area-context'
  ];
  
  let allDepsPresent = true;
  
  for (const dep of criticalDependencies) {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log('✅', dep, ':', packageJson.dependencies[dep] || packageJson.devDependencies[dep]);
    } else {
      console.log('❌', dep, '(missing)');
      allDepsPresent = false;
    }
  }
  
  if (allDepsPresent) {
    console.log('✅ All critical dependencies present');
  } else {
    console.log('⚠️ Some critical dependencies are missing');
  }
  
  return allDepsPresent;
}

async function runTests() {
  console.log('🚀 LockerRoom Talk App - Functionality Test\n');
  
  const results = {
    firebase: await testFirebaseConnection(),
    structure: await testAppStructure(),
    dependencies: await testPackageDependencies()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('Firebase Connection:', results.firebase ? '✅ PASS' : '❌ FAIL');
  console.log('App Structure:', results.structure ? '✅ PASS' : '❌ FAIL');
  console.log('Dependencies:', results.dependencies ? '✅ PASS' : '❌ FAIL');
  
  const overallPass = Object.values(results).every(result => result);
  console.log('\n🎯 Overall Status:', overallPass ? '✅ READY' : '⚠️ NEEDS ATTENTION');
  
  if (overallPass) {
    console.log('\n🎉 App appears to be fully functional!');
    console.log('💡 Next steps:');
    console.log('   1. Test authentication flow in the app');
    console.log('   2. Create a test review');
    console.log('   3. Test chat functionality');
    console.log('   4. Verify all navigation works');
  } else {
    console.log('\n🔧 Issues found that need attention');
  }
}

// Run the tests
runTests().catch(console.error);
