// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import Firebase SDK
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } = require('firebase/auth');

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔥 Testing Firebase Authentication...\n');
console.log('📋 Configuration:');
console.log('   Project ID:', firebaseConfig.projectId);
console.log('   Auth Domain:', firebaseConfig.authDomain);
console.log('   App ID:', firebaseConfig.appId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testAuth() {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  console.log('\n🧪 Test 1: Creating new user');
  console.log('   Email:', testEmail);
  
  try {
    // Try to create a new user
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ User created successfully!');
    console.log('   UID:', userCredential.user.uid);
    
    // Sign out
    await auth.signOut();
    console.log('\n🧪 Test 2: Signing in with created user');
    
    // Try to sign in with the created user
    const signInCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Sign in successful!');
    console.log('   UID:', signInCredential.user.uid);
    
    // Clean up - delete the test user
    console.log('\n🧹 Cleaning up test user...');
    await deleteUser(signInCredential.user);
    console.log('✅ Test user deleted');
    
    console.log('\n✨ All tests passed! Firebase Authentication is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'auth/network-request-failed') {
      console.log('\n⚠️  Network error. Check your internet connection.');
    } else if (error.code === 'auth/invalid-api-key') {
      console.log('\n⚠️  Invalid API key. Check your Firebase configuration.');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.log('\n⚠️  Email/Password authentication is not enabled.');
      console.log('\n📋 To enable it:');
      console.log('1. Go to https://console.firebase.google.com');
      console.log('2. Select your project: locker-room-talk-app');
      console.log('3. Go to Authentication > Sign-in method');
      console.log('4. Click on Email/Password');
      console.log('5. Enable it and click Save');
    } else if (error.code === 'auth/weak-password') {
      console.log('\n⚠️  Password is too weak. This shouldn\'t happen with our test password.');
    } else {
      console.log('\n⚠️  Unexpected error. Check the Firebase console for more details.');
    }
  }
  
  process.exit(0);
}

testAuth();