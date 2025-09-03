import 'react-native-gesture-handler/jestSetup';

// Mock Platform very early to prevent issues
const mockPlatform = {
  OS: 'ios',
  select: jest.fn((obj) => obj.ios || obj.default || obj.native),
  constants: {
    getConstants: jest.fn(() => ({
      model: 'iPhone',
      systemName: 'iOS',
      systemVersion: '14.0',
    })),
  },
};

// Set up global Platform immediately
global.Platform = mockPlatform;

// Mock Platform module paths early
jest.doMock('react-native/Libraries/Utilities/Platform', () => mockPlatform);
jest.doMock('expo-modules-core/src/Platform', () => mockPlatform);

// Mock react-native-reanimated with a simpler approach
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  
  const mockAnimatedComponent = (Component) => {
    return React.forwardRef((props, ref) => {
      return React.createElement(Component, { ...props, ref });
    });
  };

  return {
    default: {
      View: mockAnimatedComponent('View'),
      Text: mockAnimatedComponent('Text'),
      ScrollView: mockAnimatedComponent('ScrollView'),
      Image: mockAnimatedComponent('Image'),
      FlatList: mockAnimatedComponent('FlatList'),
      createAnimatedComponent: mockAnimatedComponent,
      interpolate: jest.fn(),
      Extrapolate: { CLAMP: 'clamp' },
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((value) => value),
    withTiming: jest.fn((value) => value),
    runOnJS: jest.fn((fn) => fn),
    makeMutable: jest.fn(() => ({ value: 0 })),
    createAnimatedComponent: mockAnimatedComponent,
  };
});

// Mock React Native TurboModuleRegistry to prevent DevMenu errors
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: jest.fn(() => ({})),
  get: jest.fn(() => ({})),
}));

// Mock DevMenu specifically
jest.mock('react-native/src/private/devmenu/DevMenu', () => ({}));

// Mock native modules that cause getConstants errors
jest.mock('react-native/src/private/specs_DEPRECATED/modules/NativeDeviceInfo', () => ({
  getConstants: jest.fn(() => ({
    Dimensions: {
      window: { width: 375, height: 812 },
      screen: { width: 375, height: 812 },
    },
  })),
}));

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

// Mock Dimensions first to prevent getConstants issues
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({
    width: 375,
    height: 812,
    scale: 2,
    fontScale: 1,
  })),
  getConstants: jest.fn(() => ({
    Dimensions: {
      window: { width: 375, height: 812, scale: 2, fontScale: 1 },
      screen: { width: 375, height: 812, scale: 2, fontScale: 1 },
    },
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock PixelRatio to prevent getConstants issues
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn((layoutSize) => layoutSize * 2),
  roundToNearestPixel: jest.fn((layoutSize) => layoutSize),
}));

// Mock Animated API - using a safer approach  
jest.mock('react-native', () => {
  const React = require('react');
  
  // Mock components that don't require native constants
  const MockView = React.forwardRef((props, ref) => React.createElement('View', { ...props, ref }));
  const MockText = React.forwardRef((props, ref) => React.createElement('Text', { ...props, ref }));
  const MockScrollView = React.forwardRef((props, ref) => React.createElement('ScrollView', { ...props, ref }));
  
  // Create a mock for Animated that doesn't depend on platform constants
  const MockAnimated = {
    View: MockView,
    Text: MockText,
    ScrollView: MockScrollView,
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
    View: MockView,
    Text: MockText,
    ScrollView: MockScrollView,
    TouchableOpacity: React.forwardRef((props, ref) => React.createElement('TouchableOpacity', { ...props, ref })),
    TouchableHighlight: React.forwardRef((props, ref) => React.createElement('TouchableHighlight', { ...props, ref })),
    Pressable: React.forwardRef((props, ref) => React.createElement('Pressable', { ...props, ref })),
    Image: React.forwardRef((props, ref) => React.createElement('Image', { ...props, ref })),
    FlatList: React.forwardRef((props, ref) => React.createElement('FlatList', { ...props, ref })),
    TextInput: React.forwardRef((props, ref) => React.createElement('TextInput', { ...props, ref })),
    SafeAreaView: React.forwardRef((props, ref) => React.createElement('SafeAreaView', { ...props, ref })),
    ActivityIndicator: React.forwardRef((props, ref) => React.createElement('ActivityIndicator', { ...props, ref })),
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((styles) => styles),
    },
    Dimensions: {
      get: jest.fn(() => ({
        width: 375,
        height: 812,
        scale: 2,
        fontScale: 1,
      })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
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

// Mock Expo Platform first to prevent undefined select errors
jest.mock('expo-modules-core/src/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios || obj.default || obj.native),
}));

// Mock Expo modules
jest.mock('expo-modules-core', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default || obj.native),
  },
  NativeModule: jest.fn(),
}));

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

// Mock Expo vector icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const mockIcon = React.forwardRef((props, ref) => React.createElement('MockIcon', { ...props, ref }));
  
  return {
    Ionicons: mockIcon,
    MaterialIcons: mockIcon,
    FontAwesome: mockIcon,
    AntDesign: mockIcon,
    Entypo: mockIcon,
    EvilIcons: mockIcon,
    Feather: mockIcon,
    Foundation: mockIcon,
    MaterialCommunityIcons: mockIcon,
    Octicons: mockIcon,
    SimpleLineIcons: mockIcon,
    Zocial: mockIcon,
  };
});

// Mock Expo Linear Gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: require('react').forwardRef((props, ref) => 
    require('react').createElement('LinearGradient', { ...props, ref })
  ),
}));

// Mock Expo Blur
jest.mock('expo-blur', () => ({
  BlurView: require('react').forwardRef((props, ref) => 
    require('react').createElement('BlurView', { ...props, ref })
  ),
}));

// Mock other Expo modules that might cause issues
jest.mock('expo-modules-core', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default || obj.native),
  },
  NativeModule: jest.fn(),
  requireNativeViewManager: jest.fn(() => () => null),
  requireNativeModule: jest.fn(() => ({})),
  requireOptionalNativeModule: jest.fn(() => null),
}));

// Mock expo-application
jest.mock('expo-application', () => ({
  applicationName: 'LockerRoom Talk',
  applicationId: 'com.lockerroom.talk',
  nativeApplicationVersion: '1.0.0',
  nativeBuildVersion: '1',
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'Apple',
  manufacturer: 'Apple',
  modelName: 'iPhone',
  osName: 'iOS',
  osVersion: '14.0',
  deviceType: 1,
  totalMemory: 4294967296,
}));

// Mock expo-image
jest.mock('expo-image', () => ({
  Image: require('react').forwardRef((props, ref) => 
    require('react').createElement('Image', { ...props, ref })
  ),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    sessionId: 'test-session',
    deviceId: 'test-device',
    expoVersion: '51.0.0',
    platform: {
      ios: {
        model: 'iPhone',
        systemVersion: '14.0',
      },
    },
  },
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

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => require('react').createElement('NavigationContainer', {}, children),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
  useIsFocused: jest.fn(() => true),
  DefaultTheme: { colors: { background: '#fff', text: '#000' } },
  DarkTheme: { colors: { background: '#000', text: '#fff' } },
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

// Set up global Platform for utilities that import it directly
global.Platform = {
  OS: 'ios',
  select: jest.fn((obj) => obj.ios || obj.default || obj.native),
};

// Mock specific modules that use Platform.select during initialization
jest.mock('@/utils/typography', () => {
  const mockTypography = {
    fontFamily: {
      sans: 'SF Pro Display',
      mono: 'SF Mono',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
      '6xl': 60,
    },
    fontWeight: {
      thin: '100',
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeight: {
      none: 1,
      tight: 1.2,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    letterSpacing: {
      tighter: -1.5,
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      wider: 1,
      widest: 2,
    },
  };
  
  const mockTextStyles = {
    h1: { fontSize: 36, fontWeight: '700', lineHeight: 43.2, letterSpacing: -0.5 },
    h2: { fontSize: 30, fontWeight: '600', lineHeight: 36, letterSpacing: -0.5 },
    h3: { fontSize: 24, fontWeight: '600', lineHeight: 36 },
    h4: { fontSize: 20, fontWeight: '500', lineHeight: 30 },
    h5: { fontSize: 18, fontWeight: '500', lineHeight: 27 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 28 },
    bodyLarge: { fontSize: 18, fontWeight: '400', lineHeight: 31.5 },
    bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 21 },
    caption: { fontSize: 12, fontWeight: '400', lineHeight: 18, opacity: 0.7 },
    button: { fontSize: 16, fontWeight: '600', lineHeight: 19.2, letterSpacing: 0.5 },
    buttonSmall: { fontSize: 14, fontWeight: '500', lineHeight: 16.8 },
    label: { fontSize: 14, fontWeight: '500', lineHeight: 16.8, letterSpacing: 0.5 },
    link: { fontSize: 16, fontWeight: '500', lineHeight: 24, textDecorationLine: 'underline' },
  };
  
  return {
    typography: mockTypography,
    textStyles: mockTextStyles,
    default: mockTypography,
  };
});

// Also mock direct path in case alias doesn't work
jest.mock('./utils/typography', () => {
  const mockTypography = {
    fontFamily: { sans: 'SF Pro Display', mono: 'SF Mono' },
    fontSize: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48, '6xl': 60 },
    fontWeight: { thin: '100', light: '300', regular: '400', medium: '500', semibold: '600', bold: '700', extrabold: '800', black: '900' },
    lineHeight: { none: 1, tight: 1.2, snug: 1.375, normal: 1.5, relaxed: 1.75, loose: 2 },
    letterSpacing: { tighter: -1.5, tight: -0.5, normal: 0, wide: 0.5, wider: 1, widest: 2 },
  };
  const mockTextStyles = { h1: { fontSize: 36, fontWeight: '700' }, body: { fontSize: 16, fontWeight: '400' } };
  return { typography: mockTypography, textStyles: mockTextStyles, default: mockTypography };
});

// Ensure Dimensions is available globally
global.Dimensions = {
  get: jest.fn(() => ({
    width: 375,
    height: 812,
    scale: 2,
    fontScale: 1,
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};
