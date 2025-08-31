import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  addDoc,
  and
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { ChatRoom, ChatMessage } from '../types';

const CHAT_ROOMS_COLLECTION = 'chatRooms';
const MESSAGES_COLLECTION = 'messages';

export class ChatService {
  // Create or get existing chat room between two users
  static async createOrGetChatRoom(user1Id: string, user2Id: string): Promise<string> {
    try {
      // Create a consistent room ID regardless of user order
      const roomId = [user1Id, user2Id].sort().join('_');
      const chatRoomRef = doc(db, CHAT_ROOMS_COLLECTION, roomId);
      const chatRoomSnap = await getDoc(chatRoomRef);
      
      if (!chatRoomSnap.exists()) {
        // Create new chat room
        const chatRoom: ChatRoom = {
          id: roomId,
          participants: [user1Id, user2Id],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          lastMessage: null,
          lastMessageTime: null,
          unreadCount: {
            [user1Id]: 0,
            [user2Id]: 0
          }
        };
        
        await setDoc(chatRoomRef, chatRoom);
      }
      
      return roomId;
    } catch (error) {
      if (__DEV__) {
        console.error('Error creating/getting chat room:', error);
      }
      throw error;
    }
  }

  // Get chat room by ID
  static async getChatRoom(roomId: string): Promise<ChatRoom | null> {
    try {
      const chatRoomRef = doc(db, CHAT_ROOMS_COLLECTION, roomId);
      const chatRoomSnap = await getDoc(chatRoomRef);
      
      if (chatRoomSnap.exists()) {
        return { id: chatRoomSnap.id, ...chatRoomSnap.data() } as ChatRoom;
      }
      return null;
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting chat room:', error);
      }
      throw error;
    }
  }

  // Get all chat rooms for a user
  static async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
    try {
      const q = query(
        collection(db, CHAT_ROOMS_COLLECTION),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatRoom[];
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting user chat rooms:', error);
      }
      throw error;
    }
  }

  // Send a message
  static async sendMessage(
    roomId: string, 
    senderId: string, 
    content: string, 
    messageType: 'text' | 'image' | 'emoji' = 'text'
  ): Promise<string> {
    try {
      const messageRef = doc(collection(db, MESSAGES_COLLECTION));
      const message: ChatMessage = {
        id: messageRef.id,
        roomId,
        senderId,
        content,
        messageType,
        timestamp: Timestamp.now(),
        isRead: false,
        isDelivered: true
      };
      
      await setDoc(messageRef, message);
      
      // Update chat room with last message info
      const chatRoomRef = doc(db, CHAT_ROOMS_COLLECTION, roomId);
      const chatRoom = await getDoc(chatRoomRef);
      
      if (chatRoom.exists()) {
        const roomData = chatRoom.data() as ChatRoom;
        const otherUserId = roomData.participants.find(id => id !== senderId);
        
        await updateDoc(chatRoomRef, {
          lastMessage: content,
          lastMessageTime: Timestamp.now(),
          updatedAt: Timestamp.now(),
          [`unreadCount.${otherUserId}`]: ((roomData.unreadCount as any)?.[otherUserId as string] || 0) + 1
        });
      }
      
      return messageRef.id;
    } catch (error) {
      if (__DEV__) {
        console.error('Error sending message:', error);
      }
      throw error;
    }
  }

  // Get messages for a chat room
  static async getMessages(roomId: string, limitCount: number = 50): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('roomId', '==', roomId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      
      // Return messages in chronological order (oldest first)
      return messages.reverse();
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting messages:', error);
      }
      throw error;
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    try {
      // Get unread messages in the room
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        and(
          where('roomId', '==', roomId),
          where('senderId', '!=', userId),
          where('isRead', '==', false)
        )
      );

      const querySnapshot = await getDocs(q);
      
      // Mark each message as read
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { isRead: true })
      );
      
      await Promise.all(updatePromises);
      
      // Reset unread count for this user in the chat room
      const chatRoomRef = doc(db, CHAT_ROOMS_COLLECTION, roomId);
      await updateDoc(chatRoomRef, {
        [`unreadCount.${userId}`]: 0
      });
    } catch (error) {
      if (__DEV__) {
        console.error('Error marking messages as read:', error);
      }
      throw error;
    }
  }

  // Delete a message
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      await deleteDoc(messageRef);
    } catch (error) {
      if (__DEV__) {
        console.error('Error deleting message:', error);
      }
      throw error;
    }
  }

  // Listen to messages in real-time
  static subscribeToMessages(roomId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      callback(messages);
    }, (error) => {
      if (__DEV__) {
        console.error('Error listening to messages:', error);
      }
      callback([]);
    });
  }

  // Listen to chat rooms in real-time
  static subscribeToUserChatRooms(userId: string, callback: (chatRooms: ChatRoom[]) => void): () => void {
    const q = query(
      collection(db, CHAT_ROOMS_COLLECTION),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const chatRooms = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatRoom[];
      callback(chatRooms);
    }, (error) => {
      if (__DEV__) {
        console.error('Error listening to chat rooms:', error);
      }
      callback([]);
    });
  }

  // Get unread message count for user
  static async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      const chatRooms = await this.getUserChatRooms(userId);
      return chatRooms.reduce((total, room) => {
        return total + (room.unreadCount?.[userId] || 0);
      }, 0);
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting unread message count:', error);
      }
      return 0;
    }
  }

  // Block/Unblock user in chat
  static async toggleBlockUser(roomId: string, userId: string, targetUserId: string, block: boolean): Promise<void> {
    try {
      const chatRoomRef = doc(db, CHAT_ROOMS_COLLECTION, roomId);
      const chatRoom = await getDoc(chatRoomRef);
      
      if (chatRoom.exists()) {
        const roomData = chatRoom.data() as ChatRoom;
        const blockedUsers = roomData.blockedUsers || [];
        
        if (block && !blockedUsers.includes(targetUserId)) {
          await updateDoc(chatRoomRef, {
            blockedUsers: [...blockedUsers, targetUserId],
            updatedAt: Timestamp.now()
          });
        } else if (!block && blockedUsers.includes(targetUserId)) {
          await updateDoc(chatRoomRef, {
            blockedUsers: blockedUsers.filter(id => id !== targetUserId),
            updatedAt: Timestamp.now()
          });
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error toggling block user:', error);
      }
      throw error;
    }
  }
}

// Export individual functions for compatibility
export const createOrGetChatRoom = ChatService.createOrGetChatRoom;
export const getChatRoom = ChatService.getChatRoom;
export const getUserChatRooms = ChatService.getUserChatRooms;
export const sendMessage = ChatService.sendMessage;
export const getMessages = ChatService.getMessages;
export const subscribeToMessages = ChatService.subscribeToMessages;
export const subscribeToUserChatRooms = ChatService.subscribeToUserChatRooms;
export const markMessagesAsRead = ChatService.markMessagesAsRead;
export const toggleBlockUser = ChatService.toggleBlockUser;

// Export the service instance for backward compatibility
export const chatService = ChatService;