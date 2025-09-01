/**
 * Test Review Display Functionality
 * Tests fetching and displaying reviews
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signOut, deleteUser } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDocs, collection, serverTimestamp, addDoc } = require('firebase/firestore');

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

async function testReviewDisplay() {
  console.log('\n📖 Testing Review Display');
  console.log('='.repeat(50));

  let user = null;

  try {
    // Create a test user
    const email = generateTestEmail('display-test');
    const password = 'testPassword123!';

    console.log('Creating test user...');
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    user = userCred.user;

    // Create user document
    const userData = {
      id: user.uid,
      name: 'Display Test User',
      email: email,
      age: 28,
      bio: 'Test user for review display',
      photos: [],
      location: 'Display City',
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

    // Create multiple test reviews
    console.log('Creating test reviews...');
    const reviews = [
      {
        authorId: user.uid,
        targetName: 'Alice Johnson',
        category: 'Women',
        content: 'Had a great conversation on Tinder. Very genuine and interesting person. Would definitely meet again.',
        rating: 5,
        isAnonymous: true,
        title: 'Great Conversation',
        platform: 'Tinder',
        location: 'Coffee Shop Downtown',
        locationData: null,
        coordinates: null,
        media: [],
        verified: false,
        likes: 0,
        dislikes: 0,
        comments: [],
        timestamp: serverTimestamp(),
      },
      {
        authorId: user.uid,
        targetName: 'Bob Smith',
        category: 'Men',
        content: 'Met through Bumble. The profile picture was very misleading. Not a good experience overall.',
        rating: 1,
        isAnonymous: true,
        title: 'Misleading Profile',
        platform: 'Bumble',
        location: 'Restaurant',
        locationData: null,
        coordinates: null,
        media: [],
        verified: false,
        likes: 0,
        dislikes: 0,
        comments: [],
        timestamp: serverTimestamp(),
      }
    ];

    const reviewIds = [];
    for (const review of reviews) {
      const docRef = await addDoc(collection(db, "reviews"), review);
      reviewIds.push(docRef.id);
      console.log(`✅ Review created: ${docRef.id}`);
    }

    // Test fetching all reviews
    console.log('Fetching all reviews...');
    const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
    const fetchedReviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Found ${fetchedReviews.length} reviews total`);

    // Filter reviews by our test user
    const userReviews = fetchedReviews.filter(review => review.authorId === user.uid);
    console.log(`✅ Found ${userReviews.length} reviews by test user`);

    // Display review details
    userReviews.forEach((review, index) => {
      console.log(`\n📝 Review ${index + 1}:`);
      console.log(`   ID: ${review.id}`);
      console.log(`   Target: ${review.targetName}`);
      console.log(`   Category: ${review.category}`);
      console.log(`   Rating: ${review.rating}/5`);
      console.log(`   Title: ${review.title}`);
      console.log(`   Content: ${review.content.substring(0, 80)}...`);
      console.log(`   Platform: ${review.platform}`);
      console.log(`   Anonymous: ${review.isAnonymous}`);
    });

    console.log('✅ Review display test completed successfully!');

  } catch (error) {
    console.error('❌ Review display test failed:', error.message);
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
testReviewDisplay().then(() => {
  console.log('\n🏁 Review display test finished');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed with error:', error);
  process.exit(1);
});