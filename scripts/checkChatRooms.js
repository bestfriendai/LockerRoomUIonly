import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAndCreateChatRooms() {
  try {
    console.log('Checking existing chat rooms...');
    
    // Check existing chat rooms
    const chatRoomsRef = collection(db, 'chatRooms');
    const snapshot = await getDocs(chatRoomsRef);
    
    console.log(`Found ${snapshot.size} chat rooms`);
    
    if (snapshot.size === 0) {
      console.log('No chat rooms found. Creating test data...');
      
      // Create some test chat rooms
      const testRooms = [
        {
          name: 'General Discussion',
          description: 'A place for general conversations',
          isPublic: true,
          isAnonymous: true,
          type: 'public',
          participants: [],
          moderators: [],
          createdBy: 'system',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessageTime: serverTimestamp(),
          memberCount: 0
        },
        {
          name: 'Dating Tips',
          description: 'Share and discuss dating advice',
          isPublic: true,
          isAnonymous: true,
          type: 'public',
          participants: [],
          moderators: [],
          createdBy: 'system',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessageTime: serverTimestamp(),
          memberCount: 0
        },
        {
          name: 'Anonymous Reviews',
          description: 'Discuss anonymous dating experiences',
          isPublic: true,
          isAnonymous: true,
          type: 'public',
          participants: [],
          moderators: [],
          createdBy: 'system',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessageTime: serverTimestamp(),
          memberCount: 0
        }
      ];
      
      for (const room of testRooms) {
        const docRef = await addDoc(chatRoomsRef, room);
        console.log(`Created chat room: ${room.name} with ID: ${docRef.id}`);
      }
      
      console.log('Test chat rooms created successfully!');
    } else {
      console.log('Chat rooms already exist:');
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.name} (${doc.id})`);
      });
    }
  } catch (error) {
    console.error('Error checking/creating chat rooms:', error);
  }
}

checkAndCreateChatRooms();