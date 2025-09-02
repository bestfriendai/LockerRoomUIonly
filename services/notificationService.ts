import {
  View
} from 'react-native';
import logger from '../utils/logger';
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
  and
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Notification } from '../types';

const NOTIFICATIONS_COLLECTION = 'notifications';
const USER_SETTINGS_COLLECTION = 'userSettings';

export type NotificationType = 
  | 'new_message' 
  | 'new_review' 
  | 'review_like' 
  | 'review_comment' 
  | 'profile_view' 
  | 'match' 
  | 'system';

export interface NotificationSettings {
  newMessages: boolean;
  newReviews: boolean;
  reviewLikes: boolean;
  reviewComments: boolean;
  profileViews: boolean;
  matches: boolean;
  systemNotifications: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
}

export class NotificationService {
  // Create a new notification
  static async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any
  ): Promise<string> {
    try {
      const notificationRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
      const notification: Notification = {
        id: notificationRef.id,
        userId,
        type,
        title,
        message,
        data: data || {},
        isRead: false,
        createdAt: Timestamp.now()
      };
      
      await setDoc(notificationRef, notification);
      return notificationRef.id;
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error creating notification:', error);
      }
      throw error;
    }
  }

  // Get notifications for a user
  static async getUserNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error getting user notifications:', error);
      }
      throw error;
    }
  }

  // Get unread notifications count
  static async getUnreadNotificationsCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        and(
          where('userId', '==', userId),
          where('isRead', '==', false)
        )
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error getting unread notifications count:', error);
      }
      return 0;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: Timestamp.now()
      });
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error marking notification as read:', error);
      }
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        and(
          where('userId', '==', userId),
          where('isRead', '==', false)
        )
      );

      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          isRead: true,
          readAt: Timestamp.now()
        })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error marking all notifications as read:', error);
      }
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error deleting notification:', error);
      }
      throw error;
    }
  }

  // Delete all notifications for a user
  static async deleteAllNotifications(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deletePromises);
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error deleting all notifications:', error);
      }
      throw error;
    }
  }

  // Listen to notifications in real-time
  static subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      callback(notifications);
    }, (error) => {
      if (__DEV__) {
        __DEV__ && console.error('Error listening to notifications:', error);
      }
      callback([]);
    });
  }

  // Get notification settings for a user
  static async getNotificationSettings(userId: string): Promise<NotificationSettings> {
    try {
      const settingsRef = doc(db, USER_SETTINGS_COLLECTION, userId);
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        return settingsSnap.data().notifications as NotificationSettings;
      }
      
      // Return default settings if none exist
      return {
        newMessages: true,
        newReviews: true,
        reviewLikes: true,
        reviewComments: true,
        profileViews: true,
        matches: true,
        systemNotifications: true,
        pushNotifications: true,
        emailNotifications: false
      };
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error getting notification settings:', error);
      }
      throw error;
    }
  }

  // Update notification settings
  static async updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const settingsRef = doc(db, USER_SETTINGS_COLLECTION, userId);
      await setDoc(settingsRef, {
        notifications: settings,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error updating notification settings:', error);
      }
      throw error;
    }
  }

  // Helper methods for specific notification types
  static async notifyNewMessage(recipientId: string, senderName: string, message: string): Promise<void> {
    const settings = await this.getNotificationSettings(recipientId);
    if (settings.newMessages) {
      await this.createNotification(
        recipientId,
        'new_message',
        'New Message',
        `${senderName}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
        { senderName }
      );
    }
  }

  static async notifyNewReview(targetUserId: string, reviewerName: string): Promise<void> {
    const settings = await this.getNotificationSettings(targetUserId);
    if (settings.newReviews) {
      await this.createNotification(
        targetUserId,
        'new_review',
        'New Review',
        `${reviewerName} left you a review`,
        { reviewerName }
      );
    }
  }

  static async notifyReviewLike(reviewAuthorId: string, likerName: string): Promise<void> {
    const settings = await this.getNotificationSettings(reviewAuthorId);
    if (settings.reviewLikes) {
      await this.createNotification(
        reviewAuthorId,
        'review_like',
        'Review Liked',
        `${likerName} liked your review`,
        { likerName }
      );
    }
  }

  static async notifyReviewComment(reviewAuthorId: string, commenterName: string, comment: string): Promise<void> {
    const settings = await this.getNotificationSettings(reviewAuthorId);
    if (settings.reviewComments) {
      await this.createNotification(
        reviewAuthorId,
        'review_comment',
        'New Comment',
        `${commenterName} commented on your review: ${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}`,
        { commenterName, comment }
      );
    }
  }

  static async notifyProfileView(profileOwnerId: string, viewerName: string): Promise<void> {
    const settings = await this.getNotificationSettings(profileOwnerId);
    if (settings.profileViews) {
      await this.createNotification(
        profileOwnerId,
        'profile_view',
        'Profile View',
        `${viewerName} viewed your profile`,
        { viewerName }
      );
    }
  }

  static async notifyMatch(userId: string, matchName: string): Promise<void> {
    const settings = await this.getNotificationSettings(userId);
    if (settings.matches) {
      await this.createNotification(
        userId,
        'match',
        'New Match!',
        `You have a new match with ${matchName}`,
        { matchName }
      );
    }
  }

  static async notifySystem(userId: string, title: string, message: string, data?: unknown): Promise<void> {
    const settings = await this.getNotificationSettings(userId);
    if (settings.systemNotifications) {
      await this.createNotification(
        userId,
        'system',
        title,
        message,
        data
      );
    }
  }

  // Alias methods for compatibility with NotificationProvider
  static async getUserSettings(userId: string): Promise<NotificationSettings> {
    return this.getNotificationSettings(userId);
  }

  static async updateUserSettings(userId: string, settings: Partial<NotificationSettings>): Promise<void> {
    return this.updateNotificationSettings(userId, settings);
  }
}

// Export as default for easier importing
export const notificationService = NotificationService;
export default NotificationService;