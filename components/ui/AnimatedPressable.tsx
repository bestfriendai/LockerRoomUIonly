import React, { ReactNode } from 'react';
import {
  Pressable,
  PressableProps,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../providers/ThemeProvider';
import { Text } from './Text';

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

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
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
  const { colors } = useTheme();
  const scale = useSharedValue(scaleFrom);
  const opacity = useSharedValue(1);

  const hapticButtonPress = () => {
    if (hapticOnPress && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressIn = (event: any) => {
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

  const handlePressOut = (event: any) => {
    scale.value = withSpring(scaleFrom, {
      damping: 15,
      stiffness: 300,
    });
    
    if (overlayOnPress) {
      opacity.value = withSpring(1);
    }
    
    onPressOut?.(event);
  };

  const handlePress = (event: any) => {
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
      return <Text>{children}</Text>;
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

// Default export for backward compatibility
export default AnimatedPressable;