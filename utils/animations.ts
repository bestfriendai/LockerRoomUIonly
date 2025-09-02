import { Animated, Easing, InteractionManager } from 'react-native';

// Enhanced animation utilities for LockerRoom Talk
export const createSpringAnimation = (
  value: Animated.Value,
  toValue: number,
  config?: Partial<Animated.SpringAnimationConfig>
) => {
  return Animated.spring(value, {
    toValue,
    useNativeDriver: true,
    tension: 100,
    friction: 8,
    ...config,
  });
};

export const createTimingAnimation = (
  value: Animated.Value,
  toValue: number,
  duration: number = 300,
  easing: ((value: number) => number) = Easing.bezier(0.4, 0, 0.2, 1)
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

// Stagger animation for lists
export const createStaggerAnimation = (
  animations: Animated.CompositeAnimation[],
  stagger: number = 100
) => {
  return Animated.stagger(stagger, animations);
};

// Pulse animation for loading states
export const createPulseAnimation = (value: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 0.3,
        duration: 1000,
        useNativeDriver: true,
      }),
    ])
  );
};

// Fade in animation
export const createFadeInAnimation = (
  value: Animated.Value,
  duration: number = 300,
  delay: number = 0
) => {
  return Animated.timing(value, {
    toValue: 1,
    duration,
    delay,
    useNativeDriver: true,
  });
};

// Slide in animation
export const createSlideInAnimation = (
  value: Animated.Value,
  fromValue: number,
  toValue: number = 0,
  duration: number = 300
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

// Scale animation for press feedback
export const createScaleAnimation = (
  value: Animated.Value,
  toValue: number = 0.95,
  duration: number = 100
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  });
};

// Bounce animation
export const createBounceAnimation = (value: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 1.1,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 1,
      duration: 150,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }),
  ]);
};

// Shake animation for errors
export const createShakeAnimation = (value: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(value, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: -10, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]);
};

// Performance-optimized animation creator
export const createPerformantAnimation = (
  value: Animated.Value,
  toValue: number,
  callback?: () => void
) => {
  // Wait for interactions to complete before starting animation
  InteractionManager.runAfterInteractions(() => {
    Animated.timing(value, {
      toValue,
      duration: 300,
      useNativeDriver: true, // Always use native driver when possible
    }).start(callback);
  });
};

// Optimized list animations
export const createStaggeredListAnimation = (
  items: any[],
  animatedValues: Animated.Value[]
) => {
  const animations = items.map((_, index) =>
    Animated.timing(animatedValues[index], {
      toValue: 1,
      duration: 300,
      delay: index * 50, // Stagger by 50ms
      useNativeDriver: true,
    })
  );

  return Animated.parallel(animations);
};

// Common easing functions
export const easings = {
  // Material Design easings
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  decelerate: Easing.bezier(0, 0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0, 1, 1),
  sharp: Easing.bezier(0.4, 0, 0.6, 1),
  
  // Custom easings
  spring: Easing.bezier(0.68, -0.55, 0.265, 1.55),
  bounce: Easing.bounce,
  elastic: Easing.elastic(1),
};

// Animation presets
export const animationPresets = {
  // Button press
  buttonPress: {
    scale: 0.95,
    duration: 100,
    easing: easings.sharp,
  },
  
  // Card hover
  cardHover: {
    scale: 1.02,
    duration: 200,
    easing: easings.standard,
  },
  
  // Modal entrance
  modalEntrance: {
    duration: 300,
    easing: easings.decelerate,
  },
  
  // Page transition
  pageTransition: {
    duration: 250,
    easing: easings.standard,
  },
  
  // Loading pulse
  loadingPulse: {
    duration: 1000,
    easing: Easing.inOut(Easing.ease),
  },
};

// Hook-like animation utilities
export const useAnimatedValue = (initialValue: number = 0) => {
  return new Animated.Value(initialValue);
};

export const useAnimatedXY = (initialX: number = 0, initialY: number = 0) => {
  return new Animated.ValueXY({ x: initialX, y: initialY });
};

// Gesture-based animations
export const createSwipeAnimation = (
  value: Animated.ValueXY,
  direction: 'left' | 'right' | 'up' | 'down',
  distance: number = 100
) => {
  const toValue = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    up: { x: 0, y: -distance },
    down: { x: 0, y: distance },
  }[direction];

  return Animated.timing(value, {
    toValue,
    duration: 200,
    easing: easings.sharp,
    useNativeDriver: true,
  });
};

// Complex animation sequences
export const createEntranceSequence = (values: Animated.Value[]) => {
  return Animated.sequence([
    Animated.parallel(
      values.map((value, index) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 300,
          delay: index * 100,
          easing: easings.decelerate,
          useNativeDriver: true,
        })
      )
    ),
  ]);
};

export default {
  createSpringAnimation,
  createTimingAnimation,
  createStaggerAnimation,
  createPulseAnimation,
  createFadeInAnimation,
  createSlideInAnimation,
  createScaleAnimation,
  createBounceAnimation,
  createShakeAnimation,
  createPerformantAnimation,
  createStaggeredListAnimation,
  easings,
  animationPresets,
  useAnimatedValue,
  useAnimatedXY,
  createSwipeAnimation,
  createEntranceSequence,
};
