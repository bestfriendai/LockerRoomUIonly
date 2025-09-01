const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../firebase-admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'locker-room-talk-app'
});

async function verifyAuth() {
  console.log('🔥 Verifying Firebase Authentication Setup...\n');
  
  try {
    // Check if auth is enabled
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log('📋 Project ID:', admin.app().options.projectId);
    
    // Try to list users (this will fail if auth is not enabled)
    const listUsersResult = await admin.auth().listUsers(1);
    console.log('\n✅ Authentication is enabled');
    console.log(`📊 Total users: ${listUsersResult.users.length > 0 ? 'At least 1' : '0'}`);
    
    // Create a test user
    const testEmail = `test_${Date.now()}@example.com`;
    console.log(`\n🧪 Creating test user: ${testEmail}`);
    
    const userRecord = await admin.auth().createUser({
      email: testEmail,
      password: 'TestPassword123!',
      displayName: 'Test User',
      emailVerified: false
    });
    
    console.log('✅ Test user created successfully');
    console.log('   UID:', userRecord.uid);
    console.log('   Email:', userRecord.email);
    
    // Clean up - delete test user
    await admin.auth().deleteUser(userRecord.uid);
    console.log('🧹 Test user deleted\n');
    
    console.log('✨ Firebase Authentication is properly configured!');
    console.log('\n📝 Next steps:');
    console.log('1. Make sure Email/Password auth is enabled in Firebase Console');
    console.log('2. Check that your app is using the correct Web App ID');
    console.log('3. Ensure your Firebase Security Rules allow authentication');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'auth/project-not-found') {
      console.log('\n⚠️  Project not found. Check your Firebase project ID.');
    } else if (error.code === 'auth/insufficient-permission') {
      console.log('\n⚠️  Insufficient permissions. Check your service account credentials.');
    } else {
      console.log('\n⚠️  Firebase Authentication may not be properly configured.');
    }
    
    console.log('\n📋 Troubleshooting steps:');
    console.log('1. Go to https://console.firebase.google.com');
    console.log('2. Select your project: locker-room-talk-app');
    console.log('3. Navigate to Authentication > Sign-in method');
    console.log('4. Enable Email/Password authentication');
    console.log('5. Check Authentication > Users to manage user accounts');
  }
  
  process.exit(0);
}

// Check if service account file exists
const fs = require('fs');
if (!fs.existsSync('./firebase-admin-key.json')) {
  console.error('❌ firebase-admin-key.json not found!');
  console.log('\n📋 To get your service account key:');
  console.log('1. Go to https://console.firebase.google.com');
  console.log('2. Select your project: locker-room-talk-app');
  console.log('3. Go to Project Settings > Service Accounts');
  console.log('4. Click "Generate New Private Key"');
  console.log('5. Save the file as firebase-admin-key.json in the project root');
  process.exit(1);
}

verifyAuth();