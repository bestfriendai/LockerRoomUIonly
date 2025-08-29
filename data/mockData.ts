export interface User {
  id: string;
  _id?: string;
  name: string;
  email?: string;
  age: number;
  bio: string;
  photos: string[];
  location: string;
  verified: boolean;
  lastActive: string;
  _creationTime?: string;
  interests: string[];
  occupation?: string;
  education?: string;
  height?: string;
  relationshipGoals?: string;
  profileComplete?: boolean;
  reviewsCount?: number;
  matchesCount?: number;
  rating?: number;
  username?: string;
  profilePicture?: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  datingPreferences?: {
    ageRange: {
      min: number;
      max: number;
    };
    gender: string;
  };
}

export interface ReviewFlag {
  id: string;
  label: string;
  category: string;
  emoji: string;
  votes: number;
}

export interface Review {
  id: string;
  _id?: string;
  reviewerId: string;
  reviewedUserId: string;
  revieweeId?: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
  _creationTime?: string;
  isAnonymous: boolean;
  tags: string[];
  likes: number;
  likesCount?: number;
  isLiked?: boolean;
  reports: number;
  viewsCount?: number;
  platform?: string;
  media?: { url: string; type: 'image' | 'video' }[];
  categories?: string[];
  content?: string;
  location?: string;
  title?: string;
  // Additional properties for ReviewCard compatibility
  authorId?: string;
  authorName?: string;
  subjectName?: string;
  category?: string;
  comments?: number;
  greenFlags?: ReviewFlag[];
  redFlags?: ReviewFlag[];
  images?: string[];
  helpfulCount?: number;
  viewCount?: number;
}

import { ChatMessage } from '@/types';

export interface Chat {
  id: string;
  participants: string[];
  messages: ChatMessage[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'message' | 'review' | 'match' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUserId?: string;
  relatedId?: string;
}

export interface Comment {
  _id: string;
  id: string;
  userId: string;
  reviewId: string;
  content: string;
  timestamp: string;
  _creationTime?: string;
  likes: number;
  likesCount?: number;
  isLiked?: boolean;
  replies?: Comment[];
}

// Mock Users Data
export const mockComments: Comment[] = [
  {
    _id: '1',
    id: '1',
    userId: '1',
    reviewId: '1',
    content: 'Great review! Very helpful.',
    timestamp: '2024-01-15T10:30:00Z',
    _creationTime: '2024-01-15T10:30:00Z',
    likes: 5,
    likesCount: 5,
    isLiked: false,
  },
  {
    _id: '2',
    id: '2',
    userId: '2',
    reviewId: '1',
    content: 'Thanks for sharing your experience.',
    timestamp: '2024-01-15T11:00:00Z',
    _creationTime: '2024-01-15T11:00:00Z',
    likes: 2,
    likesCount: 2,
    isLiked: true,
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Emma Johnson',
    email: 'emma.johnson@example.com',
    age: 26,
    bio: 'Adventure seeker, coffee lover, and dog mom. Looking for someone to explore the city with! 🌟',
    photos: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20young%20woman%20smiling%20portrait%20professional%20photo&image_size=portrait_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=woman%20hiking%20mountains%20adventure%20outdoor&image_size=landscape_4_3'
    ],
    location: 'San Francisco, CA',
    verified: true,
    lastActive: '2024-01-15T10:30:00Z',
    interests: ['Hiking', 'Photography', 'Coffee', 'Travel', 'Dogs'],
    occupation: 'Marketing Manager',
    education: 'UC Berkeley',
    height: '5\'6"',
    relationshipGoals: 'Long-term relationship'
  },
  {
    id: '2',
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    age: 29,
    bio: 'Tech enthusiast by day, chef by night. Always up for trying new restaurants or cooking together! 👨‍🍳',
    photos: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=handsome%20asian%20man%20smiling%20professional%20portrait&image_size=portrait_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=man%20cooking%20kitchen%20chef%20apron&image_size=landscape_4_3'
    ],
    location: 'San Francisco, CA',
    verified: true,
    lastActive: '2024-01-15T09:15:00Z',
    interests: ['Cooking', 'Technology', 'Gaming', 'Food', 'Movies'],
    occupation: 'Software Engineer',
    education: 'Stanford University',
    height: '5\'10"',
    relationshipGoals: 'Dating to see what happens'
  },
  {
    id: '3',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    age: 24,
    bio: 'Yoga instructor and wellness enthusiast. Seeking mindful connections and positive vibes ✨',
    photos: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20woman%20yoga%20pose%20peaceful%20nature&image_size=portrait_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=woman%20meditation%20sunset%20beach%20wellness&image_size=landscape_4_3'
    ],
    location: 'Los Angeles, CA',
    verified: false,
    lastActive: '2024-01-14T18:45:00Z',
    interests: ['Yoga', 'Meditation', 'Health', 'Nature', 'Art'],
    occupation: 'Yoga Instructor',
    education: 'UCLA',
    height: '5\'4"',
    relationshipGoals: 'Serious relationship'
  },
  {
    id: '4',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@example.com',
    age: 31,
    bio: 'Fitness trainer and outdoor enthusiast. Love rock climbing and weekend adventures! 🧗‍♂️',
    photos: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=athletic%20man%20rock%20climbing%20outdoor%20adventure&image_size=portrait_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=man%20gym%20fitness%20trainer%20workout&image_size=landscape_4_3'
    ],
    location: 'Denver, CO',
    verified: true,
    lastActive: '2024-01-15T07:20:00Z',
    interests: ['Rock Climbing', 'Fitness', 'Hiking', 'Travel', 'Music'],
    occupation: 'Personal Trainer',
    education: 'Colorado State University',
    height: '6\'1"',
    relationshipGoals: 'Long-term relationship'
  },
  {
    id: '5',
    name: 'Jessica Park',
    email: 'jessica.park@example.com',
    age: 27,
    bio: 'Artist and creative soul. Love painting, museums, and deep conversations over wine 🎨',
    photos: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=artistic%20woman%20painting%20studio%20creative&image_size=portrait_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=woman%20art%20gallery%20museum%20culture&image_size=landscape_4_3'
    ],
    location: 'New York, NY',
    verified: true,
    lastActive: '2024-01-15T11:00:00Z',
    interests: ['Art', 'Painting', 'Museums', 'Wine', 'Literature'],
    occupation: 'Graphic Designer',
    education: 'Parsons School of Design',
    height: '5\'5"',
    relationshipGoals: 'Dating to see what happens'
  }
];

// Mock Reviews Data
export const mockReviews: Review[] = [
  {
    id: '1',
    reviewerId: '2',
    reviewedUserId: '1',
    rating: 5,
    comment: 'Emma is absolutely amazing! Great conversation, genuine personality, and such a fun date. Highly recommend! 🌟',
    photos: [],
    createdAt: '2024-01-10T14:30:00Z',
    isAnonymous: false,
    tags: ['Great Conversation', 'Genuine', 'Fun'],
    likes: 12,
    reports: 0
  },
  {
    id: '2',
    reviewerId: '3',
    reviewedUserId: '2',
    rating: 4,
    comment: 'Alex is a great cook and really sweet! Had an amazing dinner date. Just looking for different things right now.',
    photos: [],
    createdAt: '2024-01-08T19:15:00Z',
    isAnonymous: true,
    tags: ['Good Cook', 'Sweet', 'Different Goals'],
    likes: 8,
    reports: 0
  },
  {
    id: '3',
    reviewerId: '1',
    reviewedUserId: '4',
    rating: 5,
    comment: 'Michael is incredibly fit and adventurous! We went rock climbing and had such a blast. Definitely would date again!',
    photos: [],
    createdAt: '2024-01-12T16:45:00Z',
    isAnonymous: false,
    tags: ['Adventurous', 'Fit', 'Fun Date'],
    likes: 15,
    reports: 0
  },
  {
    id: '4',
    reviewerId: '4',
    reviewedUserId: '5',
    rating: 3,
    comment: 'Jessica is very artistic and intelligent, but we didn\'t have much chemistry. Still a nice person though.',
    photos: [],
    createdAt: '2024-01-09T20:30:00Z',
    isAnonymous: true,
    tags: ['Artistic', 'Intelligent', 'No Chemistry'],
    likes: 3,
    reports: 0
  },
  {
    id: '5',
    reviewerId: '5',
    reviewedUserId: '3',
    rating: 4,
    comment: 'Sarah has such positive energy and we had great yoga session together! Really peaceful and mindful person.',
    photos: [],
    createdAt: '2024-01-11T10:20:00Z',
    isAnonymous: false,
    tags: ['Positive Energy', 'Mindful', 'Peaceful'],
    likes: 9,
    reports: 0
  }
];

// Mock Chat Messages
export const mockChatMessages: ChatMessage[] = [
  {
    _id: '1',
    id: '1',
    senderId: '1',
    receiverId: '2',
    content: 'Hey Alex! Thanks for the great dinner last night 😊',
    _creationTime: '2024-01-15T09:30:00Z',
    timestamp: '2024-01-15T09:30:00Z',
    read: true,
    type: 'text'
  },
  {
    _id: '2',
    id: '2',
    senderId: '2',
    receiverId: '1',
    content: 'It was my pleasure Emma! I had such a great time. Would love to cook for you again sometime 👨‍🍳',
    _creationTime: '2024-01-15T09:45:00Z',
    timestamp: '2024-01-15T09:45:00Z',
    read: true,
    type: 'text'
  },
  {
    _id: '3',
    id: '3',
    senderId: '1',
    receiverId: '2',
    content: 'That sounds amazing! I\'m free this weekend if you want to plan something',
    _creationTime: '2024-01-15T10:00:00Z',
    timestamp: '2024-01-15T10:00:00Z',
    read: false,
    type: 'text'
  },
  {
    _id: '4',
    id: '4',
    senderId: '3',
    receiverId: '4',
    content: 'Hi Michael! Ready for our hiking adventure tomorrow? 🥾',
    _creationTime: '2024-01-14T18:30:00Z',
    timestamp: '2024-01-14T18:30:00Z',
    read: true,
    type: 'text'
  },
  {
    _id: '5',
    id: '5',
    senderId: '4',
    receiverId: '3',
    content: 'Absolutely! I\'ve got all the gear ready. It\'s going to be an amazing day! ⛰️',
    _creationTime: '2024-01-14T19:00:00Z',
    timestamp: '2024-01-14T19:00:00Z',
    read: true,
    type: 'text'
  }
];

// Mock Chats
export const mockChats: Chat[] = [
  {
    id: '1',
    participants: ['1', '2'],
    messages: mockChatMessages.filter(msg => 
      (msg.senderId === '1' && msg.receiverId === '2') || 
      (msg.senderId === '2' && msg.receiverId === '1')
    ),
    lastMessage: 'That sounds amazing! I\'m free this weekend if you want to plan something',
    lastMessageTime: '2024-01-15T10:00:00Z',
    unreadCount: 1
  },
  {
    id: '2',
    participants: ['3', '4'],
    messages: mockChatMessages.filter(msg => 
      (msg.senderId === '3' && msg.receiverId === '4') || 
      (msg.senderId === '4' && msg.receiverId === '3')
    ),
    lastMessage: 'Absolutely! I\'ve got all the gear ready. It\'s going to be an amazing day! ⛰️',
    lastMessageTime: '2024-01-14T19:00:00Z',
    unreadCount: 0
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'message',
    title: 'New Message',
    message: 'Alex sent you a message',
    timestamp: '2024-01-15T09:45:00Z',
    read: false,
    actionUserId: '2'
  },
  {
    id: '2',
    userId: '1',
    type: 'review',
    title: 'New Review',
    message: 'Someone left you a 5-star review!',
    timestamp: '2024-01-10T14:30:00Z',
    read: true,
    actionUserId: '2',
    relatedId: '1'
  },
  {
    id: '3',
    userId: '2',
    type: 'like',
    title: 'Profile Liked',
    message: 'Emma liked your profile',
    timestamp: '2024-01-09T16:20:00Z',
    read: true,
    actionUserId: '1'
  },
  {
    id: '4',
    userId: '3',
    type: 'match',
    title: 'New Match!',
    message: 'You and Michael are a match!',
    timestamp: '2024-01-08T12:15:00Z',
    read: true,
    actionUserId: '4'
  },
  {
    id: '5',
    userId: '1',
    type: 'system',
    title: 'Profile Verification',
    message: 'Your profile has been successfully verified!',
    timestamp: '2024-01-07T10:00:00Z',
    read: true
  }
];

// Mock Chat Rooms
export const mockChatRooms = [
  {
    _id: 'room1',
    name: 'San Francisco Dating',
    description: 'Connect with singles in the Bay Area',
    type: 'public' as const,
    createdBy: '1',
    memberIds: ['1', '2', '3'],
    memberCount: 3,
    lastMessage: {
      content: 'Anyone up for coffee this weekend?',
      timestamp: '2024-01-15T10:30:00Z',
      senderName: 'Emma',
      senderId: '1'
    },
    _creationTime: '2024-01-10T08:00:00Z',
    isActive: true,
    tags: ['dating', 'san-francisco']
  },
  {
    _id: 'room2',
    name: 'Hiking Buddies',
    description: 'Find hiking partners and outdoor adventures',
    type: 'public' as const,
    createdBy: '3',
    memberIds: ['3', '4', '5'],
    memberCount: 3,
    lastMessage: {
      content: 'Great hike today everyone!',
      timestamp: '2024-01-14T18:45:00Z',
      senderName: 'Sarah',
      senderId: '3'
    },
    _creationTime: '2024-01-08T12:00:00Z',
    isActive: true,
    tags: ['hiking', 'outdoors']
  },
  {
    _id: 'room3',
    name: 'Foodies Unite',
    description: 'Share restaurant recommendations and food experiences',
    type: 'public' as const,
    createdBy: '2',
    memberIds: ['1', '2', '4'],
    memberCount: 3,
    lastMessage: {
      content: 'Just tried that new sushi place - amazing!',
      timestamp: '2024-01-13T20:15:00Z',
      senderName: 'Alex',
      senderId: '2'
    },
    _creationTime: '2024-01-05T15:30:00Z',
    isActive: true,
    tags: ['food', 'restaurants']
  }
];

// Helper functions
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getReviewsForUser = (userId: string): Review[] => {
  return mockReviews.filter(review => review.reviewedUserId === userId);
};

export const getChatById = (chatId: string): Chat | undefined => {
  return mockChats.find(chat => chat.id === chatId);
};

export const getChatsForUser = (userId: string): Chat[] => {
  return mockChats.filter(chat => chat.participants.includes(userId));
};

export const getNotificationsForUser = (userId: string): Notification[] => {
  return mockNotifications.filter(notification => notification.userId === userId);
};

export const getUnreadNotificationsCount = (userId: string): number => {
  return mockNotifications.filter(notification => 
    notification.userId === userId && !notification.read
  ).length;
};

// Current user (for demo purposes)
export const currentUserId = '1';
export const currentUser = getUserById(currentUserId)!;