import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // For local development, you can use the Firebase emulator or service account key
  // For now, let's try to initialize with the project ID
  admin.initializeApp({
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'locker-room-talk-app'
  });
}

const db = admin.firestore();

async function checkAndCreateChatRooms() {
  try {
    console.log('Checking existing chat rooms with Admin SDK...');
    
    // Check existing chat rooms
    const chatRoomsRef = db.collection('chatRooms');
    const snapshot = await chatRoomsRef.get();
    
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
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
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
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
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
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
          memberCount: 0
        }
      ];
      
      for (const room of testRooms) {
        const docRef = await chatRoomsRef.add(room);
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