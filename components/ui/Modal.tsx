import React, { useEffect } from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../providers/ThemeProvider';
import { SPACING } from '../../constants/spacing';
import { BORDER_RADIUS } from '../../constants/shadows';
import { tokens } from '../../constants/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'slide' | 'fade' | 'scale';
  position?: 'center' | 'bottom' | 'top';
  closeOnBackdropPress?: boolean;
  backdropOpacity?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  animationType = 'fade',
  position = 'center',
  closeOnBackdropPress = true,
  backdropOpacity = 0.5,
  style,
  contentStyle,
}) => {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(position === 'bottom' ? SCREEN_HEIGHT : position === 'top' ? -SCREEN_HEIGHT : 0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: tokens.duration.normal });
      
      if (animationType === 'scale') {
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 300,
        });
      } else if (animationType === 'slide') {
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 300,
        });
      }
    } else {
      opacity.value = withTiming(0, { duration: tokens.duration.fast });
      
      if (animationType === 'scale') {
        scale.value = withTiming(0.9, { duration: tokens.duration.fast });
      } else if (animationType === 'slide') {
        const targetY = position === 'bottom' ? SCREEN_HEIGHT : position === 'top' ? -SCREEN_HEIGHT : 0;
        translateY.value = withTiming(targetY, { duration: tokens.duration.normal });
      }
    }
  }, [visible, animationType, position]);

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value * backdropOpacity,
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const baseStyle: any = {
      opacity: opacity.value,
    };

    if (animationType === 'scale') {
      baseStyle.transform = [{ scale: scale.value }];
    } else if (animationType === 'slide') {
      baseStyle.transform = [{ translateY: translateY.value }];
    }

    return baseStyle;
  });

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  const getContentContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      margin: SPACING.lg,
      maxWidth: SCREEN_WIDTH - SPACING.lg * 2,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    };

    switch (position) {
      case 'bottom':
        return {
          ...baseStyle,
          margin: 0,
          marginTop: 'auto',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderTopLeftRadius: BORDER_RADIUS.xl,
          borderTopRightRadius: BORDER_RADIUS.xl,
          maxWidth: SCREEN_WIDTH,
          width: '100%',
        };
      case 'top':
        return {
          ...baseStyle,
          margin: 0,
          marginBottom: 'auto',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: BORDER_RADIUS.xl,
          borderBottomRightRadius: BORDER_RADIUS.xl,
          maxWidth: SCREEN_WIDTH,
          width: '100%',
        };
      default: // center
        return baseStyle;
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <RNModal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <View style={[styles.container, style]}>
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleBackdropPress}
          />
        </Animated.View>
        
        <Animated.View
          style={[
            getContentContainerStyle(),
            contentAnimatedStyle,
            contentStyle,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});