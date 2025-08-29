import React, { useState, useCallback, useEffect, memo, useMemo } from "react";
import { View, StyleSheet, RefreshControl, ScrollView, Platform, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MapPin, ChevronDown, Search, Bell, Target } from "lucide-react-native";
import { MasonryFlashList } from "@shopify/flash-list";
import { useAuth } from "@/providers/AuthProvider";
import { MasonryReviewCard } from "@/components/MasonryReviewCard";
import { useTheme } from "@/providers/ThemeProvider";
import { Review } from "@/data/mockData";
import Text from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { mockReviews } from "@/data/mockData";
import { FILTER_CATEGORIES } from "@/constants/categories";

const RADIUS_OPTIONS = [5, 10, 15, 25, 50, 100]; // miles

// Memoized category pill component for better performance
const CategoryPill = memo(({
  category,
  isSelected,
  onPress,
  colors
}: {
  category: { id: string; label: string };
  isSelected: boolean;
  onPress: () => void;
  colors: any;
}) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.categoryPill,
      {
        backgroundColor: isSelected ? colors.chipBgActive : colors.chipBg,
        borderColor: colors.chipBorder,
      }
    ]}
    accessibilityRole="button"
    accessibilityState={{ selected: isSelected }}
  >
    <Text
      variant="bodySmall"
      weight={isSelected ? "medium" : "normal"}
      style={{
        color: isSelected ? colors.chipTextActive : colors.chipText
      }}
    >
      {category.label}
    </Text>
  </Pressable>
));

CategoryPill.displayName = 'CategoryPill';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [useRadiusFilter, setUseRadiusFilter] = useState(true);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [searchRadius, setSearchRadius] = useState(25);
  const [currentLocation] = useState({
    city: "Washington",
    state: "DC",
    coords: { latitude: 38.9072, longitude: -77.0369 }
  });

  // Filter reviews based on selected category
  const filteredReviews = useMemo(() => {
    if (selectedCategory === "All") {
      return mockReviews;
    }
    return mockReviews.filter(review => review.category === selectedCategory);
  }, [selectedCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const onSelectCategory = useCallback((id: string) => {
    setSelectedCategory(id);
  }, []);

  const renderReviewItem = useCallback(({ item, index }: { item: Review; index: number }) => (
    <View style={{ marginBottom: 16 }}>
      <MasonryReviewCard
        review={item}
        onPress={() => router.push(`/review/${item._id}`)}
      />
    </View>
  ), [router]);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Location Header */}
      <View style={styles.locationHeader}>
        <View style={styles.locationInfo}>
          <MapPin size={16} color={colors.textSecondary} strokeWidth={1.5} />
          <Text variant="bodySmall" style={{ color: colors.textSecondary, marginLeft: 4 }}>
            {currentLocation.city}, {currentLocation.state}
          </Text>
          <Pressable
            onPress={() => setShowRadiusModal(true)}
            style={styles.radiusButton}
          >
            <Text variant="bodySmall" style={{ color: colors.primary, marginLeft: 8 }}>
              {searchRadius} mi
            </Text>
            <ChevronDown size={14} color={colors.primary} strokeWidth={1.5} />
          </Pressable>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push("/search")}
            style={[styles.headerButton, { backgroundColor: colors.surfaceElevated }]}
          >
            <Search size={18} color={colors.text} strokeWidth={1.5} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/notifications")}
            style={[styles.headerButton, { backgroundColor: colors.surfaceElevated }]}
          >
            <Bell size={18} color={colors.text} strokeWidth={1.5} />
          </Pressable>
        </View>
      </View>

      {/* Title */}
      <Text variant="h1" style={styles.title}>
        Discover
      </Text>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScroll}
      >
        {FILTER_CATEGORIES.map((category) => (
          <CategoryPill
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            onPress={() => onSelectCategory(category.id)}
            colors={colors}
          />
        ))}
      </ScrollView>

      {/* Filter Toggle */}
      <View style={styles.filterToggle}>
        <Pressable
          onPress={() => setUseRadiusFilter(!useRadiusFilter)}
          style={[
            styles.filterButton,
            {
              backgroundColor: useRadiusFilter ? colors.primary : colors.surfaceElevated,
            }
          ]}
        >
          <Target
            size={16}
            color={useRadiusFilter ? colors.surface : colors.text}
            strokeWidth={1.5}
          />
          <Text
            variant="bodySmall"
            weight="medium"
            style={{
              color: useRadiusFilter ? colors.surface : colors.text,
              marginLeft: 6
            }}
          >
            Radius Filter
          </Text>
        </Pressable>
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
        keyExtractor={(item) => item._id || item.id}
      />

      {/* Radius Selection Modal */}
      <Modal
        visible={showRadiusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRadiusModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowRadiusModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text variant="h3" style={styles.modalTitle}>
              Search Radius
            </Text>
            {RADIUS_OPTIONS.map((radius) => (
              <Pressable
                key={radius}
                onPress={() => {
                  setSearchRadius(radius);
                  setShowRadiusModal(false);
                }}
                style={[
                  styles.radiusOption,
                  {
                    backgroundColor: searchRadius === radius ? colors.primary : 'transparent',
                  }
                ]}
              >
                <Text
                  variant="body"
                  style={{
                    color: searchRadius === radius ? colors.surface : colors.text
                  }}
                >
                  {radius} miles
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    gap: 8,
    paddingRight: 16,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoryPill: {
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  container: {
    flex: 1,
  },
  filterButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 16,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterToggle: {
    marginBottom: 8,
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  locationHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  locationInfo: {
    alignItems: "center",
    flexDirection: "row",
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: "80%",
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flex: 1,
    justifyContent: "center",
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  radiusButton: {
    alignItems: "center",
    flexDirection: "row",
  },
  radiusOption: {
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    marginBottom: 20,
  },
});