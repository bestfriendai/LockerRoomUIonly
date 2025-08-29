import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { View, StyleSheet, TextInput, Keyboard, ScrollView, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search as SearchIcon, X, TrendingUp, Clock, User, SlidersHorizontal, MapPin, Star, Calendar, MessageCircle, ArrowUpDown } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "@/providers/ThemeProvider";
import Text from "@/components/ui/Text";
import { mockReviews, mockUsers, mockChatRooms } from "@/data/mockData";
import { ReviewCard } from "@/components/ReviewCard";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";

type SearchTab = 'reviews' | 'users' | 'rooms';
type SortOption = 'relevance' | 'date' | 'rating' | 'popularity';

export default function SearchScreen() {
  const router = useRouter();
  const { colors, tokens, isDark } = useTheme();
  const searchInputRef = useRef<TextInput>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>('reviews');
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("Any");
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  // Search history
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Communication style",
    "Professional behavior",
    "Active listening"
  ]);
  const [trendingSearches] = useState<string[]>([
    "Communication style",
    "Professional behavior",
    "Active listening",
    "Emotional maturity",
    "Consistency",
    "Time management"
  ]);

  // Filter options
  const categories = ["All", "dating", "social", "professional", "social_media", "app"];
  const ratingFilters = [5, 4, 3, 2, 1];
  const dateFilters = ["Any", "Today", "This Week", "This Month", "This Year"];
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date', label: 'Recent' },
    { value: 'rating', label: 'Rating' },
    { value: 'popularity', label: 'Popular' }
  ];
  const tabs: { value: SearchTab; label: string; icon: any }[] = [
    { value: 'reviews', label: 'Reviews', icon: Star },
    { value: 'users', label: 'Users', icon: User },
    { value: 'rooms', label: 'Rooms', icon: MessageCircle }
  ];

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search results based on active tab and query
  const searchResults = useMemo(() => {
    if (debouncedQuery.length < 2) return [];

    const query = debouncedQuery.toLowerCase();

    let results: any[] = [];
    switch (activeTab) {
      case 'reviews':
        results = mockReviews.filter(review =>
          review.content?.toLowerCase().includes(query) ||
          review.title?.toLowerCase().includes(query) ||
          review.category?.toLowerCase().includes(query)
        );
        break;
      case 'users':
        results = mockUsers.filter(user =>
          user.username?.toLowerCase().includes(query) ||
          user.bio?.toLowerCase().includes(query)
        );
        break;
      case 'rooms':
        results = mockChatRooms.filter(room =>
          room.name.toLowerCase().includes(query) ||
          room.description?.toLowerCase().includes(query)
        );
        break;
    }

    // Apply filters
    if (selectedCategory !== "All" && activeTab === 'reviews') {
      results = results.filter((item: any) => item.category === selectedCategory);
    }

    if (selectedRating && activeTab === 'reviews') {
      results = results.filter((item: any) => item.rating >= selectedRating);
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          const dateA = new Date(a._creationTime || 0).getTime();
          const dateB = new Date(b._creationTime || 0).getTime();
          return dateB - dateA;
        case 'rating':
          if (activeTab === 'reviews') {
            return (b.rating || 0) - (a.rating || 0);
          }
          return 0;
        case 'popularity':
          if (activeTab === 'reviews') {
            return (b.helpfulCount || 0) - (a.helpfulCount || 0);
          } else if (activeTab === 'rooms') {
            return (b.memberIds?.length || 0) - (a.memberIds?.length || 0);
          }
          return 0;
        case 'relevance':
        default:
          return 0;
      }
    });

    return results;
  }, [debouncedQuery, activeTab, selectedCategory, selectedRating, sortBy]);

  const handleSearchSubmit = useCallback((query: string) => {
    if (query.trim() !== "" && !recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches.slice(0, 9)]);
    }
  }, [recentSearches]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      handleSearchSubmit(query);
    }
  }, [handleSearchSubmit]);

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    searchInputRef.current?.focus();
  };

  const renderSearchResult = ({ item, index }: { item: any; index: number }) => {
    switch (activeTab) {
      case 'reviews':
        return (
          <ReviewCard
            review={item}
            onPress={() => router.push(`/review/${item._id}`)}
            style={{ marginBottom: 12 }}
          />
        );
      case 'users':
        return (
          <Pressable
            onPress={() => router.push(`/profile/${item._id}`)}
            style={({ pressed }) => [
              styles.userResult,
              {
                backgroundColor: pressed ? colors.surfaceElevated : colors.card,
                borderColor: colors.border,
              }
            ]}
          >
            <Avatar size="md" name={item.username} src={item.profilePicture} />
            <View style={styles.userInfo}>
              <Text variant="body" weight="normal">
                {item.username}
              </Text>
              {item.bio && (
                <Text variant="bodySmall" style={{ color: colors.textSecondary }} numberOfLines={2}>
                  {item.bio}
                </Text>
              )}
              <View style={styles.userStats}>
                <Text variant="caption" style={{ color: colors.textSecondary }}>
                  {item.reviewCount || 0} reviews
                </Text>
                <Text variant="caption" style={{ color: colors.textSecondary }}>
                  • {item.averageRating?.toFixed(1) || '0.0'} ★
                </Text>
              </View>
            </View>
          </Pressable>
        );
      case 'rooms':
        return (
          <Pressable
            onPress={() => router.push(`/chat/${item._id}`)}
            style={({ pressed }) => [
              styles.roomResult,
              {
                backgroundColor: pressed ? colors.surfaceElevated : colors.card,
                borderColor: colors.border,
              }
            ]}
          >
            <View style={[styles.roomIcon, { backgroundColor: colors.primary }]}>
              <MessageCircle size={20} color={colors.surface} strokeWidth={1.5} />
            </View>
            <View style={styles.roomInfo}>
              <Text variant="body" weight="normal">
                {item.name}
              </Text>
              {item.description && (
                <Text variant="bodySmall" style={{ color: colors.textSecondary }} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              <View style={styles.roomStats}>
                <Text variant="caption" style={{ color: colors.textSecondary }}>
                  {item.memberIds?.length || 0} members
                </Text>
                <Text variant="caption" style={{ color: colors.textSecondary }}>
                  • {item.type}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      default:
        return null;
    }
  };

  const renderEmptyState = () => {
    if (searchQuery.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.searchSection}>
              <View style={styles.sectionHeader}>
                <Clock size={16} color={colors.textSecondary} strokeWidth={1.5} />
                <Text variant="body" weight="normal" style={{ marginLeft: 8 }}>
                  Recent Searches
                </Text>
              </View>
              {recentSearches.map((search, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleSearch(search)}
                  style={styles.searchItem}
                >
                  <Text variant="body" style={{ color: colors.text }}>
                    {search}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Trending Searches */}
          <View style={styles.searchSection}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={16} color={colors.textSecondary} strokeWidth={1.5} />
              <Text variant="body" weight="normal" style={{ marginLeft: 8 }}>
                Trending
              </Text>
            </View>
            {trendingSearches.map((search, index) => (
              <Pressable
                key={index}
                onPress={() => handleSearch(search)}
                style={styles.searchItem}
              >
                <Text variant="body" style={{ color: colors.text }}>
                  {search}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      );
    }

    if (debouncedQuery.length < 2) {
      return (
        <View style={styles.emptyContainer}>
          <Text variant="body" style={{ color: colors.textSecondary, textAlign: "center" }}>
            Type at least 2 characters to search
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text variant="body" style={{ color: colors.textSecondary, textAlign: "center" }}>
          No results found for "{debouncedQuery}"
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={[styles.searchHeader, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceElevated }]}>
          <SearchIcon size={20} color={colors.textSecondary} strokeWidth={1.5} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search reviews, users, or rooms..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => handleSearchSubmit(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={colors.textSecondary} strokeWidth={1.5} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterButton, { backgroundColor: colors.surfaceElevated }]}
        >
          <SlidersHorizontal size={18} color={colors.text} strokeWidth={1.5} />
        </Pressable>
      </View>

      {/* Search Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <Pressable
              key={tab.value}
              onPress={() => setActiveTab(tab.value)}
              style={[
                styles.tab,
                isActive && { borderBottomColor: colors.primary }
              ]}
            >
              <Icon
                size={16}
                color={isActive ? colors.primary : colors.textSecondary}
                strokeWidth={1.5}
              />
              <Text
                variant="bodySmall"
                weight={isActive ? "medium" : "normal"}
                style={{
                  color: isActive ? colors.primary : colors.textSecondary,
                  marginLeft: 6
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Results */}
      {searchResults.length > 0 ? (
        <FlashList
          data={searchResults}
          renderItem={renderSearchResult}
          estimatedItemSize={120}
          contentContainerStyle={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item._id}
        />
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
  },
  filterButton: {
    alignItems: "center",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  resultsContainer: {
    padding: 16,
  },
  roomIcon: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  roomInfo: {
    flex: 1,
    marginLeft: 12,
  },
  roomResult: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    marginBottom: 8,
    padding: 16,
  },
  roomStats: {
    flexDirection: "row",
    marginTop: 4,
  },
  searchBar: {
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchHeader: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
  },
  searchItem: {
    borderRadius: 8,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 12,
  },
  tab: {
    alignItems: "center",
    borderBottomColor: "transparent",
    borderBottomWidth: 2,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
  },
  tabsContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userResult: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    marginBottom: 8,
    padding: 16,
  },
  userStats: {
    flexDirection: "row",
    marginTop: 4,
  },
});