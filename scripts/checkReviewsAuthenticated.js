#!/usr/bin/env node

/**
 * Authenticated version of checkReviews script
 * This script signs in with test credentials before checking reviews
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Test credentials - you can set these as environment variables
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword123';

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Missing Firebase configuration. Please check your .env.local file.');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function authenticateUser() {
  try {
    console.log('🔐 Attempting to sign in...');
    const userCredential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    console.log('✅ Successfully authenticated as:', userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.log('❌ Authentication failed:', error.message);
    console.log('💡 Make sure you have valid test credentials set in environment variables:');
    console.log('   TEST_EMAIL=your-test-email@example.com');
    console.log('   TEST_PASSWORD=your-test-password');
    console.log('   Or create a test account in your Firebase console.');
    throw error;
  }
}

async function checkReviews() {
  try {
    console.log('🔍 Checking Firestore reviews collection...');
    
    const reviewsCollection = collection(db, 'reviews');
    const reviewsSnapshot = await getDocs(reviewsCollection);
    
    console.log(`📊 Found ${reviewsSnapshot.size} reviews in the database`);
    
    if (reviewsSnapshot.size === 0) {
      console.log('❌ No reviews found in the database');
      console.log('💡 This explains why reviews are not showing in the app');
      console.log('🔧 You may need to:');
      console.log('   1. Create some test reviews through the app');
      console.log('   2. Import sample data');
      console.log('   3. Check if reviews are in a different collection');
      return;
    }
    
    console.log('\n📋 Review details:');
    reviewsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. Review ID: ${doc.id}`);
      console.log(`   Title: ${data.title || 'No title'}`);
      console.log(`   Content: ${data.content ? data.content.substring(0, 50) + '...' : 'No content'}`);
      console.log(`   Rating: ${data.rating || 'No rating'}`);
      console.log(`   Category: ${data.category || 'No category'}`);
      console.log(`   Author ID: ${data.authorId || 'No authorId'}`);
      console.log(`   Target User ID: ${data.targetUserId || 'No targetUserId'}`);
      console.log(`   Moderation Status: ${data.moderationStatus || 'pending'}`);
      console.log(`   Created: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'No date'}`);
      console.log(`   Location: ${data.location ? `${data.location.city || 'Unknown'}, ${data.location.state || 'Unknown'}` : 'No location'}`);
    });
    
    // Check moderation status
    const approvedReviews = reviewsSnapshot.docs.filter(doc => doc.data().moderationStatus === 'approved');
    const pendingReviews = reviewsSnapshot.docs.filter(doc => !doc.data().moderationStatus || doc.data().moderationStatus === 'pending');
    
    console.log(`\n📊 Review Status Summary:`);
    console.log(`   ✅ Approved: ${approvedReviews.length}`);
    console.log(`   ⏳ Pending: ${pendingReviews.length}`);
    
    if (pendingReviews.length > 0) {
      console.log('\n💡 Note: Your Firestore rules only allow public access to approved reviews.');
      console.log('   Pending reviews require authentication to view.');
    }
    
  } catch (error) {
    console.error('❌ Error checking reviews:', error);
    console.error('🔧 This might be a Firebase configuration or permission issue');
    throw error;
  }
}

async function main() {
  try {
    // First try without authentication
    console.log('🔍 Trying to access reviews without authentication...');
    try {
      await checkReviews();
      console.log('✅ Success! Reviews are publicly accessible.');
      return;
    } catch (error) {
      if (error.message.includes('permission-denied') || error.message.includes('Missing or insufficient permissions')) {
        console.log('⚠️  Permission denied - authentication required.');
      } else {
        throw error;
      }
    }
    
    // If that fails, try with authentication
    console.log('\n🔐 Attempting authenticated access...');
    await authenticateUser();
    await checkReviews();
    
    console.log('\n✅ Authenticated access successful!');
    
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Check your Firebase configuration in .env.local');
    console.log('   2. Verify your Firestore security rules');
    console.log('   3. Create a test user account if needed');
    console.log('   4. Check if your Firebase project is active');
    process.exit(1);
  }
}

main();
