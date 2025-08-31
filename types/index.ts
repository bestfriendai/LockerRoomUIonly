import { Timestamp } from 'firebase/firestore';

export interface ChatRoom {
  id: string;
  _id?: string; // For compatibility with existing code
  participants: string[];
  memberIds?: string[]; // Alternative property name used in code
  createdAt: Timestamp | Date | number; // Firestore Timestamp
  updatedAt: Timestamp | Date | number; // Firestore Timestamp
  _creationTime?: Timestamp | Date | number; // Alternative timestamp property
  lastMessage: ChatMessage | string | null; // Can be either a ChatMessage object or string
  lastMessageTime: Timestamp | Date | number | null; // Firestore Timestamp
  unreadCount?: {
    [userId: string]: number;
  };
  blockedUsers?: string[];
  isActive?: boolean;
  name?: string;
  description?: string;
  type?: 'direct' | 'group' | 'public' | 'private'; // Added 'private' type
  createdBy?: string;
  memberCount?: number;
}

export interface ChatMessage {
  id: string;
  _id?: string; // For compatibility with existing code
  roomId: string;
  chatRoomId?: string; // Alternative property name
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'emoji' | 'file';
  type?: 'text' | 'image' | 'emoji' | 'file'; // Alternative property name for compatibility
  timestamp: Timestamp | Date | number; // Firestore Timestamp
  _creationTime?: Timestamp | Date | number; // Alternative timestamp property
  isRead: boolean;
  read?: boolean; // Alternative property name for compatibility
  isDelivered: boolean;
  readBy?: string[]; // Users who have read this message
  receiverId?: string; // For direct messages
  senderName?: string; // Sender display name
}

export interface User {
  id: string;
  _id?: string; // For compatibility with existing code
  name: string;
  username?: string;
  displayName?: string;
  email: string;
  profilePicture?: string;
  photoURL?: string; // Alternative property name
  photos?: string[];
  age?: number;
  location?: string;
  bio?: string;
  interests?: string[];
  occupation?: string;
  education?: string;
  height?: string;
  relationshipGoals?: string;
  verified?: boolean;
  profileComplete?: boolean;
  lastSeen?: Timestamp | Date | number; // Firestore Timestamp
  lastActive?: Timestamp | Date | number; // Alternative property name
  isOnline?: boolean;
  isActive?: boolean;
  createdAt?: Timestamp | Date | number; // Firestore Timestamp
  updatedAt?: Timestamp | Date | number; // Firestore Timestamp
  _creationTime?: Timestamp | Date | number; // Alternative timestamp property
  reviewsCount?: number;
  matchesCount?: number;
  rating?: number;
  gender?: string;
  phone?: string;
  datingPreferences?: {
    ageRange?: [number, number] | { min: number; max: number };
    min?: number; // For backward compatibility
    max?: number; // For backward compatibility
    maxDistance?: number;
    interestedIn?: string[];
    gender?: string;
  };
  // Anonymous user specific fields
  isAnonymous?: boolean;
  reputationScore?: number;
  reviewCount?: number;
  helpfulVotes?: number;
  badges?: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
    earnedAt: Timestamp | Date | number; // Firestore Timestamp
  }>;
}

export interface Review {
  id: string;
  _id?: string; // For compatibility with existing code
  authorId: string;
  reviewerId?: string; // Alternative property name
  targetUserId: string;
  reviewedUserId?: string; // Alternative property name
  userId: string; // Made required since it's used extensively in mockData
  rating: number;
  content: string;
  comment?: string; // Alternative property name
  title?: string;
  createdAt: Timestamp | Date | number; // Firestore Timestamp
  updatedAt: Timestamp | Date | number; // Firestore Timestamp
  timestamp?: Timestamp | Date | number; // Alternative timestamp property
  _creationTime?: Timestamp | Date | number; // Another alternative timestamp property
  likes: number;
  helpfulCount?: number; // Alternative property name
  likedBy?: string[];
  comments: string[]; // Array of comment IDs
  isAnonymous?: boolean;
  category?: string;
  categories?: string[]; // Alternative property name
  media?: string[];
  images?: string[]; // Alternative property name
  platform?: string;
  location?: string;
  tags?: string[];
  author?: {
    username: string;
    isVerified: boolean;
  };
  // Additional properties used in mockData
  personName?: string;
  photos?: string[];
}

export interface Comment {
  id: string;
  reviewId: string;
  authorId: string;
  userId?: string; // Alternative property name
  content: string;
  createdAt: Timestamp | Date | number; // Firestore Timestamp
  timestamp?: Timestamp | Date | number; // Alternative timestamp property
  _creationTime?: Timestamp | Date | number; // Another alternative timestamp property
  likes?: number;
  likesCount?: number; // Alternative property name
  likedBy?: string[];
  isLiked?: boolean; // Whether current user has liked this comment
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>; // More specific than any
  isRead: boolean;
  read?: boolean; // Alternative property name
  createdAt: Timestamp | Date | number; // Firestore Timestamp
  readAt?: Timestamp | Date | number; // Firestore Timestamp
  timestamp?: Timestamp | Date | number; // Alternative timestamp property
}

// Context types for providers
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: Partial<User> & { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>; // Required since it's being used
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  demoLogin: () => Promise<void>; // Required since it's being used
}

export interface ChatContextType {
  chatRooms: ChatRoom[];
  messages: ChatMessage[];
  users?: User[]; // Made optional to match provider implementation
  isLoading?: boolean; // Made optional to match provider implementation
  sendMessage: (roomId: string, content: string) => Promise<void>;
  createChatRoom?: (participants: string[]) => Promise<ChatRoom>; // Made optional
  joinChatRoom?: (roomId: string) => Promise<void>; // Made optional
  leaveChatRoom?: (roomId: string) => Promise<void>; // Made optional
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>; // Required since it's being used
  addNotification: (notification: Partial<Notification>) => Promise<void>; // More specific type
}

// Export Message type alias for compatibility
export type Message = ChatMessage;

// Connection state interface for network status
export interface ConnectionState {
  isConnected: boolean;
  isOffline: boolean;
  isSlowConnection: boolean;
  networkStatus: 'online' | 'offline' | 'slow';
  lastPing?: number;
  error?: string | null;
}