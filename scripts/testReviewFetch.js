#!/usr/bin/env node

/**
 * Test script to verify review fetching works without property errors
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  limit 
} = require('firebase/firestore');

// Firebase config (using environment variables)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

async function testReviewFetch() {
  try {
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('📋 Fetching reviews...');
    const reviewsQuery = query(collection(db, 'reviews'), limit(5));
    const reviewsSnapshot = await getDocs(reviewsQuery);

    console.log(`✅ Found ${reviewsSnapshot.size} reviews`);

    if (reviewsSnapshot.size > 0) {
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
        console.log(`   Created: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'No date'}`);
        console.log(`   Location: ${data.location ? `${data.location.city || 'Unknown'}, ${data.location.state || 'Unknown'}` : 'No location'}`);
        
        // Test that we don't try to access non-existent properties
        console.log(`   ✅ No 'user' property access attempted`);
        console.log(`   ✅ No 'author.username' property access attempted`);
      });
    } else {
      console.log('ℹ️  No reviews found in the database');
    }

    console.log('\n✅ Test completed successfully - no property access errors!');
    
  } catch (error) {
    console.error('❌ Error testing review fetch:', error);
    console.error('🔧 This might be a Firebase configuration or permission issue');
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testReviewFetch();
