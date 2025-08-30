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
  userId: string; // Added missing userId property
  rating: number;
  comment?: string; // Made optional since not all reviews have comments
  photos?: string[];
  createdAt: string;
  updatedAt?: string; // Added missing updatedAt property
  _creationTime?: string;
  isAnonymous: boolean;
  tags: string[];
  likes: number;
  likesCount?: number;
  isLiked?: boolean;
  reports?: number; // Made optional since not all reviews have reports
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
  personName?: string; // Added missing personName property
  category?: string;
  comments?: number;
  greenFlags?: ReviewFlag[];
  redFlags?: ReviewFlag[];
  flags?: string[]; // Added missing flags property (accepts strings)
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
    timestamp: '2025-08-28T10:30:00Z',
    _creationTime: '2025-08-28T10:30:00Z',
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
    timestamp: '2025-08-28T11:00:00Z',
    _creationTime: '2025-08-28T11:00:00Z',
    likes: 2,
    likesCount: 2,
    isLiked: true,
  },
];

export const mockUsers: User[] = [
  // Women
  {
    id: '1',
    name: 'Emma Johnson',
    email: 'emma.johnson@example.com',
    age: 26,
    bio: 'Adventure seeker, coffee lover, and dog mom. Looking for someone to explore the city with! 🌟',
    photos: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20young%20woman%20smiling%20portrait%20natural%20lighting%20casual%20style&image_size=portrait_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=woman%20hiking%20mountains%20adventure%20outdoor%20backpack&image_size=landscape_4_3'
    ],
    location: 'San Francisco, CA',
    verified: true,
    lastActive: '2025-08-28T10:30:00Z',
    interests: ['Hiking', 'Photography', 'Coffee', 'Travel', 'Dogs'],
    occupation: 'Marketing Manager',
    education: 'UC Berkeley',
    height: '5\'6"',
    relationshipGoals: 'Long-term relationship'
  },
  {
    id: '3',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    age: 24,
    bio: 'Yoga instructor and wellness enthusiast. Seeking mindful connections and positive vibes ✨',
    photos: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20woman%20yoga%20pose%20peaceful%20nature%20serene%20expression&image_size=portrait_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=woman%20meditation%20sunset%20beach%20wellness%20mindful&image_size=landscape_4_3'
    ],
    location: 'Los Angeles, CA',
    verified: false,
    lastActive: '2025-08-27T18:45:00Z',
    interests: ['Yoga', 'Meditation', 'Health', 'Nature', 'Art'],
    occupation: 'Yoga Instructor',
    education: 'UCLA',
    height: '5\'4"',
    relationshipGoals: 'Serious relationship'
  },
  {
    id: '5',
    name: 'Jessica Park',
    email: 'jessica.park@example.com',
    age: 27,
    bio: 'Artist and creative soul. Love painting, museums, and deep conversations over wine 🎨',
    photos: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=artistic%20woman%20painting%20studio%20creative%20bohemian%20style&image_size=portrait_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=woman%20art%20gallery%20museum%20culture%20sophisticated&image_size=landscape_4_3'
    ],
    location: 'New York, NY',
    verified: true,
    lastActive: '2025-08-28T11:00:00Z',
    interests: ['Art', 'Painting', 'Museums', 'Wine', 'Literature'],
    occupation: 'Graphic Designer',
    education: 'Parsons School of Design',
    height: '5\'5"',
    relationshipGoals: 'Dating to see what happens'
  },
  {
    id: '7',
    name: 'Maya Patel',
    email: 'maya.patel@example.com',
    age: 28,
    bio: 'Doctor by day, dancer by night. Love salsa, good food, and meaningful conversations 💃',
    photos: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20indian%20woman%20doctor%20professional%20confident%20smile&image_size=portrait_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=woman%20salsa%20dancing%20elegant%20dress%20graceful%20movement&image_size=landscape_4_3'
    ],
    location: 'Chicago, IL',
    verified: true,
    lastActive: '2025-08-28T08:20:00Z',
    interests: ['Dancing', 'Medicine', 'Travel', 'Food', 'Music'],
    occupation: 'Emergency Physician',
    education: 'Northwestern University',
    height: '5\'3"',
    relationshipGoals: 'Long-term relationship'
  },
  // Men
  {
    id: '2',
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    age: 29,
    bio: 'Tech enthusiast by day, chef by night. Always up for trying new restaurants or cooking together! 👨‍🍳',
    photos: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=handsome%20asian%20man%20smiling%20professional%20portrait%20modern%20style&image_size=portrait_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=man%20cooking%20kitchen%20chef%20apron%20passionate%20culinary&image_size=landscape_4_3'
    ],
    location: 'San Francisco, CA',
    verified: true,
    lastActive: '2025-08-28T09:15:00Z',
    interests: ['Cooking', 'Technology', 'Gaming', 'Food', 'Movies'],
    occupation: 'Software Engineer',
    education: 'Stanford University',
    height: '5\'10"',
    relationshipGoals: 'Dating to see what happens'
  },
  {
    id: '4',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@example.com',
    age: 31,
    bio: 'Fitness trainer and outdoor enthusiast. Love rock climbing and weekend adventures! 🧗‍♂️',
    photos: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=athletic%20latino%20man%20rock%20climbing%20outdoor%20adventure%20strong&image_size=portrait_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=man%20gym%20fitness%20trainer%20workout%20muscular%20dedicated&image_size=landscape_4_3'
    ],
    location: 'Denver, CO',
    verified: true,
    lastActive: '2025-08-28T07:20:00Z',
    interests: ['Rock Climbing', 'Fitness', 'Hiking', 'Travel', 'Music'],
    occupation: 'Personal Trainer',
    education: 'Colorado State University',
    height: '6\'1"',
    relationshipGoals: 'Long-term relationship'
  },
  {
    id: '6',
    name: 'David Thompson',
    email: 'david.thompson@example.com',
    age: 33,
    bio: 'Entrepreneur and wine enthusiast. Building the future while enjoying life\'s finer things 🍷',
    photos: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=handsome%20businessman%20suit%20confident%20professional%20charismatic&image_size=portrait_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=man%20wine%20tasting%20vineyard%20sophisticated%20elegant&image_size=landscape_4_3'
    ],
    location: 'Austin, TX',
    verified: true,
    lastActive: '2025-08-28T12:45:00Z',
    interests: ['Business', 'Wine', 'Travel', 'Golf', 'Networking'],
    occupation: 'Tech Entrepreneur',
    education: 'UT Austin',
    height: '6\'0"',
    relationshipGoals: 'Serious relationship'
  },
  {
    id: '8',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    age: 25,
    bio: 'Musician and coffee shop regular. Looking for someone who appreciates good music and late-night conversations 🎸',
    photos: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=young%20man%20musician%20guitar%20artistic%20creative%20casual%20style&image_size=portrait_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=man%20playing%20guitar%20coffee%20shop%20intimate%20performance&image_size=landscape_4_3'
    ],
    location: 'Portland, OR',
    verified: false,
    lastActive: '2025-08-27T22:30:00Z',
    interests: ['Music', 'Coffee', 'Art', 'Books', 'Philosophy'],
    occupation: 'Musician',
    education: 'Portland State University',
    height: '5\'9"',
    relationshipGoals: 'Dating to see what happens'
  },
  // LGBT
  {
    id: '9',
    name: 'Riley Martinez',
    email: 'riley.martinez@example.com',
    age: 26,
    bio: 'Non-binary artist and activist. Love creating, protesting, and building community 🏳️‍⚧️✨',
    photos: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=androgynous%20person%20colorful%20hair%20artistic%20style%20confident%20expression&image_size=portrait_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=person%20painting%20mural%20street%20art%20creative%20activist&image_size=landscape_4_3'
    ],
    location: 'Seattle, WA',
    verified: true,
    lastActive: '2025-08-28T14:15:00Z',
    interests: ['Art', 'Activism', 'Community', 'Music', 'Social Justice'],
    occupation: 'Visual Artist',
    education: 'University of Washington',
    height: '5\'7"',
    relationshipGoals: 'Meaningful connections'
  },
  {
    id: '10',
    name: 'Sam Chen',
    email: 'sam.chen@example.com',
    age: 30,
    bio: 'Queer therapist helping others while figuring out my own journey. Love hiking, books, and deep conversations 🌈',
    photos: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=queer%20person%20therapist%20warm%20smile%20professional%20caring%20expression&image_size=portrait_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=person%20reading%20book%20nature%20peaceful%20contemplative&image_size=landscape_4_3'
    ],
    location: 'San Francisco, CA',
    verified: true,
    lastActive: '2025-08-28T16:00:00Z',
    interests: ['Psychology', 'Hiking', 'Reading', 'Mental Health', 'Community'],
    occupation: 'Licensed Therapist',
    education: 'UCSF',
    height: '5\'8"',
    relationshipGoals: 'Long-term partnership'
  }
];

// Mock Reviews Data
export const mockReviews: Review[] = [
  // Men Category Reviews
  {
    id: '1',
    reviewerId: '1',
    reviewedUserId: '2',
    userId: '1', // This property is now properly defined in the Review type
    personName: 'Jake Miller',
    category: 'Men',
    title: 'Great first date, but no spark',
    content: 'Met Jake through a dating app. He was punctual, well-dressed, and chose a nice restaurant. Conversation flowed well and he was genuinely interested in getting to know me. However, I didn\'t feel that romantic connection. He was respectful when I told him I\'d like to stay friends.',
    rating: 3,
    platform: 'Bumble',
    location: 'San Francisco, CA',
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20restaurant%20dinner%20date%20romantic%20candlelight%20setting&image_size=landscape_4_3'
    ],
    flags: ['respectful', 'punctual'],
    isAnonymous: false,
    createdAt: '2025-08-28T19:30:00Z',
    updatedAt: '2025-08-28T19:30:00Z',
    likes: 12,
    comments: 3,
    tags: ['respectful', 'punctual', 'good-conversation']
  },
  {
    id: '5',
    reviewerId: '5',
    reviewedUserId: '2',
    userId: '5',
    personName: 'Marcus Thompson',
    category: 'Men',
    title: 'Sweet guy, but no physical attraction',
    content: 'Marcus is genuinely one of the nicest people I\'ve met. He planned a thoughtful picnic date, remembered details from our conversations, and was incredibly attentive. Unfortunately, I just didn\'t feel physically attracted to him. He took it well when I was honest about it.',
    rating: 3,
    platform: 'Coffee Meets Bagel',
    location: 'Austin, TX',
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=romantic%20picnic%20park%20blanket%20basket%20sunny%20day&image_size=landscape_4_3'
    ],
    flags: ['thoughtful', 'attentive'],
    isAnonymous: false,
    createdAt: '2025-08-25T16:30:00Z',
    updatedAt: '2025-08-25T16:30:00Z',
    likes: 6,
    comments: 2,
    tags: ['thoughtful', 'attentive', 'no-chemistry']
  },
  {
    id: '6',
    reviewerId: '7',
    reviewedUserId: '2',
    userId: '7',
    personName: 'Ryan Cooper',
    category: 'Men',
    title: 'Gym bro with surprising depth',
    content: 'Expected just another fitness obsessed guy, but Ryan surprised me. Yes, he\'s incredibly fit and talks about workouts, but he\'s also well-read and passionate about environmental causes. Our hiking date was amazing - he knew so much about local wildlife. Definitely seeing him again!',
    rating: 4,
    platform: 'Hinge',
    location: 'Denver, CO',
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mountain%20hiking%20trail%20couple%20scenic%20nature%20adventure&image_size=landscape_4_3'
    ],
    flags: ['fit', 'knowledgeable', 'surprising'],
    isAnonymous: true,
    createdAt: '2025-08-27T11:20:00Z',
    updatedAt: '2025-08-27T11:20:00Z',
    likes: 18,
    comments: 5,
    tags: ['hiking', 'fitness', 'environmental']
  },
  {
    id: '7',
    reviewerId: '3',
    reviewedUserId: '2',
    userId: '3',
    personName: 'Daniel Kim',
    category: 'Men',
    title: 'Love-bombed me then ghosted',
    content: 'Daniel came on VERY strong - texting constantly, calling me beautiful every 5 minutes, talking about our future after one date. I should have seen the red flags. After I asked him to slow down, he completely disappeared. Classic love-bombing behavior.',
    rating: 1,
    platform: 'Tinder',
    location: 'Los Angeles, CA',
    images: [],
    flags: ['love-bombing', 'ghosted', 'intense'],
    isAnonymous: true,
    createdAt: '2025-08-26T22:15:00Z',
    updatedAt: '2025-08-26T22:15:00Z',
    likes: 24,
    comments: 15,
    tags: ['red-flags', 'love-bombing', 'ghosting']
  },
  // Women Category Reviews
  {
    id: '2',
    reviewerId: '2',
    reviewedUserId: '1',
    userId: '2',
    personName: 'Sarah Johnson',
    category: 'Women',
    title: 'Amazing connection, highly recommend!',
    content: 'Sarah and I matched on Hinge and had incredible chemistry from our first message. Our coffee date turned into a 4-hour conversation that felt like minutes. She\'s intelligent, funny, and shares my passion for hiking. We\'ve been dating for 2 months now and I couldn\'t be happier!',
    rating: 5,
    platform: 'Hinge',
    location: 'Seattle, WA',
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20coffee%20shop%20couple%20laughing%20intimate%20conversation&image_size=landscape_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=hiking%20trail%20couple%20adventure%20mountain%20views&image_size=landscape_4_3'
    ],
    flags: ['great-conversation', 'shared-interests'],
    isAnonymous: false,
    createdAt: '2025-08-26T14:20:00Z',
    updatedAt: '2025-08-26T14:20:00Z',
    likes: 28,
    comments: 7,
    tags: ['great-conversation', 'shared-interests', 'long-term']
  },
  {
    id: '4',
    reviewerId: '4',
    reviewedUserId: '1',
    userId: '4',
    personName: 'Emma Davis',
    category: 'Women',
    title: 'Red flags everywhere - avoid!',
    content: 'Emma seemed great in our messages, but the date was a disaster. She was 45 minutes late without apology, spent most of dinner on her phone, and expected me to pay for everything. When I suggested splitting the bill, she got visibly upset. Save yourself the trouble.',
    rating: 1,
    platform: 'Tinder',
    location: 'Los Angeles, CA',
    images: [],
    flags: ['late', 'phone-obsessed', 'entitled'],
    isAnonymous: true,
    createdAt: '2025-08-27T20:45:00Z',
    updatedAt: '2025-08-27T20:45:00Z',
    likes: 8,
    comments: 12,
    tags: ['red-flags', 'bad-date', 'entitled']
  },
  {
    id: '8',
    reviewerId: '6',
    reviewedUserId: '1',
    userId: '6',
    personName: 'Olivia Martinez',
    category: 'Women',
    title: 'Artsy, creative, but flaky',
    content: 'Olivia is incredibly talented - she\'s a photographer and her work is stunning. Our museum date was perfect, she had such interesting perspectives on everything. But she\'s terrible at communication. Takes days to respond to texts, cancelled our second date last minute. Great person, just not reliable.',
    rating: 2,
    platform: 'Bumble',
    location: 'New York, NY',
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20art%20museum%20gallery%20couple%20viewing%20paintings&image_size=landscape_4_3'
    ],
    flags: ['creative', 'talented', 'flaky'],
    isAnonymous: false,
    createdAt: '2025-08-27T15:45:00Z',
    updatedAt: '2025-08-27T15:45:00Z',
    likes: 14,
    comments: 8,
    tags: ['creative', 'talented', 'unreliable']
  },
  {
    id: '9',
    reviewerId: '8',
    reviewedUserId: '1',
    userId: '8',
    personName: 'Zoe Chen',
    category: 'Women',
    title: 'Perfect match - we\'re engaged!',
    content: 'I almost didn\'t swipe right on Zoe because her profile seemed too good to be true. Doctor, marathon runner, speaks 3 languages? But she\'s even more amazing in person. Our first date was supposed to be coffee but turned into dinner, then a walk, then breakfast the next morning. 18 months later, I proposed! Sometimes you just know.',
    rating: 5,
    platform: 'Coffee Meets Bagel',
    location: 'Chicago, IL',
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=romantic%20proposal%20engagement%20ring%20sunset%20happy%20couple&image_size=landscape_4_3'
    ],
    flags: ['perfect-match', 'intelligent', 'athletic'],
    isAnonymous: false,
    createdAt: '2025-08-28T09:30:00Z',
    updatedAt: '2025-08-28T09:30:00Z',
    likes: 45,
    comments: 23,
    tags: ['engagement', 'perfect-match', 'long-term']
  },
  // LGBT Category Reviews
  {
    id: '3',
    reviewerId: '3',
    reviewedUserId: '9',
    userId: '3',
    personName: 'Alex Rivera',
    category: 'LGBT',
    title: 'Beautiful evening, but different life goals',
    content: 'Alex is absolutely wonderful - kind, creative, and we had amazing chemistry. We went to an art gallery opening and then dinner. The conversation was deep and meaningful. Unfortunately, they\'re looking to travel the world while I\'m focused on settling down. Sometimes timing is everything.',
    rating: 4,
    platform: 'Her',
    location: 'Portland, OR',
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=art%20gallery%20opening%20diverse%20crowd%20cultural%20event&image_size=landscape_4_3'
    ],
    flags: ['creative', 'deep-conversation'],
    isAnonymous: true,
    createdAt: '2025-08-23T21:15:00Z',
    updatedAt: '2025-08-23T21:15:00Z',
    likes: 15,
    comments: 4,
    tags: ['creative', 'deep-conversation', 'different-goals']
  },
  {
    id: '10',
    reviewerId: '9',
    reviewedUserId: '10',
    userId: '9',
    personName: 'Jordan Taylor',
    category: 'LGBT',
    title: 'Found my person at Pride!',
    content: 'Met Jordan at a Pride event, not through an app. We were both volunteering at the same booth and just clicked instantly. They\'re non-binary like me, super involved in community activism, and we share the same values. Our first official date was at a drag show - we laughed until our faces hurt. 6 months strong! 🏳️‍🌈',
    rating: 5,
    platform: 'Met in person',
    location: 'Seattle, WA',
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pride%20festival%20colorful%20flags%20community%20celebration&image_size=landscape_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=drag%20show%20performance%20audience%20laughing%20entertainment&image_size=landscape_4_3'
    ],
    flags: ['activist', 'community-minded', 'shared-values'],
    isAnonymous: false,
    createdAt: '2025-08-24T20:10:00Z',
    updatedAt: '2025-08-24T20:10:00Z',
    likes: 32,
    comments: 11,
    tags: ['pride', 'activism', 'drag-show', 'community']
  },
  {
    id: '11',
    reviewerId: '10',
    reviewedUserId: '9',
    userId: '10',
    personName: 'Casey Williams',
    category: 'LGBT',
    title: 'Great chemistry but closeted',
    content: 'Casey and I had incredible chemistry - both physically and emotionally. They\'re funny, smart, and we had amazing conversations about everything. The problem? They\'re still closeted to their family and not ready to be in a public relationship. I respect their journey, but I need someone who\'s ready to be out and proud with me.',
    rating: 3,
    platform: 'Grindr',
    location: 'Austin, TX',
    images: [],
    flags: ['great-chemistry', 'closeted', 'not-ready'],
    isAnonymous: true,
    createdAt: '2025-08-22T17:25:00Z',
    updatedAt: '2025-08-22T17:25:00Z',
    likes: 19,
    comments: 14,
    tags: ['chemistry', 'closeted', 'different-stages']
  },
  {
    id: '12',
    reviewerId: '2',
    reviewedUserId: '10',
    userId: '2',
    personName: 'River Stone',
    category: 'LGBT',
    title: 'Toxic and manipulative - stay away',
    content: 'River seemed charming at first, but quickly became controlling and manipulative. They would guilt trip me for hanging out with friends, constantly checked my phone, and made me feel bad about my appearance. When I tried to end things, they threatened to out me to my workplace. Thankfully I had supportive friends who helped me get away safely.',
    rating: 1,
    platform: 'Her',
    location: 'San Francisco, CA',
    images: [],
    flags: ['manipulative', 'controlling', 'threatening'],
    isAnonymous: true,
    createdAt: '2025-08-21T14:50:00Z',
    updatedAt: '2025-08-21T14:50:00Z',
    likes: 27,
    comments: 18,
    tags: ['toxic', 'manipulation', 'controlling', 'threats']
  }
];

// Mock Chat Messages
export const mockChatMessages: ChatMessage[] = [
  {
    _id: '1',
    id: '1',
    roomId: '1_2',
    senderId: '1',
    receiverId: '2',
    content: 'Hey Alex! Thanks for the great dinner last night 😊',
    _creationTime: '2025-08-28T09:30:00Z',
    timestamp: '2025-08-28T09:30:00Z',
    messageType: 'text' as const,
    type: 'text',
    read: true,
    isRead: true,
    isDelivered: true
  },
  {
    _id: '2',
    id: '2',
    roomId: '1_2',
    senderId: '2',
    receiverId: '1',
    content: 'It was my pleasure Emma! I had such a great time. Would love to cook for you again sometime 👨‍🍳',
    _creationTime: '2025-08-28T09:45:00Z',
    timestamp: '2025-08-28T09:45:00Z',
    messageType: 'text' as const,
    type: 'text',
    read: true,
    isRead: true,
    isDelivered: true
  },
  {
    _id: '3',
    id: '3',
    roomId: '1_2',
    senderId: '1',
    receiverId: '2',
    content: 'That sounds amazing! I\'m free this weekend if you want to plan something',
    _creationTime: '2025-08-28T10:00:00Z',
    timestamp: '2025-08-28T10:00:00Z',
    messageType: 'text' as const,
    type: 'text',
    read: false,
    isRead: false,
    isDelivered: true
  },
  {
    _id: '4',
    id: '4',
    roomId: '3_4',
    senderId: '3',
    receiverId: '4',
    content: 'Hi Michael! Ready for our hiking adventure tomorrow? 🥾',
    _creationTime: '2025-08-27T18:30:00Z',
    timestamp: '2025-08-27T18:30:00Z',
    messageType: 'text' as const,
    type: 'text',
    read: true,
    isRead: true,
    isDelivered: true
  },
  {
    _id: '5',
    id: '5',
    roomId: '3_4',
    senderId: '4',
    receiverId: '3',
    content: 'Absolutely! I\'ve got all the gear ready. It\'s going to be an amazing day! ⛰️',
    _creationTime: '2025-08-27T19:00:00Z',
    timestamp: '2025-08-27T19:00:00Z',
    messageType: 'text' as const,
    type: 'text',
    read: true,
    isRead: true,
    isDelivered: true
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
    lastMessageTime: '2025-08-28T10:00:00Z',
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
    lastMessageTime: '2025-08-27T19:00:00Z',
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
    timestamp: '2025-08-28T09:45:00Z',
    read: false,
    actionUserId: '2'
  },
  {
    id: '2',
    userId: '1',
    type: 'review',
    title: 'New Review',
    message: 'Someone left you a 5-star review!',
    timestamp: '2025-08-26T14:30:00Z',
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
    timestamp: '2025-08-25T16:20:00Z',
    read: true,
    actionUserId: '1'
  },
  {
    id: '4',
    userId: '3',
    type: 'match',
    title: 'New Match!',
    message: 'You and Michael are a match!',
    timestamp: '2025-08-24T12:15:00Z',
    read: true,
    actionUserId: '4'
  },
  {
    id: '5',
    userId: '1',
    type: 'system',
    title: 'Profile Verification',
    message: 'Your profile has been successfully verified!',
    timestamp: '2025-08-23T10:00:00Z',
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
      timestamp: '2025-08-28T10:30:00Z',
      senderName: 'Emma',
      senderId: '1'
    },
    _creationTime: '2025-08-26T08:00:00Z',
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
      timestamp: '2025-08-27T18:45:00Z',
      senderName: 'Sarah',
      senderId: '3'
    },
    _creationTime: '2025-08-24T12:00:00Z',
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
      timestamp: '2025-08-27T20:15:00Z',
      senderName: 'Alex',
      senderId: '2'
    },
    _creationTime: '2025-08-23T15:30:00Z',
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