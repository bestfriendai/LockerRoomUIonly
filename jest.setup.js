import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock React Native TurboModuleRegistry to prevent DevMenu errors
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: jest.fn(() => ({})),
  get: jest.fn(() => ({})),
}));

// Mock DevMenu specifically
jest.mock('react-native/src/private/devmenu/DevMenu', () => ({}));

// Mock Platform constants
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios || obj.default),
  constants: {
    getConstants: jest.fn(() => ({
      model: 'iPhone',
      systemName: 'iOS',
      systemVersion: '14.0',
    })),
  },
}));

// Mock Animated API - using a safer approach  
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  // Create a mock for Animated that doesn't depend on platform constants
  const MockAnimated = {
    View: RN.View,
    Text: RN.Text,
    ScrollView: RN.ScrollView,
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(),
    })),
    Value: jest.fn().mockImplementation((value) => ({
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      _value: value,
      _offset: 0,
    })),
    ValueXY: jest.fn().mockImplementation(() => ({
      x: { setValue: jest.fn(), addListener: jest.fn(), removeListener: jest.fn() },
      y: { setValue: jest.fn(), addListener: jest.fn(), removeListener: jest.fn() },
    })),
    decay: jest.fn(() => ({ start: jest.fn() })),
    sequence: jest.fn(() => ({ start: jest.fn() })),
    parallel: jest.fn(() => ({ start: jest.fn() })),
    loop: jest.fn(() => ({ start: jest.fn() })),
    event: jest.fn(),
  };

  return {
    ...RN,
    // Mock TurboModuleRegistry at the module level
    TurboModuleRegistry: {
      getEnforcing: jest.fn(() => ({})),
      get: jest.fn(() => ({})),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
      constants: {
        getConstants: jest.fn(() => ({
          model: 'iPhone',
          systemName: 'iOS', 
          systemVersion: '14.0',
        })),
      },
    },
    Animated: MockAnimated,
  };
});

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({
    name: '[DEFAULT]',
    options: {},
  })),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
  })),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({
    user: { uid: 'test-uid', email: 'test@example.com' },
  })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({
    user: { uid: 'test-uid', email: 'test@example.com' },
  })),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({
    _delegate: {},
    app: {},
  })),
  collection: jest.fn(() => ({
    id: 'test-collection',
    path: 'test-collection',
  })),
  doc: jest.fn(() => ({
    id: 'test-doc',
    path: 'test-collection/test-doc',
  })),
  addDoc: jest.fn(() => Promise.resolve({
    id: 'new-doc-id',
  })),
  getDocs: jest.fn(() => Promise.resolve({
    docs: [],
    empty: true,
    size: 0,
  })),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  query: jest.fn(() => ({})),
  where: jest.fn(() => ({})),
  orderBy: jest.fn(() => ({})),
  limit: jest.fn(() => ({})),
  Timestamp: jest.fn().mockImplementation((seconds, nanoseconds = 0) => ({
    seconds,
    nanoseconds,
    toDate: () => new Date(seconds * 1000),
  })),
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
