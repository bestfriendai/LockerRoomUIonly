#!/usr/bin/env node

// Test Firebase Authentication
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');

// Firebase config from .env
const firebaseConfig = {
  apiKey: "AIzaSyDcdGoo6Z2uHXNmFyXnKdltwrMUXPcp_4A",
  authDomain: "locker-room-talk-app.firebaseapp.com",
  projectId: "locker-room-talk-app",
  storageBucket: "locker-room-talk-app.firebasestorage.app",
  messagingSenderId: "514288923681",
  appId: "1:514288923681:web:6207902c8cb50899bc5f60"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testAuth() {
  console.log('Testing Firebase Authentication...');
  
  // Test creating a new user
  const testEmail = 'test-user@lockerroom.com';
  const testPassword = 'password123';
  
  try {
    console.log('Attempting to create user:', testEmail);
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ User created successfully:', userCredential.user.uid);
    
    // Test signing in
    console.log('Attempting to sign in...');
    const signInCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Sign in successful:', signInCredential.user.uid);
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('User already exists, testing sign in...');
      try {
        const signInCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
        console.log('✅ Sign in successful:', signInCredential.user.uid);
      } catch (signInError) {
        console.error('❌ Sign in failed:', signInError.code, signInError.message);
      }
    } else {
      console.error('❌ Auth test failed:', error.code, error.message);
    }
  }
}

testAuth().then(() => {
  console.log('Auth test completed');
  process.exit(0);
}).catch((error) => {
  console.error('Auth test error:', error);
  process.exit(1);
});
