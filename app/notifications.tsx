import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl
} from 'react-native';

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Bell, Heart, MessageCircle, Star, Trash2, MoreHorizontal } from "lucide-react-native";
import { useTheme } from "../providers/ThemeProvider";
import { useAuth } from "../providers/AuthProvider";
import { useNotifications } from "../providers/NotificationProvider";
import { Button } from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Card from "../components/ui/Card";
import { getUserById } from "../services/userService";

type NotificationType = 'message' | 'review' | 'match' | 'like' | 'comment' | 'system';

interface LocalNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: any;
  read: boolean;
  userId?: string;
  reviewId?: string;
  chatRoomId?: string;
  actionUrl?: string;
}



interface NotificationItemProps {
  notification: LocalNotification;
  onPress: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

function NotificationItem({ notification, onPress, onMarkAsRead, onDelete }: NotificationItemProps) {
  const { colors } = useTheme();
  const [showActions, setShowActions] = useState(false);
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    if (notification.userId) {
      getUserById(notification.userId)
        .then(userData => setUser(userData))
        .catch(error => __DEV__ && console.error('Error fetching user:', error));
    }
  }, [notification.userId]);

  const getNotificationIcon = () => {
    const iconProps = { size: 20, strokeWidth: 1.5 };
    
    switch (notification.type) {
      case 'message':
        return <MessageCircle {...iconProps} color={colors.primary} />;
      case 'review':
        return <Star {...iconProps} color={colors.warning} />;
      case 'match':
        return <Heart {...iconProps} color={colors.error} />;
      case 'like':
        return <Heart {...iconProps} color={colors.primary} />;
      case 'comment':
        return <MessageCircle {...iconProps} color={colors.success} />;
      case 'system':
        return <Bell {...iconProps} color={colors.textSecondary} />;
      default:
        return <Bell {...iconProps} color={colors.textSecondary} />;
    }
  };

  const formatTimestamp = (timestamp: any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp as any);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          backgroundColor: notification.read ? colors.card : colors.primary + '10',
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        {/* Avatar or Icon */}
        <View style={styles.notificationAvatar}>
          {user ? (
            <Avatar
              size="sm"
              name={user.username}
              isAnonymous={true}
            />
          ) : (
            <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
              {getNotificationIcon()}
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.notificationText}>
          <View style={styles.notificationHeader}>
            <Text style={{
                color: notification.read ? colors.text : colors.primary,
                flex: 1,
              }}
            >
              {notification.title}
            </Text>
            <Text style={{ color: colors.textSecondary }}>
              {formatTimestamp(notification.timestamp)}
            </Text>
          </View>
          
          <Text style={{
              color: colors.textSecondary,
              marginTop: 2,
              lineHeight: 16,
            }}
            numberOfLines={2}
          >
            {(notification as any)?.message}
          </Text>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.actionsButton}
          onPress={() => setShowActions(!showActions)}
        >
          <MoreHorizontal size={16} color={colors.textSecondary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Action Menu */}
      {showActions && (
        <View style={[styles.actionsMenu, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {!notification.read && (
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                onMarkAsRead();
                setShowActions(false);
              }}
            >
              <Bell size={16} color={colors.text} strokeWidth={1.5} />
              <Text style={{ marginLeft: 8 }}>
                Mark as read
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => {
              onDelete();
              setShowActions(false);
            }}
          >
            <Trash2 size={16} color={colors.error} strokeWidth={1.5} />
            <Text style={{ marginLeft: 8, color: colors.error }}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Unread Indicator */}
      {!notification.read && (
        <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, tokens, isDark } = useTheme();
  const { user } = useAuth();
  const { notifications, markAsRead, deleteNotification, markAllAsRead, clearAllNotifications } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Handlers
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Notifications are automatically updated via real-time listeners
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  const handleNotificationPress = useCallback((notification: LocalNotification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'message':
        if (notification.chatRoomId) {
          router.push(`/chat/${notification.chatRoomId}`);
        }
        break;
      case 'review':
      case 'like':
      case 'comment':
        if (notification.reviewId) {
          router.push(`/review/${notification.reviewId}`);
        }
        break;
      case 'match':
        if (notification.userId) {
          router.push(`/profile/${notification.userId}`);
        }
        break;
      default:
        // Handle other notification types
        break;
    }
  }, [router, markAsRead]);

  const handleMarkAsRead = useCallback((notificationId: string) => {
    markAsRead(notificationId);
  }, [markAsRead]);

  const handleDelete = useCallback((notificationId: string) => {
    deleteNotification(notificationId);
  }, [deleteNotification]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const handleClearAll = useCallback(() => {
    clearAllNotifications();
  }, [clearAllNotifications]);

  // Computed values
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => filter === 'all' || !n.read);
  }, [notifications, filter]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          size="sm"
          onPress={handleBack}
          leftIcon={<ArrowLeft size={20} color={colors.text} strokeWidth={1.5} />}
        />
        <Text >
          Notifications
        </Text>
        <Button
          size="sm"
          onPress={handleMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          <Text style={{
              color: unreadCount > 0 ? colors.primary : colors.textSecondary,
            }}
          >
            Mark all read
          </Text>
        </Button>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <Button
          variant={filter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onPress={() => setFilter('all')}
          style={styles.filterButton}
        >
          <Text style={{
              color: filter === 'all' ? colors.background : colors.text,
            }}
          >
            All ({notifications.length})
          </Text>
        </Button>
        
        <Button
          variant={filter === 'unread' ? 'primary' : 'ghost'}
          size="sm"
          onPress={() => setFilter('unread')}
          style={styles.filterButton}
        >
          <Text style={{
              color: filter === 'unread' ? colors.background : colors.text,
            }}
          >
            Unread ({unreadCount})
          </Text>
        </Button>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {filteredNotifications.length > 0 ? (
          <>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification as LocalNotification}
                onPress={() => handleNotificationPress(notification as LocalNotification)}
                onMarkAsRead={() => handleMarkAsRead(notification.id)}
                onDelete={() => handleDelete(notification.id)}
              />
            ))}
            
            {/* Clear All Button */}
            {notifications.length > 0 && (
              <Button
                onPress={handleClearAll}
                style={styles.clearAllButton}
              >
                <Text >
                  Clear All Notifications
                </Text>
              </Button>
            )}
          </>
        ) : (
          /* Empty State */
          <Card style={styles.emptyState}>
            <Bell size={48} color={colors.textSecondary} strokeWidth={1} />
            <Text style={{ marginTop: 16, textAlign: 'center' }}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </Text>
            <Text style={{
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: 8,
                lineHeight: 20,
              }}
            >
              {filter === 'unread'
                ? 'All caught up! Check back later for new notifications.'
                : 'You\'ll see notifications about messages, reviews, and matches here.'}
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionItem: {
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: 120,
    padding: 12,
  },
  actionsButton: {
    marginLeft: 8,
    padding: 4,
  },
  actionsMenu: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 3,
    position: 'absolute',
    right: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    top: 50,
    zIndex: 1,
  },
  clearAllButton: {
    marginTop: 24,
  },
  container: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 32,
    padding: 32,
  },
  filterButton: {
    paddingHorizontal: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  notificationAvatar: {
    marginRight: 12,
  },
  notificationContent: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    padding: 16,
  },
  notificationHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationItem: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  notificationText: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  scrollView: {
    flex: 1,
  },
  unreadIndicator: {
    borderRadius: 4,
    height: 8,
    position: 'absolute',
    right: 12,
    top: 12,
    width: 8,
  },
});