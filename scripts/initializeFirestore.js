const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
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

const initializeFirestore = async () => {
  try {
    console.log('🚀 Initializing Firestore with sample data...');
    
    console.log('Creating sample users...');
    
    // Sample users
    const users = [
      {
        id: 'user1',
        email: 'john@example.com',
        displayName: 'John',
        age: 28,
        location: 'New York',
        interests: ['fitness', 'travel', 'music'],
        bio: 'Love exploring new places and staying active!',
        profileComplete: true,
        isOnline: false,
        lastActive: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'user2',
        email: 'sarah@example.com',
        displayName: 'Sarah',
        age: 25,
        location: 'Los Angeles',
        interests: ['art', 'cooking', 'hiking'],
        bio: 'Artist and food lover seeking genuine connections.',
        profileComplete: true,
        isOnline: true,
        lastActive: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const user of users) {
      await setDoc(doc(db, 'users', user.id), user);
      console.log(`✅ Created user: ${user.displayName}`);
    }

    console.log('Creating sample reviews...');
    
    // Sample reviews with proper structure for the app
    const reviews = [
      {
        id: 'review1',
        authorId: 'user1',
        author: {
          id: 'user1',
          username: 'Anonymous_User_1',
          displayName: 'John'
        },
        title: 'Amazing Coffee Date Experience',
        content: 'Had an incredible coffee date at the local café. Great conversation, genuine connection, and wonderful atmosphere. Highly recommend this spot for first dates!',
        category: 'Coffee Dates',
        rating: 5,
        targetUser: 'Women 25-30',
        location: {
          city: 'New York',
          state: 'NY',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        images: [],
        tags: ['coffee', 'first-date', 'conversation'],
        likes: 12,
        shares: 3,
        comments: 5,
        likedBy: [],
        isAnonymous: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'review2',
        authorId: 'user2',
        author: {
          id: 'user2',
          username: 'Anonymous_User_2',
          displayName: 'Sarah'
        },
        title: 'Romantic Dinner Review',
        content: 'Went to this upscale restaurant for a dinner date. The ambiance was perfect, food was exceptional, and the service was top-notch. Perfect for special occasions!',
        category: 'Dinner Dates',
        rating: 4,
        targetUser: 'Men 28-35',
        location: {
          city: 'Los Angeles',
          state: 'CA',
          coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        images: [],
        tags: ['dinner', 'romantic', 'upscale'],
        likes: 8,
        shares: 2,
        comments: 3,
        likedBy: [],
        isAnonymous: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'review3',
        authorId: 'user1',
        author: {
          id: 'user1',
          username: 'Anonymous_User_1',
          displayName: 'John'
        },
        title: 'Fun Activity Date',
        content: 'Tried mini golf for our second date and it was so much fun! Great way to break the ice and have some laughs together. Definitely recommend for casual dating.',
        category: 'Activity Dates',
        rating: 5,
        targetUser: 'Anyone',
        location: {
          city: 'New York',
          state: 'NY',
          coordinates: { lat: 40.7589, lng: -73.9851 }
        },
        images: [],
        tags: ['mini-golf', 'fun', 'casual'],
        likes: 15,
        shares: 4,
        comments: 7,
        likedBy: [],
        isAnonymous: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const review of reviews) {
      await setDoc(doc(db, 'reviews', review.id), review);
      console.log(`✅ Created review: ${review.title}`);
    }

    console.log('Creating sample chat room...');
    
    // Sample chat room
    const chatRoom = {
      id: 'chat1',
      participants: ['user1', 'user2'],
      participantNames: ['John', 'Sarah'],
      lastMessage: 'Hey, how are you?',
      lastMessageTime: new Date(),
      unreadCount: { user1: 0, user2: 1 },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'chatRooms', chatRoom.id), chatRoom);
    console.log('✅ Created chat room');

    console.log('Creating sample notifications...');
    
    // Sample notifications
    const notifications = [
      {
        id: 'notif1',
        userId: 'user2',
        type: 'new_message',
        title: 'New Message',
        message: 'You have a new message from John',
        data: { chatRoomId: 'chat1', senderId: 'user1' },
        read: false,
        createdAt: new Date()
      },
      {
        id: 'notif2',
        userId: 'user2',
        type: 'new_review',
        title: 'New Review',
        message: 'Someone left you a review',
        data: { reviewId: 'review1' },
        read: false,
        createdAt: new Date()
      }
    ];

    for (const notification of notifications) {
      await setDoc(doc(db, 'notifications', notification.id), notification);
      console.log(`✅ Created notification: ${notification.id}`);
    }

    console.log('🎉 Firestore initialization completed successfully!');
    console.log('📊 Created:');
    console.log('   - 2 users');
    console.log('   - 3 reviews');
    console.log('   - 1 chat room');
    console.log('   - 2 notifications');
    
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
  }
};

initializeFirestore();