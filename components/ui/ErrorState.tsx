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

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onRetry?: () => void;
  retryText?: string;
  style?: ViewStyle;
  showIcon?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error. Please try again.',
  icon = 'alert-circle-outline',
  onRetry,
  retryText = 'Try Again',
  style,
  showIcon = true,
}) => {
  const { colors } = useTheme();

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
            style={[styles.iconContainer, { backgroundColor: colors.errorContainer }]}
          >
            <Ionicons
              name={icon}
              size={32}
              color={colors.error}
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

        {onRetry && (
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
              variant="primary"
              onPress={onRetry}
              accessibilityLabel={`${retryText} button`}
              accessibilityHint="Tap to retry the failed operation"
            >
              {retryText}
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
