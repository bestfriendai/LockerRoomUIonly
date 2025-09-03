import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../providers/ThemeProvider';
import { ModernButton } from './ModernButton';
import { tokens } from '../../constants/tokens';
import { BORDER_RADIUS, SHADOWS } from '../../constants/shadows';
import { createTypographyStyles } from '../../styles/typography';

const { width: screenWidth } = Dimensions.get('window');

interface EnhancedEmptyStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onAction?: () => void;
  actionText?: string;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
  showIcon?: boolean;
  variant?: 'default' | 'search' | 'error' | 'success' | 'network' | 'filter' | 'reviews' | 'chats';
  illustrationStyle?: 'gradient' | 'glass' | 'neumorphic' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const EnhancedEmptyState: React.FC<EnhancedEmptyStateProps> = ({
  title = 'Nothing here yet',
  message = 'When you have content, it will appear here.',
  icon = 'document-outline',
  onAction,
  actionText = 'Get Started',
  secondaryActionText,
  onSecondaryAction,
  style,
  showIcon = true,
  variant = 'default',
  illustrationStyle = 'gradient',
  size = 'md',
  animated = true,
}) => {
  const { colors, isDark } = useTheme();
  const typography = createTypographyStyles(colors);

  // Size configurations
  const sizeConfig = {
    sm: {
      iconSize: 28,
      iconContainer: 48,
      titleSize: tokens.fontSize.lg,
      messageSize: tokens.fontSize.sm,
      spacing: tokens.spacing.sm,
      padding: tokens.spacing.md,
    },
    md: {
      iconSize: 32,
      iconContainer: 64,
      titleSize: tokens.fontSize.xl,
      messageSize: tokens.fontSize.base,
      spacing: tokens.spacing.md,
      padding: tokens.spacing.lg,
    },
    lg: {
      iconSize: 40,
      iconContainer: 80,
      titleSize: tokens.fontSize['2xl'],
      messageSize: tokens.fontSize.lg,
      spacing: tokens.spacing.lg,
      padding: tokens.spacing.xl,
    },
  };

  const config = sizeConfig[size];

  const getIconColor = () => {
    switch (variant) {
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'search':
        return colors.warning;
      case 'network':
        return colors.textTertiary;
      case 'filter':
        return colors.primary;
      case 'reviews':
        return colors.primary;
      case 'chats':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const handleActionPress = () => {
    if (onAction) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onAction();
    }
  };

  const handleSecondaryActionPress = () => {
    if (onSecondaryAction) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSecondaryAction();
    }
  };

  const renderIconBackground = () => {
    const baseStyle = {
      position: 'absolute' as const,
      width: config.iconContainer,
      height: config.iconContainer,
      borderRadius: config.iconContainer / 2,
      zIndex: 1,
    };

    switch (illustrationStyle) {
      case 'gradient':
        return (
          <LinearGradient
            colors={[
              colors.primary + '20',
              colors.primary + '10',
              'transparent',
            ]}
            style={baseStyle}
          />
        );

      case 'glass':
        return (
          <BlurView
            intensity={20}
            tint={isDark ? 'dark' : 'light'}
            style={[
              baseStyle,
              {
                backgroundColor: tokens.whiteAlpha[100],
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          />
        );

      case 'neumorphic':
        return (
          <View
            style={[
              baseStyle,
              {
                backgroundColor: colors.surface,
                shadowColor: isDark ? colors.white : colors.black,
                shadowOpacity: isDark ? 0.05 : 0.1,
              },
              SHADOWS.md,
            ]}
          />
        );

      default: // minimal
        return (
          <View
            style={[
              baseStyle,
              { backgroundColor: colors.surface }
            ]}
          />
        );
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MotiView
        from={animated ? { opacity: 0, scale: 0.9 } : {}}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 120,
        }}
        style={[
          styles.content,
          {
            paddingHorizontal: config.padding,
            maxWidth: screenWidth * 0.85,
          }
        ]}
      >
        {showIcon && (
          <MotiView
            from={animated ? { opacity: 0, translateY: -20, scale: 0.8 } : {}}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 120,
              delay: 200,
            }}
            style={[
              styles.iconContainer,
              {
                width: config.iconContainer,
                height: config.iconContainer,
                borderRadius: config.iconContainer / 2,
              }
            ]}
          >
            {renderIconBackground()}
            <Ionicons
              name={icon}
              size={config.iconSize}
              color={getIconColor()}
              style={{ zIndex: 2 }}
            />
          </MotiView>
        )}

        <MotiView
          from={animated ? { opacity: 0, translateY: 20 } : {}}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: tokens.duration.slow * 2,
            delay: 300,
          }}
          style={[styles.textContainer, { marginBottom: config.spacing }]}
        >
          <Text style={[
            typography.h3,
            styles.title,
            {
              color: colors.text,
              fontSize: config.titleSize,
              marginBottom: tokens.spacing.xs,
            }
          ]}>
            {title}
          </Text>
          <Text style={[
            typography.body,
            styles.message,
            {
              color: colors.textSecondary,
              fontSize: config.messageSize,
            }
          ]}>
            {message}
          </Text>
        </MotiView>

        {(onAction || onSecondaryAction) && (
          <MotiView
            from={animated ? { opacity: 0, translateY: 20 } : {}}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'spring',
              damping: 12,
              stiffness: 100,
              delay: 400,
            }}
            style={styles.buttonContainer}
          >
            {onAction && (
              <ModernButton
                variant={variant === 'error' ? 'outline' : 'gradient'}
                size={size === 'lg' ? 'lg' : 'md'}
                onPress={handleActionPress}
                style={styles.primaryButton}
                accessibilityLabel={`${actionText} button`}
                accessibilityHint="Tap to perform the suggested action"
              >
                {actionText}
              </ModernButton>
            )}
            
            {onSecondaryAction && secondaryActionText && (
              <ModernButton
                variant="ghost"
                size={size === 'lg' ? 'lg' : 'md'}
                onPress={handleSecondaryActionPress}
                style={[styles.secondaryButton, { marginTop: tokens.spacing.sm }]}
                accessibilityLabel={`${secondaryActionText} button`}
                accessibilityHint="Tap to perform the secondary action"
              >
                {secondaryActionText}
              </ModernButton>
            )}
          </MotiView>
        )}
      </MotiView>
    </View>
  );
};

// Preset variants for common use cases
export const SearchEmptyState: React.FC<Omit<EnhancedEmptyStateProps, 'variant'>> = (props) => (
  <EnhancedEmptyState
    variant="search"
    icon="search-outline"
    title="No results found"
    message="Try adjusting your search terms or filters"
    illustrationStyle="gradient"
    {...props}
  />
);

export const NetworkEmptyState: React.FC<Omit<EnhancedEmptyStateProps, 'variant'>> = (props) => (
  <EnhancedEmptyState
    variant="network"
    icon="wifi-outline"
    title="Connection lost"
    message="Check your internet connection and try again"
    illustrationStyle="glass"
    actionText="Retry"
    {...props}
  />
);

export const FilterEmptyState: React.FC<Omit<EnhancedEmptyStateProps, 'variant'>> = (props) => (
  <EnhancedEmptyState
    variant="filter"
    icon="funnel-outline"
    title="No results with current filters"
    message="Try adjusting or clearing your filters to see more content"
    illustrationStyle="gradient"
    actionText="Clear filters"
    secondaryActionText="Adjust filters"
    {...props}
  />
);

export const ReviewsEmptyState: React.FC<Omit<EnhancedEmptyStateProps, 'variant'>> = (props) => (
  <EnhancedEmptyState
    variant="reviews"
    icon="document-text-outline"
    title="No reviews yet"
    message="Be the first to share your dating experiences and help others make better choices"
    illustrationStyle="gradient"
    actionText="Write a review"
    {...props}
  />
);

export const ChatsEmptyState: React.FC<Omit<EnhancedEmptyStateProps, 'variant'>> = (props) => (
  <EnhancedEmptyState
    variant="chats"
    icon="chatbubbles-outline"
    title="No conversations yet"
    message="Start meaningful conversations with people who share similar experiences"
    illustrationStyle="glass"
    actionText="Find conversations"
    {...props}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  content: {
    alignItems: 'center',
    textAlign: 'center',
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: tokens.fontWeight.semibold,
    letterSpacing: tokens.letterSpacing.tight,
  },
  message: {
    textAlign: 'center',
    letterSpacing: tokens.letterSpacing.normal,
    lineHeight: tokens.lineHeight.base * 1.2,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    minWidth: 160,
  },
  secondaryButton: {
    minWidth: 140,
  },
});

export default EnhancedEmptyState;