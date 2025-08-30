import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../utils/firebase';

const initializeFirestore = async () => {
  console.log('Initializing Firestore collections...');
  
  try {
    // Create a temporary admin user for initialization
    const adminEmail = 'admin@lockerroomtalk.com';
    const adminPassword = 'TempAdmin123!';
    
    let adminUser;
    try {
      // Try to sign in first
      adminUser = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('Signed in as admin user');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create admin user if doesn't exist
        adminUser = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log('Created admin user');
      } else {
        throw error;
      }
    }

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
      console.log(`Created user: ${user.displayName}`);
    }

    console.log('Creating sample reviews...');
    
    // Sample reviews
    const reviews = [
      {
        id: 'review1',
        reviewerId: 'user1',
        reviewedUserId: 'user2',
        rating: 5,
        content: 'Great conversation and very genuine person!',
        isAnonymous: false,
        likes: 3,
        likedBy: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'review2',
        reviewerId: 'user2',
        reviewedUserId: 'user1',
        rating: 4,
        content: 'Fun to talk to, very active lifestyle.',
        isAnonymous: true,
        likes: 1,
        likedBy: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const review of reviews) {
      await setDoc(doc(db, 'reviews', review.id), review);
      console.log(`Created review: ${review.id}`);
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
    console.log('Created chat room');

    console.log('Creating sample messages...');
    
    // Sample messages
    const messages = [
      {
        id: 'msg1',
        chatRoomId: 'chat1',
        senderId: 'user1',
        senderName: 'John',
        content: 'Hey, how are you?',
        timestamp: new Date(),
        readBy: ['user1'],
        type: 'text'
      },
      {
        id: 'msg2',
        chatRoomId: 'chat1',
        senderId: 'user2',
        senderName: 'Sarah',
        content: 'Hi! I\'m doing great, thanks for asking!',
        timestamp: new Date(),
        readBy: ['user2'],
        type: 'text'
      }
    ];

    for (const message of messages) {
      await setDoc(doc(db, 'messages', message.id), message);
      console.log(`Created message: ${message.id}`);
    }

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
      console.log(`Created notification: ${notification.id}`);
    }

    console.log('✅ Firestore initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
  }
};

initializeFirestore();