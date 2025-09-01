/**
 * Test Review Creation Functionality
 * Tests the review creation process to ensure it works properly
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc, addDoc, collection, serverTimestamp } = require('firebase/firestore');

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

async function testReviewCreation() {
  console.log('\n📝 Testing Review Creation');
  console.log('='.repeat(50));

  let user = null;

  try {
    // Create a test user
    const email = generateTestEmail('review-test');
    const password = 'testPassword123!';

    console.log('Creating test user...');
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    user = userCred.user;

    // Create user document
    console.log('Creating user document...');
    const userData = {
      id: user.uid,
      name: 'Review Test User',
      email: email,
      age: 25,
      bio: 'Test user for review creation',
      photos: [],
      location: 'Test City',
      interests: ['testing'],
      verified: false,
      profileComplete: false,
      isOnline: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActive: serverTimestamp()
    };

    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('✅ User document created');

    // Test review creation
    console.log('Creating test review...');
    const reviewData = {
      authorId: user.uid,
      targetName: 'Test Person',
      category: 'Men',
      content: 'This is a test review with sufficient content to meet the minimum requirements for validation.',
      rating: 5,
      isAnonymous: true,
      title: 'Great Experience',
      platform: 'Tinder',
      location: 'Test Location',
      locationData: null,
      coordinates: null,
      media: [],
      verified: false,
      likes: 0,
      dislikes: 0,
      comments: [],
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "reviews"), reviewData);
    console.log('✅ Review created successfully with ID:', docRef.id);

    // Verify the review was created
    console.log('Verifying review creation...');
    const reviewDoc = await getDoc(doc(db, 'reviews', docRef.id));
    if (reviewDoc.exists()) {
      const data = reviewDoc.data();
      console.log('✅ Review document exists with data:', {
        authorId: data.authorId,
        targetName: data.targetName,
        content: data.content.substring(0, 50) + '...',
        rating: data.rating,
        isAnonymous: data.isAnonymous
      });
    } else {
      console.log('❌ Review document not found');
    }

    console.log('✅ Review creation test completed successfully!');

  } catch (error) {
    console.error('❌ Review creation test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    // Cleanup
    if (user) {
      try {
        console.log('Cleaning up test user...');
        await deleteUser(user);
        console.log('✅ Test user deleted');
      } catch (cleanupError) {
        console.warn('⚠️  Failed to cleanup test user:', cleanupError.message);
      }
    }
  }
}

// Run the test
testReviewCreation().then(() => {
  console.log('\n🏁 Review creation test finished');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed with error:', error);
  process.exit(1);
});