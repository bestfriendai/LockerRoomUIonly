import React, { ReactNode } from 'react';
import {
  Text as RNText,
  StyleSheet,
  ViewStyle,
  Pressable,
  PressableProps,
  GestureResponderEvent
} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

// Fallback colors when ThemeProvider is not available
const fallbackColors = {
  primary: '#007AFF',
  background: '#FFFFFF',
  surface: '#F2F2F7',
  text: '#000000',
  border: '#C6C6C8',
};


interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  scaleFrom?: number;
  scaleTo?: number;
  hapticOnPress?: boolean;
  overlayOnPress?: boolean;
  overlayColor?: string;
  rippleColor?: string;
}

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  children,
  style,
  scaleFrom = 1,
  scaleTo = 0.95,
  hapticOnPress = false,
  overlayOnPress = false,
  overlayColor,
  rippleColor,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}) => {
  // Use fallback colors if ThemeProvider is not available
  let colors;
  try {
    const theme = useTheme();
    colors = theme.colors;
  } catch (error) {
    colors = fallbackColors;
  }
  const scale = useSharedValue(scaleFrom);
  const opacity = useSharedValue(1);

  const hapticButtonPress = () => {
    if (hapticOnPress && !disabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    scale.value = withSpring(scaleTo, {
      damping: 15,
      stiffness: 300,
    });
    
    if (overlayOnPress) {
      opacity.value = withSpring(0.8);
    }
    
    runOnJS(hapticButtonPress)();
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    scale.value = withSpring(scaleFrom, {
      damping: 15,
      stiffness: 300,
    });
    
    if (overlayOnPress) {
      opacity.value = withSpring(1);
    }
    
    onPressOut?.(event);
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (!disabled) {
      onPress?.(event);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  // Wrap string or number children in Text component
  const renderChildren = () => {
    if (typeof children === 'string' || typeof children === 'number') {
      return <RNText>{children}</RNText>;
    }
    return children;
  };

  const combinedStyle = StyleSheet.flatten([
    style,
    disabled && styles.disabled,
  ]);

  return (
    <AnimatedPressableComponent
      style={[combinedStyle, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      android_ripple={{
        color: rippleColor || colors.primary,
        borderless: false,
      }}
      {...props}
    >
      {renderChildren()}
    </AnimatedPressableComponent>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});

export default AnimatedPressable;