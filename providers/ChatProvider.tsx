import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { query, where, orderBy, collection, FirestoreError, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from './AuthProvider';
import { ChatRoom, Message } from '../types';
import { chatService } from '../services/chatService';
import { subscribeToFirestore, ConnectionState, onFirestoreConnectionStateChange } from '../utils/firestoreConnectionManager';
import logger from '../utils/logger';

interface ChatContextType {
  // Chat rooms
  chatRooms: ChatRoom[];
  activeChatRoom: ChatRoom | null;
  
  // Messages for active chat
  messages: Message[];
  
  // Actions
  setActiveChatRoom: (chatRoom: ChatRoom | null) => void;
  sendMessage: (content: string, type?: 'text' | 'image' | 'emoji') => Promise<void>;
  markMessagesAsRead: (chatRoomId: string) => Promise<void>;
  
  // Status
  loading: boolean;
  isConnected: boolean;
  connectionState: ConnectionState;
  reconnect: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeChatRoom, setActiveChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: true,
    isOffline: false,
    isSlowConnection: false,
    networkStatus: 'online',
    lastPing: Date.now(),
    error: null
  });
  const mountedRef = useRef(true);

  // Clean up on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Subscribe to connection state changes
  useEffect(() => {
    const unsubscribeConnectionState = onFirestoreConnectionStateChange((state) => {
      setConnectionState(state);
      setIsConnected(state.isConnected && !state.isReconnecting);
      if (state.isReconnecting) {
        setLoading(true);
      }
    });

    return () => unsubscribeConnectionState();
  }, []);

  // Subscribe to user's chat rooms
  useEffect(() => {
    if (!user?.id) {
      setChatRooms([]);
      setMessages([]);
      setIsConnected(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to chat rooms where user is a participant
    const chatRoomsQuery = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', user.id),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribeChatRooms = subscribeToFirestore(
      `chatRooms-${user.id}`,
      chatRoomsQuery,
      (snapshot: any) => {
        if (!mountedRef.current) return;
        const rooms = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data()
        })) as ChatRoom[];
        setChatRooms(rooms);
        setLoading(false);
        setIsConnected(true);
      },
      (error: FirestoreError) => {
        if (__DEV__) {
          __DEV__ && console.error('Error listening to chat rooms:', error);
        }
        // Don't clear chat rooms on error, keep existing data
        if (mountedRef.current) {
          setIsConnected(false);
          setLoading(false);
        }
      },
      { maxRetries: 5, retryDelay: 2000 }
    );

    return () => {
      unsubscribeChatRooms();
      setIsConnected(false);
    };
  }, [user?.id]);

  // Subscribe to messages for active chat room
  useEffect(() => {
    if (!activeChatRoom?.id || !user?.id) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatRoomId', '==', activeChatRoom.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribeMessages = subscribeToFirestore(
      `messages-${activeChatRoom.id}`,
      messagesQuery,
      (snapshot: any) => {
        if (!mountedRef.current) return;
        const roomMessages = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        
        setMessages(roomMessages);

        // Mark messages as read when they come in
        const unreadMessages = roomMessages.filter(
          msg => msg.senderId !== user.id && !msg.readBy?.includes(user.id)
        );
        
        if (unreadMessages.length > 0 && mountedRef.current) {
          unreadMessages.forEach(() => {
            chatService.markMessagesAsRead(activeChatRoom.id, user.id).catch(console.error);
          });
        }
      },
      (error: FirestoreError) => {
        if (__DEV__) {
          __DEV__ && console.error('Error listening to messages:', error);
        }
        // Don't clear messages on error, keep existing data
      },
      { maxRetries: 3, retryDelay: 1000 }
    );

    return () => {
      unsubscribeMessages();
    };
  }, [activeChatRoom?.id, user?.id]);

  // Actions
  const sendMessage = async (content: string, type: 'text' | 'image' | 'emoji' = 'text') => {
    if (!user?.id || !activeChatRoom?.id) return;
    
    try {
      await chatService.sendMessage(activeChatRoom.id, user.id, content, type);
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error sending message:', error);
      }
      throw error;
    }
  };

  const markMessagesAsRead = async (chatRoomId: string) => {
    if (!user?.id) return;
    
    try {
      await chatService.markMessagesAsRead(chatRoomId, user.id);
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error marking messages as read:', error);
      }
      throw error;
    }
  };

  const reconnect = () => {
    // The connection manager will handle reconnection automatically
    if (__DEV__) {
      __DEV__ && console.log('Reconnecting chat...');
    }
  };

  const value: ChatContextType = {
    chatRooms,
    activeChatRoom,
    messages,
    setActiveChatRoom,
    sendMessage,
    markMessagesAsRead,
    loading,
    isConnected,
    connectionState,
    reconnect
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;