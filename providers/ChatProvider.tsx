import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onSnapshot, query, where, orderBy, collection } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from './AuthProvider';
import { ChatRoom, ChatMessage, Notification } from '../types';
import { chatService } from '../services/chatService';
import { notificationService } from '../services/notificationService';

interface ChatContextType {
  // Chat Rooms
  chatRooms: ChatRoom[];
  activeChatRoom: ChatRoom | null;
  setActiveChatRoom: (room: ChatRoom | null) => void;
  
  // Messages
  messages: { [roomId: string]: ChatMessage[] };
  
  // Notifications
  notifications: Notification[];
  unreadNotificationCount: number;
  
  // Real-time status
  isConnected: boolean;
  
  // Actions
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  sendMessage: (roomId: string, content: string, type?: 'text' | 'image' | 'emoji') => Promise<void>;
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
  const [messages, setMessages] = useState<{ [roomId: string]: ChatMessage[] }>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Subscribe to user's chat rooms
  useEffect(() => {
    if (!user?.id) {
      setChatRooms([]);
      setMessages({});
      setNotifications([]);
      setIsConnected(false);
      return;
    }

    setIsConnected(true);

    // Subscribe to chat rooms where user is a participant
    const chatRoomsQuery = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', user.id),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribeChatRooms = onSnapshot(
      chatRoomsQuery,
      (snapshot) => {
        const rooms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChatRoom[];
        setChatRooms(rooms);
      },
      (error) => {
        console.error('Error listening to chat rooms:', error);
        setIsConnected(false);
      }
    );

    // Subscribe to user's notifications
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeNotifications = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const userNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Notification[];
        setNotifications(userNotifications);
      },
      (error) => {
        console.error('Error listening to notifications:', error);
      }
    );

    return () => {
      unsubscribeChatRooms();
      unsubscribeNotifications();
      setIsConnected(false);
    };
  }, [user?.id]);

  // Subscribe to messages for active chat room
  useEffect(() => {
    if (!activeChatRoom?.id || !user?.id) {
      return;
    }

    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatRoomId', '==', activeChatRoom.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribeMessages = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const roomMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChatMessage[];
        
        setMessages(prev => ({
          ...prev,
          [activeChatRoom.id]: roomMessages
        }));

        // Mark messages as read when they come in
        const unreadMessages = roomMessages.filter(
          msg => msg.senderId !== user.id && !msg.readBy?.includes(user.id)
        );
        
        if (unreadMessages.length > 0) {
          unreadMessages.forEach(msg => {
            chatService.markMessagesAsRead(msg.roomId, user.id).catch(console.error);
          });
        }
      },
      (error) => {
        console.error('Error listening to messages:', error);
      }
    );

    return () => {
      unsubscribeMessages();
    };
  }, [activeChatRoom?.id, user?.id]);

  // Actions
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => notificationService.markAsRead(n.id))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const sendMessage = async (roomId: string, content: string, type: 'text' | 'image' | 'emoji' = 'text') => {
    if (!user?.id) return;
    
    try {
      await chatService.sendMessage(roomId, user.id, content, type);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Computed values
  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const value: ChatContextType = {
    chatRooms,
    messages,
    sendMessage
  } as ChatContextType;

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;