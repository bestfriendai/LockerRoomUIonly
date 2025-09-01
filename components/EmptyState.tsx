import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Heart, MapPin, PlusCircle, Search, Users } from 'lucide-react-native';
import { useTheme } from '../providers/ThemeProvider';
import { createTypographyStyles } from '../styles/typography';
import { Button } from './ui/Button';
import { useRouter } from 'expo-router';

interface EmptyStateProps {
  type?: 'no-reviews' | 'no-location-reviews' | 'no-search-results' | 'no-matches';
  location?: string;
  searchRadius?: number;
  onCreateReview?: () => void;
  onChangeLocation?: () => void;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-reviews',
  location,
  searchRadius,
  onCreateReview,
  onChangeLocation,
  onClearFilters,
}) => {
  const { colors } = useTheme();
  const typography = createTypographyStyles(colors);
  const router = useRouter();

  const getContent = () => {
    switch (type) {
      case 'no-location-reviews':
        return {
          icon: <MapPin size={64} color={colors.textTertiary} strokeWidth={1.5} />,
          title: 'No Reviews in Your Area',
          subtitle: location 
            ? `We couldn't find any reviews within ${searchRadius} miles of ${location}.`
            : `We couldn't find any reviews within ${searchRadius} miles of your location.`,
          primaryAction: {
            label: 'Be the First to Review',
            onPress: onCreateReview || (() => router.push('/(tabs)/create')),
          },
          secondaryAction: {
            label: 'Change Location',
            onPress: onChangeLocation,
          },
          tips: [
            'Try expanding your search radius',
            'Check back later as new reviews are added daily',
            'Be the first to share your experiences in this area',
          ],
        };

      case 'no-search-results':
        return {
          icon: <Search size={64} color={colors.textTertiary} strokeWidth={1.5} />,
          title: 'No Results Found',
          subtitle: 'We couldn\'t find any reviews matching your search criteria.',
          primaryAction: {
            label: 'Clear Filters',
            onPress: onClearFilters,
          },
          tips: [
            'Try using different keywords',
            'Check your spelling',
            'Use more general search terms',
          ],
        };

      case 'no-matches':
        return {
          icon: <Users size={64} color={colors.textTertiary} strokeWidth={1.5} />,
          title: 'No Matches Yet',
          subtitle: 'You haven\'t matched with anyone yet. Keep exploring!',
          primaryAction: {
            label: 'Browse Reviews',
            onPress: () => router.push('/(tabs)/search'),
          },
          tips: [
            'Like more profiles to increase your chances',
            'Update your profile to attract more matches',
            'Check back regularly for new members',
          ],
        };

      default:
        return {
          icon: <Heart size={64} color={colors.textTertiary} strokeWidth={1.5} />,
          title: 'No Reviews Yet',
          subtitle: 'Be the first to share your dating experiences and help others in the community.',
          primaryAction: {
            label: 'Create First Review',
            onPress: onCreateReview || (() => router.push('/(tabs)/create')),
          },
          tips: [
            'Share your authentic dating experiences',
            'Help others make informed decisions',
            'Build a supportive community',
          ],
        };
    }
  };

  const content = getContent();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { backgroundColor: colors.surface }]}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.surfaceElevated }]}>
          {content.icon}
        </View>

        {/* Title */}
        <Text style={[styles.title, typography.h2, { color: colors.text }]}>
          {content.title}
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, typography.body, { color: colors.textSecondary }]}>
          {content.subtitle}
        </Text>

        {/* Tips Section */}
        {content.tips && (
          <View style={[styles.tipsContainer, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[styles.tipsTitle, typography.caption, { color: colors.textTertiary }]}>
              HELPFUL TIPS
            </Text>
            {content.tips.map((tip, index) => (
              <View key={index} style={styles.tipRow}>
                <Text style={[styles.tipBullet, { color: colors.primary }]}>•</Text>
                <Text style={[styles.tipText, typography.caption, { color: colors.textSecondary }]}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {content.primaryAction && (
            <Button
              onPress={content.primaryAction.onPress}
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<PlusCircle size={20} color={colors.onPrimary} />}
            >
              {content.primaryAction.label}
            </Button>
          )}
          
          {content.secondaryAction && (
            <Pressable
              onPress={content.secondaryAction.onPress}
              style={({ pressed }) => [
                styles.secondaryButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Text style={[typography.body, { color: colors.primary }]}>
                {content.secondaryAction.label}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Decorative Elements */}
      <View style={[styles.decorativeCircle1, { backgroundColor: colors.primary + '10' }]} />
      <View style={[styles.decorativeCircle2, { backgroundColor: colors.primary + '08' }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  tipsContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: -2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    width: '100%',
    gap: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    right: -50,
    opacity: 0.5,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -30,
    left: -30,
    opacity: 0.5,
  },
});