import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MasonryFlashList } from "@shopify/flash-list";

// Import our new components
import { ModernButton } from '../ui/ModernButton';
import { ModernCard } from '../ui/ModernCard';
import { EmptyState } from '../ui/EmptyState';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, borderRadius, shadows } from '../../utils/spacing';
import { textStyles } from '../../utils/typography';
import { createStaggerAnimation, createFadeInAnimation } from '../../utils/animations';

// Types
import { Review } from "../../types";

interface EnhancedDiscoverScreenProps {
  reviews: Review[];
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  categories: Array<{ id: string; label: string }>;
}

const CategoryPill = React.memo(({ 
  category, 
  isSelected, 
  onPress, 
  index 
}: {
  category: { id: string; label: string };
  isSelected: boolean;
  onPress: () => void;
  index: number;
}) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      createFadeInAnimation(fadeAnim, 300, index * 50),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            isSelected 
              ? [colors.primary, `${colors.primary}CC`]
              : ['transparent', 'transparent']
          }
          style={[
            styles.categoryPill,
            {
              borderColor: isSelected ? 'transparent' : colors.border,
              ...shadows.sm,
            }
          ]}
        >
          <Text
            style={[
              textStyles.label,
              {
                color: isSelected ? colors.white : colors.text,
                fontSize: 14,
              }
            ]}
          >
            {category.label}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

const EnhancedReviewCard = React.memo(({ 
  review, 
  onPress, 
  index 
}: { 
  review: Review; 
  onPress: () => void; 
  index: number;
}) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      createFadeInAnimation(fadeAnim, 500, index * 100),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: translateYAnim }],
        marginBottom: spacing.md,
      }}
    >
      <ModernCard
        variant="gradient"
        onPress={onPress}
        padding="lg"
        style={styles.reviewCard}
      >
        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <LinearGradient
            colors={
              (review.rating || 0) >= 4 
                ? [colors.success, `${colors.success}DD`]
                : [colors.error, `${colors.error}DD`]
            }
            style={styles.ratingGradient}
          >
            <Ionicons name="star" size={12} color={colors.white} />
            <Text style={[textStyles.caption, { color: colors.white, marginLeft: 4 }]}>
              {review.rating || 0}/5
            </Text>
          </LinearGradient>
        </View>

        {/* Review Type Badge */}
        <View style={styles.reviewTypeBadge}>
          <Text style={[textStyles.caption, { fontSize: 12 }]}>
            {review.isGreenFlag ? '🟢 Green Flag' : '🔴 Red Flag'}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={[textStyles.h4, { marginBottom: spacing.xs }]} numberOfLines={2}>
            {review.title}
          </Text>
          
          <Text style={[textStyles.body, { color: colors.textSecondary }]} numberOfLines={3}>
            {review.content}
          </Text>

          {/* Meta Information */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={14} color={colors.textTertiary} />
              <Text style={[textStyles.caption, { marginLeft: 4 }]}>
                {review.isAnonymous ? 'Anonymous' : 'User'}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
              <Text style={[textStyles.caption, { marginLeft: 4 }]}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Interaction Bar */}
          <View style={styles.interactionBar}>
            <TouchableOpacity style={styles.interactionButton}>
              <Ionicons name="heart-outline" size={18} color={colors.textSecondary} />
              <Text style={[textStyles.caption, { marginLeft: 4 }]}>
                {review.likes || 0}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.interactionButton}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
              <Text style={[textStyles.caption, { marginLeft: 4 }]}>
                {review.comments || 0}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.interactionButton}>
              <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ModernCard>
    </Animated.View>
  );
});

export const EnhancedDiscoverScreen: React.FC<EnhancedDiscoverScreenProps> = ({
  reviews,
  onRefresh,
  refreshing,
  selectedCategory,
  onCategorySelect,
  categories,
}) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [searchRadius, setSearchRadius] = useState(50);

  const filteredReviews = useMemo(() => {
    if (selectedCategory === "All") {
      return reviews;
    }
    return reviews.filter(review => review.category === selectedCategory);
  }, [selectedCategory, reviews]);

  const renderReviewItem = useCallback(({ item, index }: { item: Review; index: number }) => (
    <EnhancedReviewCard
      review={item}
      onPress={() => router.push(`/review/${item.id}`)}
      index={index}
    />
  ), [router]);

  const keyExtractor = useCallback((item: Review) => item._id || item.id, []);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={isDark ? [colors.surface, colors.background] : [colors.background, colors.surface]}
        style={styles.headerGradient}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.locationPill}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={[textStyles.body, { color: colors.text, marginLeft: 4 }]}>
              San Francisco, CA
            </Text>
            <TouchableOpacity>
              <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <Text style={[textStyles.h1, { textAlign: 'center', marginVertical: spacing.md }]}>
            Discover
          </Text>
          <Text style={[textStyles.body, { 
            textAlign: 'center', 
            color: colors.textSecondary,
            marginBottom: spacing.lg 
          }]}>
            Real experiences from real people
          </Text>
        </BlurView>
      </LinearGradient>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category, index) => (
          <CategoryPill
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            onPress={() => onCategorySelect(category.id)}
            index={index}
          />
        ))}
      </ScrollView>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ModernButton
          variant="ghost"
          size="sm"
          onPress={() => {}}
          icon={<Ionicons name="options-outline" size={20} color={colors.textSecondary} />}
        >
          Filters
        </ModernButton>
        
        <ModernButton
          variant="ghost"
          size="sm"
          onPress={() => {}}
          icon={<Ionicons name="funnel-outline" size={20} color={colors.textSecondary} />}
        >
          Sort
        </ModernButton>
        
        <ModernButton
          variant="outline"
          size="sm"
          onPress={() => {}}
          icon={<Ionicons name="navigate-outline" size={20} color={colors.primary} />}
        >
          {searchRadius} mi
        </ModernButton>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <MasonryFlashList
        data={filteredReviews}
        renderItem={renderReviewItem}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            type="no-reviews"
            onAction={() => router.push('/(tabs)/create')}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={350}
        keyExtractor={keyExtractor}
        removeClippedSubviews={true}
        drawDistance={500}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: spacing.lg,
  },
  headerGradient: {
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
  },
  headerBlur: {
    paddingHorizontal: spacing.lg,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  categoryScroll: {
    marginBottom: spacing.lg,
  },
  categoryContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryPill: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: spacing.lg,
  },
  reviewCard: {
    marginBottom: spacing.md,
  },
  ratingBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
  },
  ratingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  reviewTypeBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    zIndex: 1,
  },
  cardContent: {
    marginTop: spacing.lg,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default EnhancedDiscoverScreen;
