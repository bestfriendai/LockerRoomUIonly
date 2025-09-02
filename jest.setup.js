import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Animated API - using a safer approach
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      timing: jest.fn(() => ({
        start: jest.fn(),
      })),
      spring: jest.fn(() => ({
        start: jest.fn(),
      })),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    },
  };
});

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Stack: {
    Screen: 'Screen',
  },
  Tabs: {
    Screen: 'Screen',
  },
  Slot: 'Slot',
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

// Mock bad-words with a simple implementation
jest.mock('bad-words', () => {
  return jest.fn().mockImplementation(() => ({
    isProfane: jest.fn().mockImplementation((text) => {
      // Simple profanity detection for testing
      const profaneWords = ['shit', 'damn', 'fuck', 'ass', 'bitch'];
      return profaneWords.some(word => text.toLowerCase().includes(word));
    }),
    clean: jest.fn().mockImplementation((text) => text.replace(/shit|damn|fuck|ass|bitch/gi, '****')),
  }));
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(),
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    Svg: ({ children, ...props }) => React.createElement('Svg', props, children),
    Circle: (props) => React.createElement('Circle', props),
    Path: (props) => React.createElement('Path', props),
    G: ({ children, ...props }) => React.createElement('G', props, children),
  };
});

// Mock Lucide React Native icons
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const mockIcon = (props) => React.createElement('MockIcon', props);
  
  return new Proxy({}, {
    get: () => mockIcon,
  });
});

// Mock FlashList
jest.mock('@shopify/flash-list', () => ({
  FlashList: 'FlashList',
  MasonryFlashList: 'MasonryFlashList',
}));

// Mock Sentry
jest.mock('sentry-expo', () => ({
  init: jest.fn(),
  Native: {
    captureException: jest.fn(),
    captureMessage: jest.fn(),
  },
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
// This is handled by the react-native mock above

// Mock console methods in test environment
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  // error: jest.fn(),
};

// Mock global fetch
global.fetch = jest.fn();

// Mock __DEV__
global.__DEV__ = true;
