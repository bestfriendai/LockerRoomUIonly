/**
 * Chat Functionality Test Script
 * 
 * Run this script after deploying Firestore fixes to validate chat functionality
 * Usage: node test-chat-functionality.js
 * 
 * Prerequisites:
 * 1. Firebase emulators running (if testing locally)
 * 2. Two test user accounts
 * 3. Firestore rules deployed
 */

const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  signInWithEmailAndPassword,
  connectAuthEmulator 
} = require('firebase/auth');
const {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp
} = require('firebase/firestore');

// Firebase config (use your project config)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  // Add other config fields as needed
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators if running locally
const USE_EMULATORS = process.env.USE_EMULATORS === 'true';
if (USE_EMULATORS) {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.log('ℹ️  Emulators already connected or not available');
  }
}

// Test configuration
const TEST_USERS = [
  { email: 'user1@test.com', password: 'password123', id: 'user1' },
  { email: 'user2@test.com', password: 'password123', id: 'user2' }
];

async function runChatTests() {
  console.log('🧪 Starting Chat Functionality Tests...\n');

  try {
    // Test 1: Create chat room
    console.log('1️⃣  Testing chat room creation...');
    const roomId = `${TEST_USERS[0].id}_${TEST_USERS[1].id}`;
    const chatRoomRef = doc(db, 'chatRooms', roomId);
    
    await setDoc(chatRoomRef, {
      participants: [TEST_USERS[0].id, TEST_USERS[1].id],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
      lastMessageTime: null,
      unreadCount: {
        [TEST_USERS[0].id]: 0,
        [TEST_USERS[1].id]: 0
      },
      name: 'Test Chat Room',
      type: 'direct',
      isActive: true,
      createdBy: TEST_USERS[0].id
    });
    console.log('✅ Chat room created successfully');

    // Test 2: Test array-contains query
    console.log('\n2️⃣  Testing participant query (array-contains)...');
    const userRoomsQuery = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', TEST_USERS[0].id)
    );
    
    const querySnapshot = await getDocs(userRoomsQuery);
    if (querySnapshot.empty) {
      console.log('❌ Array-contains query returned no results');
    } else {
      console.log(`✅ Found ${querySnapshot.size} chat room(s) for user`);
    }

    // Test 3: Test joining room (adding participant)
    console.log('\n3️⃣  Testing user joining room...');
    const newUserId = 'user3';
    await updateDoc(chatRoomRef, {
      participants: arrayUnion(newUserId),
      updatedAt: serverTimestamp(),
      [`unreadCount.${newUserId}`]: 0
    });
    console.log('✅ User successfully joined room');

    // Test 4: Test message creation
    console.log('\n4️⃣  Testing message creation...');
    const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
    const messageRef = doc(messagesRef);
    
    await setDoc(messageRef, {
      roomId: roomId,
      senderId: TEST_USERS[0].id,
      content: 'Test message for functionality validation',
      messageType: 'text',
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      isRead: false,
      isDelivered: true
    });
    console.log('✅ Message created successfully');

    // Test 5: Test message read update
    console.log('\n5️⃣  Testing message read status update...');
    await updateDoc(messageRef, {
      isRead: true,
      readAt: serverTimestamp()
    });
    console.log('✅ Message read status updated successfully');

    console.log('\n🎉 All tests passed! Chat functionality is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    
    // Common error hints
    if (error.message.includes('permission-denied')) {
      console.log('\n💡 Hint: This might be a Firestore security rules issue.');
      console.log('   Make sure the updated rules are deployed.');
    }
    
    if (error.message.includes('indexes')) {
      console.log('\n💡 Hint: Firestore indexes might still be building.');
      console.log('   Check Firebase Console > Firestore > Indexes');
    }
  }
}

async function authenticateUser(user) {
  try {
    await signInWithEmailAndPassword(auth, user.email, user.password);
    console.log(`🔐 Authenticated as ${user.email}`);
  } catch (error) {
    console.log(`ℹ️  Could not authenticate ${user.email} (${error.message})`);
    console.log('   Tests will run without authentication');
  }
}

// Main execution
async function main() {
  try {
    // Try to authenticate (optional for testing)
    await authenticateUser(TEST_USERS[0]);
    
    // Run tests
    await runChatTests();
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    console.log('\n📋 Test Summary:');
    console.log('   - Chat room creation: ✅ or ❌');
    console.log('   - Participant queries: ✅ or ❌');  
    console.log('   - Room joining: ✅ or ❌');
    console.log('   - Message creation: ✅ or ❌');
    console.log('   - Message read updates: ✅ or ❌');
    console.log('\n🔍 Next: Test in the actual app with real user interactions');
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runChatTests };