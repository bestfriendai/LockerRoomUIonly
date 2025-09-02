// Simple test to verify Firebase Auth is working
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyDcdGoo6Z2uHXNmFyXnKdltwrMUXPcp_4A",
  authDomain: "locker-room-talk-app.firebaseapp.com",
  projectId: "locker-room-talk-app",
  storageBucket: "locker-room-talk-app.firebasestorage.app",
  messagingSenderId: "514288923681",
  appId: "1:514288923681:web:6207902c8cb50899bc5f60"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testAuth() {
  console.log('Testing Firebase Auth...');
  
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'testpass123';
  
  try {
    // Test creating a user
    console.log('Creating test user...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ User created successfully:', userCredential.user.uid);
    
    // Test signing in
    console.log('Testing sign in...');
    const signInResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Sign in successful:', signInResult.user.uid);
    
    console.log('\n✅ Firebase Auth is working correctly!');
  } catch (error) {
    console.error('❌ Firebase Auth test failed:', error.message);
    console.error('Error code:', error.code);
  }
}

testAuth();