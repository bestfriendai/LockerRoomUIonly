const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
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

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Missing Firebase configuration. Please check your .env.local file.');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkReviews() {
  try {
    console.log('🔍 Checking Firestore reviews collection...');
    
    const reviewsCollection = collection(db, 'reviews');
    const reviewsSnapshot = await getDocs(reviewsCollection);
    
    console.log(`📊 Found ${reviewsSnapshot.size} reviews in the database`);
    
    if (reviewsSnapshot.size === 0) {
      console.log('❌ No reviews found in the database');
      console.log('💡 This explains why reviews are not showing in the app');
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
      console.log(`   Author: ${data.author?.username || data.authorId || 'Anonymous'}`);
      console.log(`   Created: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'No date'}`);
      console.log(`   Location: ${data.location ? `${data.location.city}, ${data.location.state}` : 'No location'}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking reviews:', error);
    console.error('🔧 This might be a Firebase configuration or permission issue');
  }
}

checkReviews();