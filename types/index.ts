export interface ChatRoom {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  type: 'public' | 'private';
  createdBy: string;
  memberIds?: string[];
  memberCount?: number;
  lastMessage?: {
    content: string;
    timestamp: string;
    senderName: string;
    senderId: string;
  };
  _creationTime: string;
  isActive?: boolean;
  tags?: string[];
}

export interface ChatMessage {
  _id: string;
  id?: string;
  senderId: string;
  receiverId?: string;
  chatRoomId?: string;
  content: string;
  _creationTime: string;
  timestamp?: string;
  read: boolean;
  type: 'text' | 'image' | 'emoji';
}

export interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  age?: number;
  location?: string;
  bio?: string;
  verified?: boolean;
  lastSeen?: string;
  isOnline?: boolean;
  _creationTime?: string;
}

export interface Review {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'user' | 'place' | 'event';
  rating: number;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  comments?: Comment[];
  media?: string[];
  verified?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}