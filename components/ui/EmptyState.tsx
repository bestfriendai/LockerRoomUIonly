import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';
import { Button } from './Button';
import { tokens } from '../../constants/tokens';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onAction?: () => void;
  actionText?: string;
  style?: ViewStyle;
  showIcon?: boolean;
  variant?: 'default' | 'search' | 'error' | 'success';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nothing here yet',
  message = 'When you have content, it will appear here.',
  icon = 'document-outline',
  onAction,
  actionText = 'Get Started',
  style,
  showIcon = true,
  variant = 'default',
}) => {
  const { colors } = useTheme();

  const getIconColor = () => {
    switch (variant) {
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'search':
        return colors.warning;
      default:
        return colors.textTertiary;
    }
  };

  const getIconBackgroundColor = () => {
    switch (variant) {
      case 'error':
        return colors.errorContainer;
      case 'success':
        return colors.successContainer || colors.surface;
      case 'search':
        return colors.warningBg;
      default:
        return colors.surface;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 150,
        }}
        style={styles.content}
      >
        {showIcon && (
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: 600,
              delay: 200,
            }}
            style={[
              styles.iconContainer,
              { backgroundColor: getIconBackgroundColor() }
            ]}
          >
            <Ionicons
              name={icon}
              size={32}
              color={getIconColor()}
            />
          </MotiView>
        )}

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 600,
            delay: 300,
          }}
          style={styles.textContainer}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>
        </MotiView>

        {onAction && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: 600,
              delay: 400,
            }}
            style={styles.buttonContainer}
          >
            <Button
              variant={variant === 'error' ? 'secondary' : 'primary'}
              onPress={onAction}
              accessibilityLabel={`${actionText} button`}
              accessibilityHint="Tap to perform the suggested action"
            >
              {actionText}
            </Button>
          </MotiView>
        )}
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
  },
  title: {
    fontSize: tokens.fontSize.xl,
    fontWeight: tokens.fontWeight.semibold as any,
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
    fontFamily: 'Inter',
  },
  message: {
    fontSize: tokens.fontSize.base,
    fontWeight: tokens.fontWeight.normal as any,
    textAlign: 'center',
    lineHeight: tokens.lineHeight.lg,
    fontFamily: 'Inter',
  },
  buttonContainer: {
    width: '100%',
  },
});
