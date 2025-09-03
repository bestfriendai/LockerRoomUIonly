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
  and,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import logger from '../utils/logger';
import { db } from '../utils/firebase';
import { ChatRoom, ChatMessage } from '../types';
import { isUserAuthenticated, getCurrentUserId, createAuthError } from '../utils/authUtils';
import { toDate, createTimestamp, formatRelativeTime } from '../utils/timestampHelpers';

const CHAT_ROOMS_COLLECTION = 'chatRooms';
const MESSAGES_COLLECTION = 'messages';

// Error types for better error handling
class ChatServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ChatServiceError';
  }
}

class AuthenticationError extends ChatServiceError {
  constructor(message: string = 'User not authenticated') {
    super(message, 'AUTHENTICATION_ERROR');
  }
}

class PermissionError extends ChatServiceError {
  constructor(message: string = 'Permission denied') {
    super(message, 'PERMISSION_ERROR');
  }
}

class ValidationError extends ChatServiceError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class ChatService {
  // Helper method to validate user authentication
  private static validateAuth(): string {
    if (!isUserAuthenticated()) {
      throw new AuthenticationError();
    }
    
    const userId = getCurrentUserId();
    if (!userId) {
      throw new AuthenticationError('Unable to get current user ID');
    }
    
    return userId;
  }
  
  // Helper method to validate message content
  private static validateMessageContent(content: string): void {
    if (!content || typeof content !== 'string') {
      throw new ValidationError('Message content is required');
    }
    
    if (content.trim().length === 0) {
      throw new ValidationError('Message content cannot be empty');
    }
    
    if (content.length > 2000) {
      throw new ValidationError('Message content is too long (max 2000 characters)');
    }
  }
  
  // Helper method to check if user is participant
  private static isUserParticipant(chatRoom: ChatRoom, userId: string): boolean {
    return chatRoom.participants?.includes(userId) || 
           chatRoom.memberIds?.includes(userId) || 
           false;
  }
  // Create or get existing chat room between two users
  static async createOrGetChatRoom(user1Id: string, user2Id: string): Promise<string> {
    try {
      const currentUserId = this.validateAuth();
      
      // Verify the current user is one of the participants
      if (currentUserId !== user1Id && currentUserId !== user2Id) {
        throw new PermissionError('You can only create chat rooms that you are a participant in');
      }
      
      // Create a consistent room ID regardless of user order
      const roomId = [user1Id, user2Id].sort().join('_');
      const chatRoomRef = doc(db, CHAT_ROOMS_COLLECTION, roomId);
      const chatRoomSnap = await getDoc(chatRoomRef);
      
      if (!chatRoomSnap.exists()) {
        // Create new chat room with proper structure for security rules
        const chatRoom: Partial<ChatRoom> = {
          participants: [user1Id, user2Id],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: null,
          lastMessageTime: null,
          unreadCount: {
            [user1Id]: 0,
            [user2Id]: 0
          },
          name: 'Direct Message', // Required by security rules
          type: 'direct',
          isActive: true,
          createdBy: currentUserId
        };
        
        await setDoc(chatRoomRef, chatRoom);
      }
      
      return roomId;
    } catch (error) {
      if (__DEV__) {
        console.error('Error creating/getting chat room:', error);
      }
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError('Failed to create or get chat room', 'CREATE_ROOM_ERROR');
    }
  }

  // Get chat room by ID
  static async getChatRoom(roomId: string): Promise<ChatRoom | null> {
    try {
      const currentUserId = this.validateAuth();
      
      const chatRoomRef = doc(db, CHAT_ROOMS_COLLECTION, roomId);
      const chatRoomSnap = await getDoc(chatRoomRef);
      
      if (chatRoomSnap.exists()) {
        const chatRoom = { id: chatRoomSnap.id, ...chatRoomSnap.data() } as ChatRoom;
        
        // Verify user is a participant
        if (!this.isUserParticipant(chatRoom, currentUserId)) {
          throw new PermissionError('You are not a participant in this chat room');
        }
        
        // Convert timestamps safely
        if (chatRoom.createdAt) {
          chatRoom.createdAt = toDate(chatRoom.createdAt) || chatRoom.createdAt;
        }
        if (chatRoom.updatedAt) {
          chatRoom.updatedAt = toDate(chatRoom.updatedAt) || chatRoom.updatedAt;
        }
        if (chatRoom.lastMessageTime) {
          chatRoom.lastMessageTime = toDate(chatRoom.lastMessageTime) || chatRoom.lastMessageTime;
        }
        
        return chatRoom;
      }
      return null;
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting chat room:', error);
      }
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError('Failed to get chat room', 'GET_ROOM_ERROR');
    }
  }

  // Get all chat rooms for a user
  static async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
    try {
      const currentUserId = this.validateAuth();
      
      // Verify the userId matches the current user
      if (currentUserId !== userId) {
        throw new PermissionError('You can only access your own chat rooms');
      }

      const q = query(
        collection(db, CHAT_ROOMS_COLLECTION),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const chatRooms = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const chatRoom = { id: doc.id, ...data } as ChatRoom;
        
        // Safely convert timestamps
        if (chatRoom.createdAt) {
          chatRoom.createdAt = toDate(chatRoom.createdAt) || chatRoom.createdAt;
        }
        if (chatRoom.updatedAt) {
          chatRoom.updatedAt = toDate(chatRoom.updatedAt) || chatRoom.updatedAt;
        }
        if (chatRoom.lastMessageTime) {
          chatRoom.lastMessageTime = toDate(chatRoom.lastMessageTime) || chatRoom.lastMessageTime;
        }
        
        return chatRoom;
      });
      
      return chatRooms;
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting user chat rooms:', error);
      }
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError('Failed to get user chat rooms', 'GET_USER_ROOMS_ERROR');
    }
  }

  // Send a message
  static async sendMessage(
    roomId: string, 
    content: string, 
    messageType: 'text' | 'image' | 'emoji' | 'file' = 'text'
  ): Promise<string> {
    try {
      const currentUserId = this.validateAuth();
      this.validateMessageContent(content);
      
      // Get chat room to verify participation
      const chatRoom = await this.getChatRoom(roomId);
      if (!chatRoom) {
        throw new ValidationError('Chat room not found');
      }
      
      if (!this.isUserParticipant(chatRoom, currentUserId)) {
        throw new PermissionError('You are not a participant in this chat room');
      }
      
      // Create message in subcollection (compatible with security rules)
      const messagesCollectionRef = collection(db, CHAT_ROOMS_COLLECTION, roomId, 'messages');
      const messageRef = doc(messagesCollectionRef);
      
      const message: Partial<ChatMessage> = {
        roomId,
        senderId: currentUserId,
        content: content.trim(),
        messageType,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        isRead: false,
        isDelivered: true
      };
      
      await setDoc(messageRef, message);
      
      // Update chat room with last message info
      const chatRoomRef = doc(db, CHAT_ROOMS_COLLECTION, roomId);
      const otherUserIds = chatRoom.participants.filter(id => id !== currentUserId);
      
      const updateData: any = {
        lastMessage: content.trim(),
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Increment unread count for other participants
      otherUserIds.forEach(userId => {
        updateData[`unreadCount.${userId}`] = increment(1);
      });
      
      await updateDoc(chatRoomRef, updateData);
      
      return messageRef.id;
    } catch (error) {
      if (__DEV__) {
        console.error('Error sending message:', error);
      }
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError('Failed to send message', 'SEND_MESSAGE_ERROR');
    }
  }

  // Get messages for a chat room
  static async getMessages(roomId: string, limitCount: number = 50): Promise<ChatMessage[]> {
    try {
      const currentUserId = this.validateAuth();
      
      // Verify user is a participant in the chat room
      const chatRoom = await this.getChatRoom(roomId);
      if (!chatRoom) {
        throw new ValidationError('Chat room not found');
      }
      
      if (!this.isUserParticipant(chatRoom, currentUserId)) {
        throw new PermissionError('You are not a participant in this chat room');
      }
      
      // Query messages from subcollection
      const q = query(
        collection(db, CHAT_ROOMS_COLLECTION, roomId, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const message = { id: doc.id, ...data } as ChatMessage;
        
        // Safely convert timestamps
        if (message.timestamp) {
          message.timestamp = toDate(message.timestamp) || message.timestamp;
        }
        if (message.createdAt) {
          message.createdAt = toDate(message.createdAt) || message.createdAt;
        }
        
        return message;
      });
      
      // Return messages in chronological order (oldest first)
      return messages.reverse();
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting messages:', error);
      }
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError('Failed to get messages', 'GET_MESSAGES_ERROR');
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(roomId: string): Promise<void> {
    try {
      const currentUserId = this.validateAuth();
      
      // Verify user is a participant in the chat room
      const chatRoom = await this.getChatRoom(roomId);
      if (!chatRoom) {
        throw new ValidationError('Chat room not found');
      }
      
      if (!this.isUserParticipant(chatRoom, currentUserId)) {
        throw new PermissionError('You are not a participant in this chat room');
      }
      
      // Get unread messages in the room (from subcollection)
      const q = query(
        collection(db, CHAT_ROOMS_COLLECTION, roomId, 'messages'),
        and(
          where('senderId', '!=', currentUserId),
          where('isRead', '==', false)
        )
      );

      const querySnapshot = await getDocs(q);
      
      // Mark each message as read
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { 
          isRead: true,
          readAt: serverTimestamp() 
        })
      );
      
      await Promise.all(updatePromises);
      
      // Reset unread count for this user in the chat room
      const chatRoomRef = doc(db, CHAT_ROOMS_COLLECTION, roomId);
      await updateDoc(chatRoomRef, {
        [`unreadCount.${currentUserId}`]: 0
      });
    } catch (error) {
      if (__DEV__) {
        console.error('Error marking messages as read:', error);
      }
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError('Failed to mark messages as read', 'MARK_READ_ERROR');
    }
  }

  // Delete a message (soft delete)
  static async deleteMessage(roomId: string, messageId: string): Promise<void> {
    try {
      const currentUserId = this.validateAuth();
      
      // Get the message to verify ownership
      const messageRef = doc(db, CHAT_ROOMS_COLLECTION, roomId, 'messages', messageId);
      const messageSnap = await getDoc(messageRef);
      
      if (!messageSnap.exists()) {
        throw new ValidationError('Message not found');
      }
      
      const message = messageSnap.data() as ChatMessage;
      if (message.senderId !== currentUserId) {
        throw new PermissionError('You can only delete your own messages');
      }
      
      // Soft delete by updating the message
      await updateDoc(messageRef, {
        content: 'This message was deleted',
        deleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: currentUserId
      });
    } catch (error) {
      if (__DEV__) {
        console.error('Error deleting message:', error);
      }
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError('Failed to delete message', 'DELETE_MESSAGE_ERROR');
    }
  }

  // Listen to messages in real-time
  static subscribeToMessages(roomId: string, callback: (messages: ChatMessage[]) => void): () => void {
    try {
      const currentUserId = this.validateAuth();
      
      // Note: We can't verify participation here since this is synchronous
      // The security rules will handle access control
      
      const q = query(
        collection(db, CHAT_ROOMS_COLLECTION, roomId, 'messages'),
        orderBy('timestamp', 'asc')
      );
      
      return onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const message = { id: doc.id, ...data } as ChatMessage;
          
          // Safely convert timestamps
          if (message.timestamp) {
            message.timestamp = toDate(message.timestamp) || message.timestamp;
          }
          if (message.createdAt) {
            message.createdAt = toDate(message.createdAt) || message.createdAt;
          }
          
          return message;
        });
        callback(messages);
      }, (error) => {
        if (__DEV__) {
          console.error('Error listening to messages:', error);
        }
        callback([]);
      });
    } catch (error) {
      if (__DEV__) {
        console.error('Error setting up message subscription:', error);
      }
      // Return empty unsubscribe function
      return () => {};
    }
  }

  // Listen to chat rooms in real-time
  static subscribeToUserChatRooms(userId: string, callback: (chatRooms: ChatRoom[]) => void): () => void {
    try {
      const currentUserId = this.validateAuth();
      
      // Verify the userId matches the current user
      if (currentUserId !== userId) {
        if (__DEV__) {
          console.log('User ID mismatch, returning empty subscription');
        }
        callback([]);
        return () => {};
      }

      const q = query(
        collection(db, CHAT_ROOMS_COLLECTION),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      return onSnapshot(q, (querySnapshot) => {
        const chatRooms = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const chatRoom = { id: doc.id, ...data } as ChatRoom;
          
          // Safely convert timestamps
          if (chatRoom.createdAt) {
            chatRoom.createdAt = toDate(chatRoom.createdAt) || chatRoom.createdAt;
          }
          if (chatRoom.updatedAt) {
            chatRoom.updatedAt = toDate(chatRoom.updatedAt) || chatRoom.updatedAt;
          }
          if (chatRoom.lastMessageTime) {
            chatRoom.lastMessageTime = toDate(chatRoom.lastMessageTime) || chatRoom.lastMessageTime;
          }
          
          return chatRoom;
        });
        callback(chatRooms);
      }, (error) => {
        if (__DEV__) {
          console.error('Error listening to chat rooms:', error);
        }
        callback([]);
      });
    } catch (error) {
      if (__DEV__) {
        console.error('Error setting up chat rooms subscription:', error);
      }
      callback([]);
      return () => {};
    }
  }

  // Get unread message count for user
  static async getUnreadMessageCount(userId?: string): Promise<number> {
    try {
      const currentUserId = this.validateAuth();
      const targetUserId = userId || currentUserId;
      
      if (targetUserId !== currentUserId) {
        throw new PermissionError('You can only check your own unread message count');
      }
      
      const chatRooms = await this.getUserChatRooms(targetUserId);
      return chatRooms.reduce((total, room) => {
        return total + (room.unreadCount?.[targetUserId] || 0);
      }, 0);
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting unread message count:', error);
      }
      return 0;
    }
  }

  // Block/Unblock user in chat
  static async toggleBlockUser(roomId: string, targetUserId: string, block: boolean): Promise<void> {
    try {
      const currentUserId = this.validateAuth();
      
      const chatRoomRef = doc(db, CHAT_ROOMS_COLLECTION, roomId);
      const chatRoom = await getDoc(chatRoomRef);
      
      if (!chatRoom.exists()) {
        throw new ValidationError('Chat room not found');
      }
      
      const roomData = chatRoom.data() as ChatRoom;
      
      // Verify user is a participant
      if (!this.isUserParticipant(roomData, currentUserId)) {
        throw new PermissionError('You are not a participant in this chat room');
      }
      
      // Verify target user is a participant
      if (!this.isUserParticipant(roomData, targetUserId)) {
        throw new ValidationError('Target user is not a participant in this chat room');
      }
      
      const blockedUsers = roomData.blockedUsers || [];
      
      if (block && !blockedUsers.includes(targetUserId)) {
        await updateDoc(chatRoomRef, {
          blockedUsers: arrayUnion(targetUserId),
          updatedAt: serverTimestamp()
        });
      } else if (!block && blockedUsers.includes(targetUserId)) {
        await updateDoc(chatRoomRef, {
          blockedUsers: arrayRemove(targetUserId),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error toggling block user:', error);
      }
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError('Failed to toggle block user', 'TOGGLE_BLOCK_ERROR');
    }
  }
  
  // Join a chat room
  static async joinChatRoom(roomId: string): Promise<void> {
    try {
      const currentUserId = this.validateAuth();
      
      const chatRoomRef = doc(db, CHAT_ROOMS_COLLECTION, roomId);
      const chatRoom = await getDoc(chatRoomRef);
      
      if (!chatRoom.exists()) {
        throw new ValidationError('Chat room not found');
      }
      
      const roomData = chatRoom.data() as ChatRoom;
      
      // Check if user is already a participant
      if (this.isUserParticipant(roomData, currentUserId)) {
        if (__DEV__) {
          console.log('User is already a participant in this room');
        }
        return;
      }
      
      // Add user to participants array
      await updateDoc(chatRoomRef, {
        participants: arrayUnion(currentUserId),
        updatedAt: serverTimestamp(),
        [`unreadCount.${currentUserId}`]: 0
      });
      
      if (__DEV__) {
        console.log(`User ${currentUserId} joined chat room ${roomId}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error joining chat room:', error);
      }
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError('Failed to join chat room', 'JOIN_ROOM_ERROR');
    }
  }
  
  // Leave a chat room
  static async leaveChatRoom(roomId: string): Promise<void> {
    try {
      const currentUserId = this.validateAuth();
      
      const chatRoomRef = doc(db, CHAT_ROOMS_COLLECTION, roomId);
      const chatRoom = await getDoc(chatRoomRef);
      
      if (!chatRoom.exists()) {
        throw new ValidationError('Chat room not found');
      }
      
      const roomData = chatRoom.data() as ChatRoom;
      
      // Check if user is a participant
      if (!this.isUserParticipant(roomData, currentUserId)) {
        if (__DEV__) {
          console.log('User is not a participant in this room');
        }
        return;
      }
      
      // Remove user from participants array
      const updateData: any = {
        participants: arrayRemove(currentUserId),
        updatedAt: serverTimestamp()
      };
      
      // Remove user's unread count
      updateData[`unreadCount.${currentUserId}`] = 0;
      
      await updateDoc(chatRoomRef, updateData);
      
      if (__DEV__) {
        console.log(`User ${currentUserId} left chat room ${roomId}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error leaving chat room:', error);
      }
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError('Failed to leave chat room', 'LEAVE_ROOM_ERROR');
    }
  }
  
  // Get chat room member count
  static async getRoomMemberCount(roomId: string): Promise<number> {
    try {
      const chatRoom = await this.getChatRoom(roomId);
      return chatRoom ? (chatRoom.participants?.length || 0) : 0;
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting room member count:', error);
      }
      return 0;
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
export const joinChatRoom = ChatService.joinChatRoom;
export const leaveChatRoom = ChatService.leaveChatRoom;
export const getRoomMemberCount = ChatService.getRoomMemberCount;
export const deleteMessage = ChatService.deleteMessage;
export const getUnreadMessageCount = ChatService.getUnreadMessageCount;

// Export error types
export { ChatServiceError, AuthenticationError, PermissionError, ValidationError };

// Export the service instance for backward compatibility
export const chatService = ChatService;

// Default export
export default ChatService;