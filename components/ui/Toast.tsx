import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';
import { tokens } from '../../constants/tokens';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
  position?: 'top' | 'bottom';
}

export const Toast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  visible,
  onHide,
  duration = 4000,
  position = 'top',
}) => {
  const { colors } = useTheme();

  useEffect(() => {
    if (visible) {
      // Provide haptic feedback based on toast type
      const hapticType = type === 'error' 
        ? Haptics.NotificationFeedbackType.Error
        : type === 'success'
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning;
      
      Haptics.notificationAsync(hapticType).catch(() => {
        // Haptics might not be available
      });

      const timer = setTimeout(() => {
        onHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide, type]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success,
          textColor: colors.onSuccess || '#FFFFFF',
          icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
        };
      case 'error':
        return {
          backgroundColor: colors.error,
          textColor: colors.onError || '#FFFFFF',
          icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          textColor: colors.onWarning || '#FFFFFF',
          icon: 'warning' as keyof typeof Ionicons.glyphMap,
        };
      case 'info':
      default:
        return {
          backgroundColor: colors.info,
          textColor: '#FFFFFF',
          icon: 'information-circle' as keyof typeof Ionicons.glyphMap,
        };
    }
  };

  const config = getToastConfig();

  if (!visible) return null;

  return (
    <MotiView
      from={{
        opacity: 0,
        translateY: position === 'top' ? -100 : 100,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        translateY: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        translateY: position === 'top' ? -100 : 100,
        scale: 0.9,
      }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 150,
      }}
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          top: position === 'top' ? Platform.OS === 'ios' ? 60 : 40 : undefined,
          bottom: position === 'bottom' ? Platform.OS === 'ios' ? 40 : 20 : undefined,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={config.icon}
          size={24}
          color={config.textColor}
          style={styles.icon}
        />
        
        <View style={styles.textContainer}>
          <Text
            style={[styles.title, { color: config.textColor }]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {message && (
            <Text
              style={[styles.message, { color: config.textColor }]}
              numberOfLines={3}
            >
              {message}
            </Text>
          )}
        </View>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: tokens.spacing.md,
    right: tokens.spacing.md,
    borderRadius: tokens.radii.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: tokens.zIndex.toast,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: tokens.spacing.md,
  },
  icon: {
    marginRight: tokens.spacing.sm,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: tokens.fontSize.base,
    fontWeight: tokens.fontWeight.semibold as any,
    fontFamily: 'Inter',
    lineHeight: tokens.lineHeight.base,
  },
  message: {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.normal as any,
    fontFamily: 'Inter',
    lineHeight: tokens.lineHeight.sm,
    marginTop: tokens.spacing.xs,
    opacity: 0.9,
  },
});
