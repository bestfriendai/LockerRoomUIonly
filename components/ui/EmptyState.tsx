import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ModernButton } from './ModernButton';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, borderRadius } from '../../utils/spacing';
import { textStyles } from '../../utils/typography';

interface EmptyStateProps {
  type: 'no-reviews' | 'no-matches' | 'no-notifications' | 'no-connection' | 'no-results' | 'no-chats';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  illustration?: React.ReactNode;
  showIllustration?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction,
  illustration,
  showIllustration = true,
}) => {
  const { colors } = useTheme();

  const getEmptyStateContent = () => {
    switch (type) {
      case 'no-reviews':
        return {
          icon: 'document-text-outline' as const,
          title: title || 'No Reviews Yet',
          description: description || 'Be the first to share your dating experience and help the community grow!',
          actionText: actionText || 'Write Your First Review',
        };
      case 'no-matches':
        return {
          icon: 'search-outline' as const,
          title: title || 'No Matches Found',
          description: description || 'Try adjusting your filters or expanding your search radius to find more reviews.',
          actionText: actionText || 'Adjust Filters',
        };
      case 'no-notifications':
        return {
          icon: 'notifications-outline' as const,
          title: title || 'All Caught Up!',
          description: description || 'No new notifications right now. Check back later for updates from the community.',
          actionText: actionText || 'Explore Reviews',
        };
      case 'no-connection':
        return {
          icon: 'cloud-offline-outline' as const,
          title: title || 'Connection Lost',
          description: description || 'Please check your internet connection and try again.',
          actionText: actionText || 'Retry',
        };
      case 'no-results':
        return {
          icon: 'search-outline' as const,
          title: title || 'No Results Found',
          description: description || 'We couldn\'t find anything matching your search. Try different keywords.',
          actionText: actionText || 'Clear Search',
        };
      case 'no-chats':
        return {
          icon: 'chatbubbles-outline' as const,
          title: title || 'No Conversations Yet',
          description: description || 'Start connecting with others by joining chat rooms or starting new conversations.',
          actionText: actionText || 'Browse Chat Rooms',
        };
      default:
        return {
          icon: 'help-circle-outline' as const,
          title: title || 'Nothing Here',
          description: description || 'There\'s nothing to show right now.',
          actionText: actionText || 'Go Back',
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <View style={styles.container}>
      {showIllustration && (
        <LinearGradient
          colors={[`${colors.primary}10`, `${colors.primary}05`]}
          style={styles.illustrationContainer}
        >
          {illustration || (
            <Ionicons
              name={content.icon}
              size={64}
              color={colors.primary}
            />
          )}
        </LinearGradient>
      )}

      <Text style={[styles.title, { color: colors.text }]}>
        {content.title}
      </Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {content.description}
      </Text>

      {onAction && (
        <ModernButton
          variant="gradient"
          onPress={onAction}
          style={styles.actionButton}
        >
          {content.actionText}
        </ModernButton>
      )}
    </View>
  );
};

// Specialized empty state components for convenience
export const NoReviewsState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="no-reviews" {...props} />
);

export const NoMatchesState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="no-matches" {...props} />
);

export const NoNotificationsState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="no-notifications" {...props} />
);

export const NoConnectionState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="no-connection" {...props} />
);

export const NoResultsState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="no-results" {...props} />
);

export const NoChatsState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="no-chats" {...props} />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['4xl'],
  },
  illustrationContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...textStyles.h3,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...textStyles.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing['2xl'],
    maxWidth: 280,
  },
  actionButton: {
    minWidth: 200,
  },
});

export default EmptyState;
