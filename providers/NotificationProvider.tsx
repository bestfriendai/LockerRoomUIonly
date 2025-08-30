import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onSnapshot, query, where, orderBy, collection } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from './AuthProvider';
import { Notification } from '../types';
import { notificationService } from '../services/notificationService';

interface NotificationContextType {
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Notification settings
  settings: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    newMessages: boolean;
    newReviews: boolean;
    newLikes: boolean;
    newComments: boolean;
    profileViews: boolean;
    matches: boolean;
    systemUpdates: boolean;
  };
  
  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>; // Added missing method
  deleteNotification: (notificationId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<NotificationContextType['settings']>) => Promise<void>;
  addNotification: (notification: any) => Promise<void>; // Added missing method

  // Real-time status
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

const defaultSettings = {
  pushEnabled: true,
  emailEnabled: true,
  newMessages: true,
  newReviews: true,
  newLikes: true,
  newComments: true,
  profileViews: false,
  matches: true,
  systemUpdates: true
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [isConnected, setIsConnected] = useState(false);

  // Subscribe to user's notifications
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setIsConnected(false);
      return;
    }

    setIsConnected(true);

    // Subscribe to notifications
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
        setIsConnected(false);
      }
    );

    // Load user notification settings
    const loadSettings = async () => {
      try {
        const userSettings = await notificationService.getUserSettings(user.id);
        if (userSettings) {
          setSettings({ ...defaultSettings, ...userSettings });
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };

    loadSettings();

    return () => {
      unsubscribeNotifications();
      setIsConnected(false);
    };
  }, [user?.id]);

  // Actions
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => notificationService.markAsRead(n.id))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationContextType['settings']>) => {
    if (!user?.id) return;
    
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await notificationService.updateUserSettings(user.id, updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  };

  // Computed values
  const unreadCount = notifications.filter(n => !n.read).length;

  const clearAllNotifications = async () => {
    try {
      setNotifications([]);
      // In a real implementation, you would also clear from Firestore
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    settings,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    deleteNotification,
    updateSettings,
    isConnected,
    addNotification: async (notification: any) => {
      // Placeholder implementation
      console.log('Adding notification:', notification);
    }
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;