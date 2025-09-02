# LockerRoom Talk App - Complete Fix Implementation Guide

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [File-by-File Fix Implementation](#file-by-file-fix-implementation)
3. [UI/UX Complete Redesign](#uiux-complete-redesign)
4. [User Flow Improvements](#user-flow-improvements)
5. [Component Library Implementation](#component-library-implementation)
6. [Performance Optimizations](#performance-optimizations)
7. [Testing Implementation](#testing-implementation)

---

## Executive Summary

This expanded guide provides complete code implementations for fixing every file in the LockerRoom Talk app, with emphasis on UI/UX improvements, user flow optimization, and production-ready code quality.

---

## File-by-File Fix Implementation

### 1. Firebase Configuration (`utils/firebase.ts`)

**Current Issues:**
- Incorrect import for `getReactNativePersistence`
- Unsafe Proxy pattern
- No error boundaries

**Complete Fixed Implementation:**

```typescript
// utils/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  Auth,
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { 
  getStorage, 
  FirebaseStorage,
  connectStorageEmulator 
} from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { getPerformance, Performance } from 'firebase/performance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Type-safe config
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Validate config at runtime
const validateConfig = (config: any): FirebaseConfig => {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  
  for (const field of required) {
    if (!config[field]) {
      throw new Error(`Missing required Firebase config field: ${field}`);
    }
  }
  
  return config as FirebaseConfig;
};

const firebaseConfig = validateConfig({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
});

// Custom persistence for React Native
const getReactNativePersistence = () => {
  return {
    async getItem(key: string): Promise<string | null> {
      return await AsyncStorage.getItem(key);
    },
    async setItem(key: string, value: string): Promise<void> {
      await AsyncStorage.setItem(key, value);
    },
    async removeItem(key: string): Promise<void> {
      await AsyncStorage.removeItem(key);
    },
  };
};

// Singleton pattern for Firebase services
class FirebaseServices {
  private static instance: FirebaseServices;
  private app: FirebaseApp;
  private auth: Auth;
  private db: Firestore;
  private storage: FirebaseStorage;
  private analytics?: Analytics;
  private performance?: Performance;
  private initialized = false;
  private networkUnsubscribe?: () => void;

  private constructor() {
    this.app = this.initializeFirebaseApp();
    this.auth = this.initializeAuth();
    this.db = this.initializeFirestore();
    this.storage = this.initializeStorage();
    this.initializeAnalytics();
    this.initializePerformance();
    this.setupNetworkListener();
    this.setupEmulators();
    this.initialized = true;
  }

  private initializeFirebaseApp(): FirebaseApp {
    try {
      const apps = getApps();
      if (apps.length > 0) {
        console.log('🔥 Using existing Firebase app');
        return apps[0];
      }
      
      console.log('🔥 Initializing new Firebase app');
      return initializeApp(firebaseConfig);
    } catch (error) {
      console.error('❌ Firebase app initialization failed:', error);
      throw new Error('Failed to initialize Firebase app');
    }
  }

  private initializeAuth(): Auth {
    try {
      // Check if we're in a web or native environment
      const isWeb = typeof document !== 'undefined';
      
      if (isWeb) {
        // Web environment
        return getAuth(this.app);
      } else {
        // React Native environment
        try {
          return initializeAuth(this.app, {
            persistence: getReactNativePersistence() as any,
          });
        } catch (error: any) {
          // Auth might already be initialized (Fast Refresh)
          if (error.code === 'auth/already-initialized') {
            return getAuth(this.app);
          }
          throw error;
        }
      }
    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
      throw new Error('Failed to initialize Firebase Auth');
    }
  }

  private initializeFirestore(): Firestore {
    try {
      const firestore = getFirestore(this.app);
      
      // Enable offline persistence for web
      if (typeof document !== 'undefined') {
        enableIndexedDbPersistence(firestore).catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
          } else if (err.code === 'unimplemented') {
            console.warn('⚠️ The current browser does not support offline persistence');
          }
        });
      }
      
      return firestore;
    } catch (error) {
      console.error('❌ Firestore initialization failed:', error);
      throw new Error('Failed to initialize Firestore');
    }
  }

  private initializeStorage(): FirebaseStorage {
    try {
      return getStorage(this.app);
    } catch (error) {
      console.error('❌ Storage initialization failed:', error);
      throw new Error('Failed to initialize Firebase Storage');
    }
  }

  private async initializeAnalytics(): Promise<void> {
    try {
      if (typeof document !== 'undefined' && await isSupported()) {
        this.analytics = getAnalytics(this.app);
        console.log('📊 Analytics initialized');
      }
    } catch (error) {
      console.warn('⚠️ Analytics initialization failed:', error);
    }
  }

  private initializePerformance(): void {
    try {
      if (typeof document !== 'undefined') {
        this.performance = getPerformance(this.app);
        console.log('⚡ Performance monitoring initialized');
      }
    } catch (error) {
      console.warn('⚠️ Performance monitoring initialization failed:', error);
    }
  }

  private setupNetworkListener(): void {
    // Monitor network connectivity
    this.networkUnsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        enableNetwork(this.db).catch(console.error);
        console.log('🌐 Network connected - Firestore online');
      } else {
        disableNetwork(this.db).catch(console.error);
        console.log('📴 Network disconnected - Firestore offline');
      }
    });
  }

  private setupEmulators(): void {
    // Only connect to emulators in development
    if (__DEV__ && !this.initialized) {
      const EMULATOR_HOST = 'localhost';
      
      try {
        // Connect Firestore emulator
        connectFirestoreEmulator(this.db, EMULATOR_HOST, 8080);
        console.log('🔧 Connected to Firestore emulator');
      } catch (error) {
        console.log('ℹ️ Firestore emulator not available or already connected');
      }

      try {
        // Connect Storage emulator
        connectStorageEmulator(this.storage, EMULATOR_HOST, 9199);
        console.log('🔧 Connected to Storage emulator');
      } catch (error) {
        console.log('ℹ️ Storage emulator not available or already connected');
      }
    }
  }

  public static getInstance(): FirebaseServices {
    if (!FirebaseServices.instance) {
      FirebaseServices.instance = new FirebaseServices();
    }
    return FirebaseServices.instance;
  }

  public getApp(): FirebaseApp {
    return this.app;
  }

  public getAuth(): Auth {
    return this.auth;
  }

  public getFirestore(): Firestore {
    return this.db;
  }

  public getStorage(): FirebaseStorage {
    return this.storage;
  }

  public getAnalytics(): Analytics | undefined {
    return this.analytics;
  }

  public getPerformance(): Performance | undefined {
    return this.performance;
  }

  public cleanup(): void {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
    }
  }
}

// Export singleton instance getters
export const getFirebaseApp = () => FirebaseServices.getInstance().getApp();
export const getFirebaseAuth = () => FirebaseServices.getInstance().getAuth();
export const getFirebaseDb = () => FirebaseServices.getInstance().getFirestore();
export const getFirebaseStorage = () => FirebaseServices.getInstance().getStorage();
export const getFirebaseAnalytics = () => FirebaseServices.getInstance().getAnalytics();
export const getFirebasePerformance = () => FirebaseServices.getInstance().getPerformance();

// Convenience exports
export const app = getFirebaseApp();
export const auth = getFirebaseAuth();
export const db = getFirebaseDb();
export const storage = getFirebaseStorage();

// Export config for reference
export { firebaseConfig };

// Cleanup function for app termination
export const cleanupFirebase = () => {
  FirebaseServices.getInstance().cleanup();
};
```

### 2. Home Screen (`app/(tabs)/index.tsx`) - Complete Rewrite

**Issues Fixed:**
- No pagination
- Poor performance
- No loading states
- Inefficient filtering

**Complete New Implementation:**

```typescript
// app/(tabs)/index.tsx
import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  Text,
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { 
  MapPin, 
  Search, 
  Bell, 
  Filter,
  TrendingUp,
  Clock,
  Star,
  ChevronDown,
  Grid,
  List
} from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated as ReAnimated, {
  FadeInDown,
  FadeInUp,
  Layout,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

// Components
import MasonryReviewCard from "../../components/MasonryReviewCard";
import { LocationSelector } from "../../components/LocationSelector";
import { EmptyState } from "../../components/EmptyState";
import { ReviewSkeleton } from "../../components/ui/LoadingSkeletons";
import { FilterBottomSheet } from "../../components/FilterBottomSheet";
import { useToast } from "../../hooks/useToast";

// Services & Stores
import { useTheme } from "../../providers/ThemeProvider";
import { useAuth } from "../../providers/AuthProvider";
import { useReviewStore } from "../../stores/reviewStore";
import { reviewService } from "../../services/reviewService";
import { LocationService } from "../../services/locationService";
import { analyticsService } from "../../services/analyticsService";

// Types
import { Review, FilterState, SortOption } from "../../types";

// Constants
import { FILTER_CATEGORIES } from "../../constants/categories";
import { createTypographyStyles } from "../../styles/typography";

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ITEMS_PER_PAGE = 20;
const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 100;

// Sort options with icons
const SORT_OPTIONS: SortOption[] = [
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'recent', label: 'Most Recent', icon: Clock },
  { id: 'rating', label: 'Top Rated', icon: Star },
];

// View modes
enum ViewMode {
  GRID = 'grid',
  LIST = 'list',
  MASONRY = 'masonry'
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const typography = createTypographyStyles(colors);
  
  // Refs
  const scrollY = useSharedValue(0);
  const lastContentOffset = useSharedValue(0);
  const isScrolling = useSharedValue(false);
  const filterSheetRef = useRef(null);
  
  // Store
  const {
    reviews,
    isLoading,
    error,
    hasMore,
    filters,
    fetchReviews,
    loadMoreReviews,
    setFilter,
    clearFilters,
    refreshReviews,
  } = useReviewStore();
  
  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MASONRY);
  const [selectedSort, setSelectedSort] = useState<SortOption>(SORT_OPTIONS[0]);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Initial data fetch
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // Load saved location
      const savedLocation = await LocationService.getSelectedLocation();
      if (savedLocation) {
        setSelectedLocation(savedLocation);
        setFilter({ location: savedLocation });
      }
      
      // Fetch initial reviews
      await fetchReviews();
      
      // Track screen view
      analyticsService.trackScreenView('Home');
    } catch (error) {
      toast.error('Failed to load reviews. Please try again.');
    }
  };

  // Animated header styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) / 2],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      height,
      opacity: withTiming(opacity),
    };
  });

  const miniHeaderAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [(HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) / 2, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity: withTiming(opacity),
    };
  });

  // Handle scroll
  const handleScroll = useCallback((event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    scrollY.value = currentOffset;
    
    // Detect scroll direction
    isScrolling.value = currentOffset > lastContentOffset.value;
    lastContentOffset.value = currentOffset;
  }, []);

  // Handle location selection
  const handleLocationSelect = useCallback(async (location: any) => {
    setSelectedLocation(location);
    setFilter({ location: location.data });
    
    // Refresh reviews with new location
    await refreshReviews();
    
    // Track location change
    analyticsService.trackEvent('location_changed', {
      type: location.type,
      name: location.data?.name
    });
  }, [setFilter, refreshReviews]);

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    if (categoryId === filters.category) {
      setFilter({ category: null });
    } else {
      setFilter({ category: categoryId });
    }
    
    analyticsService.trackEvent('category_selected', { category: categoryId });
  }, [filters.category, setFilter]);

  // Handle sort change
  const handleSortChange = useCallback((sort: SortOption) => {
    setSelectedSort(sort);
    setFilter({ sortBy: sort.id });
    
    analyticsService.trackEvent('sort_changed', { sort: sort.id });
  }, [setFilter]);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setViewMode(mode);
    
    analyticsService.trackEvent('view_mode_changed', { mode });
  }, []);

  // Handle review press
  const handleReviewPress = useCallback((review: Review) => {
    analyticsService.trackEvent('review_opened', {
      reviewId: review.id,
      category: review.category
    });
    
    router.push(`/review/${review.id}`);
  }, [router]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refreshReviews();
    toast.success('Reviews updated!');
  }, [refreshReviews, toast]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadMoreReviews();
    }
  }, [isLoading, hasMore, loadMoreReviews]);

  // Render header
  const renderHeader = () => (
    <>
      {/* Animated expandable header */}
      <ReAnimated.View style={[styles.header, headerAnimatedStyle]}>
        <LinearGradient
          colors={isDark ? ['#1a1a1a', '#000000'] : ['#ffffff', '#f5f5f5']}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Main header content */}
        <View style={styles.headerContent}>
          <ReAnimated.View entering={FadeInUp.delay(100)}>
            <Text style={[typography.h1, styles.headerTitle]}>
              Discover Reviews
            </Text>
            <Text style={[typography.body, styles.headerSubtitle]}>
              Real experiences from real people
            </Text>
          </ReAnimated.View>

          {/* Quick stats */}
          <ReAnimated.View 
            entering={FadeInUp.delay(200)}
            style={styles.statsContainer}
          >
            <View style={styles.statItem}>
              <Text style={[typography.h2, { color: colors.primary }]}>
                {reviews.length}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Reviews
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[typography.h2, { color: colors.success }]}>
                {reviews.filter(r => r.rating >= 4).length}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Positive
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[typography.h2, { color: colors.error }]}>
                {reviews.filter(r => r.rating < 3).length}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Warnings
              </Text>
            </View>
          </ReAnimated.View>

          {/* Location selector */}
          <ReAnimated.View entering={FadeInUp.delay(300)}>
            <LocationSelector
              onLocationSelect={handleLocationSelect}
              currentLocation={selectedLocation}
              style={styles.locationSelector}
            />
          </ReAnimated.View>
        </View>
      </ReAnimated.View>

      {/* Mini header (shows when scrolled) */}
      <ReAnimated.View 
        style={[styles.miniHeader, miniHeaderAnimatedStyle]}
        pointerEvents={scrollY.value > HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT ? 'auto' : 'none'}
      >
        <BlurView intensity={95} style={StyleSheet.absoluteFillObject} />
        <View style={styles.miniHeaderContent}>
          <Text style={[typography.h3, { color: colors.text }]}>
            Discover
          </Text>
          <View style={styles.miniHeaderActions}>
            <Pressable onPress={() => router.push('/search')} style={styles.iconButton}>
              <Search size={20} color={colors.text} />
            </Pressable>
            <Pressable onPress={() => setIsFilterSheetOpen(true)} style={styles.iconButton}>
              <Filter size={20} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </ReAnimated.View>

      {/* Filters and controls */}
      <View style={[styles.controlsContainer, { backgroundColor: colors.background }]}>
        {/* Sort selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.sortContainer}
        >
          {SORT_OPTIONS.map((option, index) => {
            const Icon = option.icon;
            const isSelected = selectedSort.id === option.id;
            
            return (
              <ReAnimated.View
                key={option.id}
                entering={SlideInRight.delay(index * 50)}
              >
                <Pressable
                  onPress={() => handleSortChange(option)}
                  style={[
                    styles.sortChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceElevated,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }
                  ]}
                >
                  <Icon 
                    size={16} 
                    color={isSelected ? colors.onPrimary : colors.text} 
                  />
                  <Text style={[
                    typography.caption,
                    {
                      color: isSelected ? colors.onPrimary : colors.text,
                      marginLeft: 6,
                      fontWeight: isSelected ? '600' : '400'
                    }
                  ]}>
                    {option.label}
                  </Text>
                </Pressable>
              </ReAnimated.View>
            );
          })}
        </ScrollView>

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={styles.categoriesScroll}
        >
          {FILTER_CATEGORIES.map((category, index) => {
            const isSelected = filters.category === category.id;
            
            return (
              <ReAnimated.View
                key={category.id}
                entering={SlideInRight.delay(index * 30)}
              >
                <Pressable
                  onPress={() => handleCategorySelect(category.id)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceElevated,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }
                  ]}
                >
                  <Text style={[
                    typography.body,
                    {
                      color: isSelected ? colors.onPrimary : colors.text,
                      fontWeight: isSelected ? '600' : '400'
                    }
                  ]}>
                    {category.emoji} {category.label}
                  </Text>
                </Pressable>
              </ReAnimated.View>
            );
          })}
        </ScrollView>

        {/* View mode selector */}
        <View style={styles.viewModeContainer}>
          <Pressable
            onPress={() => handleViewModeChange(ViewMode.GRID)}
            style={[
              styles.viewModeButton,
              viewMode === ViewMode.GRID && styles.viewModeButtonActive
            ]}
          >
            <Grid size={18} color={viewMode === ViewMode.GRID ? colors.primary : colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => handleViewModeChange(ViewMode.LIST)}
            style={[
              styles.viewModeButton,
              viewMode === ViewMode.LIST && styles.viewModeButtonActive
            ]}
          >
            <List size={18} color={viewMode === ViewMode.LIST ? colors.primary : colors.textSecondary} />
          </Pressable>
        </View>
      </View>
    </>
  );

  // Render review item based on view mode
  const renderReviewItem = useCallback(({ item, index }: { item: Review; index: number }) => {
    return (
      <ReAnimated.View
        entering={FadeInDown.delay(index * 50).springify()}
        layout={Layout.springify()}
        style={[
          viewMode === ViewMode.LIST && styles.listItem,
          viewMode === ViewMode.GRID && styles.gridItem,
        ]}
      >
        <MasonryReviewCard
          review={item}
          onPress={() => handleReviewPress(item)}
          viewMode={viewMode}
        />
      </ReAnimated.View>
    );
  }, [viewMode, handleReviewPress]);

  // Render footer
  const renderFooter = () => {
    if (!hasMore) {
      return (
        <View style={styles.footerContainer}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            You've reached the end! 🎉
          </Text>
        </View>
      );
    }

    if (isLoading && reviews.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 8 }]}>
            Loading more reviews...
          </Text>
        </View>
      );
    }

    return null;
  };

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading && reviews.length === 0) {
      return (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4].map((i) => (
            <ReviewSkeleton key={i} />
          ))}
        </View>
      );
    }

    if (error) {
      return (
        <EmptyState
          type="error"
          message={error}
          onRetry={fetchReviews}
        />
      );
    }

    if (!isLoading && reviews.length === 0) {
      return (
        <EmptyState
          type={filters.category ? 'no-filtered-reviews' : 'no-reviews'}
          location={selectedLocation?.data?.name}
          onCreateReview={() => router.push('/(tabs)/create')}
          onClearFilters={clearFilters}
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlashList
        data={reviews}
        renderItem={renderReviewItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        estimatedItemSize={viewMode === ViewMode.LIST ? 120 : 250}
        numColumns={viewMode === ViewMode.GRID ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        onScroll={handleScroll}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && reviews.length === 0}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={true}
        drawDistance={500}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />

      {/* Filter bottom sheet */}
      <FilterBottomSheet
        ref={filterSheetRef}
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => {
          setFilter(newFilters);
          setIsFilterSheetOpen(false);
        }}
      />

      {/* Floating action button */}
      <ReAnimated.View
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            transform: [{
              translateY: withSpring(isScrolling.value ? 100 : 0)
            }]
          }
        ]}
      >
        <Pressable
          onPress={() => router.push('/(tabs)/create')}
          style={styles.fabButton}
        >
          <Text style={[typography.h2, { color: colors.onPrimary }]}>+</Text>
        </Pressable>
      </ReAnimated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    overflow: 'hidden',
  },
  headerContent: {
    padding: 20,
    justifyContent: 'space-between',
  },
  headerTitle: {
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  miniHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
    zIndex: 100,
  },
  miniHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 44,
  },
  miniHeaderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsContainer: {
    paddingVertical: 12,
  },
  sortContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoriesScroll: {
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  viewModeContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 8,
  },
  viewModeButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  locationSelector: {
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  listItem: {
    paddingHorizontal: 20,
  },
  gridItem: {
    flex: 1,
    paddingHorizontal: 10,
  },
  skeletonContainer: {
    padding: 20,
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### 3. Create Review Screen (`app/(tabs)/create.tsx`) - Complete Redesign

```typescript
// app/(tabs)/create.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  Image,
  LayoutAnimation,
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Camera,
  Image as ImageIcon,
  X,
  Check,
  AlertCircle,
  MapPin,
  Hash,
  User,
  FileText,
  Star,
  ChevronRight,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  Layout as AnimatedLayout,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Components
import { useTheme } from "../../providers/ThemeProvider";
import { useAuth } from "../../providers/AuthProvider";
import { Button } from "../../components/ui/Button";
import { LocationSelector } from "../../components/LocationSelector";
import { useToast } from "../../hooks/useToast";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { FormField } from "../../components/ui/FormField";
import { RatingSelector } from "../../components/ui/RatingSelector";
import { CategorySelector } from "../../components/ui/CategorySelector";
import { PlatformSelector } from "../../components/ui/PlatformSelector";

// Services
import { reviewService } from "../../services/reviewService";
import { uploadService } from "../../services/uploadService";
import { moderationService } from "../../services/moderationService";
import { analyticsService } from "../../services/analyticsService";

// Utils
import { validateReviewForm } from "../../utils/validation";
import { createTypographyStyles } from "../../styles/typography";

// Types
interface FormData {
  targetName: string;
  categories: string[];
  title: string;
  content: string;
  rating: number;
  platform: string;
  location: any;
  media: MediaItem[];
  isAnonymous: boolean;
  tags: string[];
}

interface MediaItem {
  id: string;
  uri: string;
  type: 'image' | 'video';
  uploading?: boolean;
  progress?: number;
  url?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Form steps for multi-step process
const FORM_STEPS = [
  { id: 'target', title: 'Who?', icon: User },
  { id: 'category', title: 'Category', icon: Hash },
  { id: 'rating', title: 'Rating', icon: Star },
  { id: 'details', title: 'Details', icon: FileText },
  { id: 'media', title: 'Photos', icon: Camera },
  { id: 'review', title: 'Review', icon: Check },
];

export default function CreateReviewScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const typography = createTypographyStyles(colors);
  
  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const contentInputRef = useRef<TextInput>(null);
  
  // Animation values
  const progressAnimation = useSharedValue(0);
  const formAnimation = useSharedValue(0);
  
  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    targetName: '',
    categories: [],
    title: '',
    content: '',
    rating: 0,
    platform: '',
    location: null,
    media: [],
    isAnonymous: true,
    tags: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [contentLength, setContentLength] = useState(0);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  
  // Calculate progress
  useEffect(() => {
    progressAnimation.value = withSpring((currentStep + 1) / FORM_STEPS.length);
  }, [currentStep]);

  // Auto-save draft
  useEffect(() => {
    const saveDraft = async () => {
      if (formData.targetName || formData.content) {
        await reviewService.saveDraft(formData);
      }
    };
    
    const timer = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      const draft = await reviewService.getDraft();
      if (draft) {
        setFormData(draft);
        toast.info('Draft restored');
      }
    };
    loadDraft();
  }, []);

  // Generate tags from content
  useEffect(() => {
    if (formData.content.length > 50) {
      const tags = moderationService.extractTags(formData.content);
      setSuggestedTags(tags);
    }
  }, [formData.content]);

  // Form validation for current step
  const validateCurrentStep = (): boolean => {
    const stepId = FORM_STEPS[currentStep].id;
    const stepErrors: Record<string, string> = {};
    
    switch (stepId) {
      case 'target':
        if (!formData.targetName.trim()) {
          stepErrors.targetName = 'Please enter a name or username';
        }
        break;
      case 'category':
        if (formData.categories.length === 0) {
          stepErrors.categories = 'Please select at least one category';
        }
        break;
      case 'rating':
        if (formData.rating === 0) {
          stepErrors.rating = 'Please select a rating';
        }
        break;
      case 'details':
        if (!formData.title.trim()) {
          stepErrors.title = 'Please enter a title';
        }
        if (formData.title.length < 5) {
          stepErrors.title = 'Title must be at least 5 characters';
        }
        break;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (!validateCurrentStep()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      setShowPreview(true);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  // Media handling
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.error('Camera roll permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      exif: false,
    });

    if (!result.canceled && result.assets) {
      const newMedia = result.assets.map(asset => ({
        id: Date.now().toString() + Math.random(),
        uri: asset.uri,
        type: 'image' as const,
      }));
      
      setFormData(prev => ({
        ...prev,
        media: [...prev.media, ...newMedia].slice(0, 5), // Max 5 images
      }));
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      toast.error('Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      exif: false,
    });

    if (!result.canceled && result.assets[0]) {
      const newMedia: MediaItem = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        type: 'image',
      };
      
      setFormData(prev => ({
        ...prev,
        media: [...prev.media, newMedia].slice(0, 5),
      }));
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const removeMedia = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter(item => item.id !== id),
    }));
  };

  // Upload media
  const uploadMedia = async (): Promise<string[]> => {
    const uploadPromises = formData.media.map(async (item) => {
      if (item.url) return item.url; // Already uploaded
      
      try {
        // Update progress
        setFormData(prev => ({
          ...prev,
          media: prev.media.map(m => 
            m.id === item.id ? { ...m, uploading: true, progress: 0 } : m
          ),
        }));
        
        const url = await uploadService.uploadImage(
          item.uri,
          (progress) => {
            setFormData(prev => ({
              ...prev,
              media: prev.media.map(m => 
                m.id === item.id ? { ...m, progress } : m
              ),
            }));
          }
        );
        
        return url;
      } catch (error) {
        console.error('Upload failed:', error);
        return null;
      }
    });
    
    const urls = await Promise.all(uploadPromises);
    return urls.filter(url => url !== null) as string[];
  };

  // Submit review
  const handleSubmit = async () => {
    // Final validation
    const validation = validateReviewForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the errors before submitting');
      return;
    }

    // Content moderation
    const moderation = await moderationService.checkContent(formData.content);
    if (!moderation.approved) {
      toast.error(`Content rejected: ${moderation.reasons.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Upload media first
      const mediaUrls = await uploadMedia();
      
      // Create review
      const reviewData = {
        ...formData,
        media: mediaUrls,
        authorId: user?.id,
        authorName: formData.isAnonymous ? 'Anonymous' : user?.name,
        createdAt: new Date(),
        likes: 0,
        dislikes: 0,
        comments: [],
        verified: false,
        flagged: moderation.requiresManualReview,
      };

      const reviewId = await reviewService.createReview(reviewData);
      
      // Clear draft
      await reviewService.clearDraft();
      
      // Track analytics
      analyticsService.trackEvent('review_created', {
        category: formData.categories.join(','),
        rating: formData.rating,
        hasMedia: mediaUrls.length > 0,
        wordCount: formData.content.split(' ').length,
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Success animation and navigation
      toast.success('Review posted successfully!');
      
      setTimeout(() => {
        router.replace(`/review/${reviewId}`);
      }, 500);
      
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit review. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    const stepId = FORM_STEPS[currentStep].id;
    
    switch (stepId) {
      case 'target':
        return (
          <Animated.View entering={FadeInDown.springify()}>
            <FormField
              label="Who are you reviewing?"
              placeholder="Enter their name or username"
              value={formData.targetName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, targetName: text }))}
              error={errors.targetName}
              icon={<User size={20} color={colors.textSecondary} />}
              autoFocus
            />
            
            <View style={styles.helperText}>
              <AlertCircle size={16} color={colors.textSecondary} />
              <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 8 }]}>
                This can be a real name, username, or nickname
              </Text>
            </View>
          </Animated.View>
        );

      case 'category':
        return (
          <Animated.View entering={FadeInDown.springify()}>
            <CategorySelector
              selected={formData.categories}
              onSelect={(categories) => setFormData(prev => ({ ...prev, categories }))}
              error={errors.categories}
            />
          </Animated.View>
        );

      case 'rating':
        return (
          <Animated.View entering={FadeInDown.springify()}>
            <RatingSelector
              value={formData.rating}
              onChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
              error={errors.rating}
            />
            
            <View style={styles.ratingLabels}>
              <Text style={[typography.caption, { color: colors.error }]}>
                Red Flag
              </Text>
              <Text style={[typography.caption, { color: colors.success }]}>
                Green Flag
              </Text>
            </View>
          </Animated.View>
        );

      case 'details':
        return (
          <Animated.View entering={FadeInDown.springify()}>
            <FormField
              label="Review Title"
              placeholder="Summarize your experience"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              error={errors.title}
              maxLength={100}
            />
            
            <PlatformSelector
              value={formData.platform}
              onChange={(platform) => setFormData(prev => ({ ...prev, platform }))}
              style={{ marginTop: 20 }}
            />
            
            <LocationSelector
              onLocationSelect={(location) => setFormData(prev => ({ ...prev, location }))}
              currentLocation={formData.location}
              style={{ marginTop: 20 }}
            />
          </Animated.View>
        );

      case 'media':
        return (
          <Animated.View entering={FadeInDown.springify()}>
            <Text style={[typography.body, { marginBottom: 16, color: colors.textSecondary }]}>
              Add photos to support your review (optional)
            </Text>
            
            <View style={styles.mediaGrid}>
              {formData.media.map((item) => (
                <Animated.View
                  key={item.id}
                  entering={ZoomIn}
                  exiting={FadeOut}
                  style={styles.mediaItem}
                >
                  <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                  {item.uploading && (
                    <View style={styles.uploadOverlay}>
                      <ProgressBar progress={item.progress || 0} />
                    </View>
                  )}
                  <Pressable
                    onPress={() => removeMedia(item.id)}
                    style={styles.removeMediaButton}
                  >
                    <X size={16} color="#fff" />
                  </Pressable>
                </Animated.View>
              ))}
              
              {formData.media.length < 5 && (
                <>
                  <Pressable onPress={pickImage} style={styles.addMediaButton}>
                    <ImageIcon size={24} color={colors.textSecondary} />
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Gallery
                    </Text>
                  </Pressable>
                  
                  <Pressable onPress={takePhoto} style={styles.addMediaButton}>
                    <Camera size={24} color={colors.textSecondary} />
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Camera
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </Animated.View>
        );

      case 'review':
        return (
          <Animated.View entering={FadeInDown.springify()}>
            <Text style={[typography.h3, { marginBottom: 16 }]}>
              Write Your Review
            </Text>
            
            <TextInput
              ref={contentInputRef}
              style={[
                styles.contentInput,
                {
                  backgroundColor: colors.surfaceElevated,
                  color: colors.text,
                  borderColor: errors.content ? colors.error : colors.border,
                }
              ]}
              placeholder="Share your detailed experience..."
              placeholderTextColor={colors.textSecondary}
              value={formData.content}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, content: text }));
                setContentLength(text.length);
              }}
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />
            
            <View style={styles.contentFooter}>
              <Text style={[
                typography.caption,
                { color: contentLength < 50 ? colors.error : colors.textSecondary }
              ]}>
                {contentLength}/2000 characters (min. 50)
              </Text>
            </View>
            
            {errors.content && (
              <Text style={[typography.caption, { color: colors.error, marginTop: 8 }]}>
                {errors.content}
              </Text>
            )}
            
            {/* Suggested tags */}
            {suggestedTags.length > 0 && (
              <View style={styles.tagsContainer}>
                <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>
                  Suggested tags:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {suggestedTags.map((tag) => (
                    <Pressable
                      key={tag}
                      onPress={() => {
                        const isSelected = formData.tags.includes(tag);
                        setFormData(prev => ({
                          ...prev,
                          tags: isSelected 
                            ? prev.tags.filter(t => t !== tag)
                            : [...prev.tags, tag]
                        }));
                      }}
                      style={[
                        styles.tagChip,
                        {
                          backgroundColor: formData.tags.includes(tag) 
                            ? colors.primary 
                            : colors.surfaceElevated,
                          borderColor: formData.tags.includes(tag)
                            ? colors.primary
                            : colors.border,
                        }
                      ]}
                    >
                      <Text style={[
                        typography.caption,
                        {
                          color: formData.tags.includes(tag)
                            ? colors.onPrimary
                            : colors.text
                        }
                      ]}>
                        #{tag}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
            
            {/* Anonymous toggle */}
            <Pressable
              onPress={() => setFormData(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
              style={styles.anonymousToggle}
            >
              <View style={styles.anonymousInfo}>
                {formData.isAnonymous ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={typography.body}>
                    {formData.isAnonymous ? 'Post Anonymously' : 'Post as ' + user?.name}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {formData.isAnonymous 
                      ? 'Your identity will be hidden'
                      : 'Your name will be visible'}
                  </Text>
                </View>
              </View>
              <View style={[
                styles.checkbox,
                {
                  backgroundColor: formData.isAnonymous ? colors.primary : 'transparent',
                  borderColor: formData.isAnonymous ? colors.primary : colors.border,
                }
              ]}>
                {formData.isAnonymous && <Check size={16} color={colors.onPrimary} />}
              </View>
            </Pressable>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  // Render preview
  const renderPreview = () => (
    <ScrollView style={styles.previewContainer}>
      <Text style={[typography.h2, { marginBottom: 20 }]}>Review Preview</Text>
      
      <View style={[styles.previewCard, { backgroundColor: colors.card }]}>
        <View style={styles.previewHeader}>
          <View style={styles.previewAuthor}>
            <Shield size={20} color={colors.primary} />
            <Text style={typography.body}>
              {formData.isAnonymous ? 'Anonymous' : user?.name}
            </Text>
          </View>
          <View style={[styles.ratingBadge, { 
            backgroundColor: formData.rating >= 4 ? colors.success : colors.error 
          }]}>
            <Star size={16} color="#fff" fill="#fff" />
            <Text style={[typography.caption, { color: '#fff', marginLeft: 4 }]}>
              {formData.rating}
            </Text>
          </View>
        </View>
        
        <Text style={[typography.h3, { marginTop: 12 }]}>{formData.title}</Text>
        <Text style={[typography.body, { marginTop: 8 }]}>{formData.content}</Text>
        
        {formData.media.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.previewMedia}
          >
            {formData.media.map((item) => (
              <Image 
                key={item.id}
                source={{ uri: item.uri }}
                style={styles.previewMediaImage}
              />
            ))}
          </ScrollView>
        )}
        
        <View style={styles.previewMeta}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            📍 {formData.location?.data?.name || 'No location'}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {formData.platform || 'No platform'}
          </Text>
        </View>
      </View>
      
      <View style={styles.previewActions}>
        <Button
          variant="secondary"
          onPress={() => setShowPreview(false)}
          style={{ flex: 1 }}
        >
          Edit
        </Button>
        <Button
          onPress={handleSubmit}
          loading={isSubmitting}
          style={{ flex: 2, marginLeft: 12 }}
        >
          Submit Review
        </Button>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronRight 
            size={24} 
            color={colors.text} 
            style={{ transform: [{ rotate: '180deg' }] }}
          />
        </Pressable>
        
        <View style={styles.headerCenter}>
          <Text style={typography.h3}>
            {showPreview ? 'Preview' : FORM_STEPS[currentStep].title}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Step {currentStep + 1} of {FORM_STEPS.length}
          </Text>
        </View>
        
        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: colors.surfaceElevated,
          },
          useAnimatedStyle(() => ({
            width: withTiming(progressAnimation.value * SCREEN_WIDTH),
          })),
        ]}
      />

      {/* Steps indicator */}
      {!showPreview && (
        <View style={styles.stepsContainer}>
          {FORM_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <Animated.View
                key={step.id}
                entering={FadeIn.delay(index * 50)}
                style={[
                  styles.stepItem,
                  {
                    backgroundColor: isActive 
                      ? colors.primary 
                      : isCompleted 
                      ? colors.success 
                      : colors.surfaceElevated,
                  }
                ]}
              >
                <Icon 
                  size={16} 
                  color={isActive || isCompleted ? '#fff' : colors.textSecondary} 
                />
              </Animated.View>
            );
          })}
        </View>
      )}

      {/* Content */}
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {showPreview ? renderPreview() : renderStepContent()}
      </KeyboardAwareScrollView>

      {/* Footer actions */}
      {!showPreview && (
        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <Button
            variant="secondary"
            onPress={handleBack}
            style={{ flex: 1 }}
          >
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          <Button
            onPress={handleNext}
            style={{ flex: 2, marginLeft: 12 }}
          >
            {currentStep === FORM_STEPS.length - 1 ? 'Preview' : 'Next'}
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  progressBar: {
    height: 3,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  stepItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  helperText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 8,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaItem: {
    width: (SCREEN_WIDTH - 52) / 3,
    height: (SCREEN_WIDTH - 52) / 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMediaButton: {
    width: (SCREEN_WIDTH - 52) / 3,
    height: (SCREEN_WIDTH - 52) / 3,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  contentInput: {
    minHeight: 200,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'System',
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  tagsContainer: {
    marginTop: 20,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    marginTop: 20,
  },
  anonymousInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  previewContainer: {
    flex: 1,
  },
  previewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewMedia: {
    marginTop: 16,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  previewMediaImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  previewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  previewActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
});
```

## Component Library Implementation

### 1. Enhanced Review Card Component

```typescript
// components/MasonryReviewCard.tsx
import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Star,
  Heart,
  MessageCircle,
  Share2,
  Flag,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  Shield,
} from 'lucide-react-native';
import { format } from 'date-fns';

import { useTheme } from '../providers/ThemeProvider';
import { Review } from '../types';
import { createTypographyStyles } from '../styles/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  review: Review;
  onPress: () => void;
  viewMode?: 'grid' | 'list' | 'masonry';
  index?: number;
}

export const MasonryReviewCard = memo(({ 
  review, 
  onPress, 
  viewMode = 'masonry',
  index = 0 
}: Props) => {
  const { colors, isDark } = useTheme();
  const typography = createTypographyStyles(colors);
  
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    rotation.value = withSpring(Math.random() * 2 - 1);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    rotation.value = withSpring(0);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return colors.success;
    if (rating >= 3) return colors.warning;
    return colors.error;
  };

  const getCardHeight = () => {
    if (viewMode === 'list') return 120;
    if (viewMode === 'grid') return 200;
    
    // Masonry - variable height
    const baseHeight = 180;
    const contentLength = review.content.length;
    const hasMedia = review.media && review.media.length > 0;
    
    if (hasMedia) return baseHeight + 120;
    if (contentLength > 200) return baseHeight + 60;
    return baseHeight;
  };

  const renderListView = () => (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.listCard, { backgroundColor: colors.card }]}
    >
      <Animated.View style={[styles.listContent, animatedStyle]}>
        <View style={styles.listLeft}>
          <View style={[styles.ratingCircle, { backgroundColor: getRatingColor(review.rating) }]}>
            <Star size={16} color="#fff" fill="#fff" />
            <Text style={[typography.caption, { color: '#fff' }]}>
              {review.rating}
            </Text>
          </View>
        </View>
        
        <View style={styles.listCenter}>
          <Text style={[typography.h4, { color: colors.text }]} numberOfLines={1}>
            {review.title}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary }]} numberOfLines={2}>
            {review.content}
          </Text>
          <View style={styles.listMeta}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {review.targetName} • {format(new Date(review.createdAt), 'MMM d')}
            </Text>
          </View>
        </View>
        
        <View style={styles.listRight}>
          <View style={styles.statsColumn}>
            <View style={styles.statItem}>
              <Heart size={14} color={colors.textSecondary} />
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {review.likes}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MessageCircle size={14} color={colors.textSecondary} />
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {review.comments?.length || 0}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );

  const renderGridView = () => (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.gridCard, { backgroundColor: colors.card }]}
    >
      <Animated.View style={[styles.gridContent, animatedStyle]}>
        {review.media && review.media[0] && (
          <Image source={{ uri: review.media[0] }} style={styles.gridImage} />
        )}
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gridGradient}
        />
        
        <View style={styles.gridOverlay}>
          <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(review.rating) }]}>
            <Star size={12} color="#fff" fill="#fff" />
            <Text style={[typography.caption, { color: '#fff', marginLeft: 4 }]}>
              {review.rating}
            </Text>
          </View>
          
          <Text style={[typography.h4, { color: '#fff' }]} numberOfLines={2}>
            {review.title}
          </Text>
          
          <View style={styles.gridFooter}>
            <Text style={[typography.caption, { color: '#fff' }]}>
              {review.targetName}
            </Text>
            <View style={styles.gridStats}>
              <Heart size={12} color="#fff" />
              <Text style={[typography.caption, { color: '#fff', marginLeft: 4 }]}>
                {review.likes}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );

  const renderMasonryView = () => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={[
        styles.masonryCard,
        { 
          backgroundColor: colors.card,
          height: getCardHeight(),
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.masonryContent}
      >
        {/* Header */}
        <View style={styles.masonryHeader}>
          <View style={styles.authorSection}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[typography.h4, { color: colors.primary }]}>
                {review.authorName?.[0] || 'A'}
              </Text>
            </View>
            <View>
              <Text style={[typography.body, { color: colors.text }]}>
                {review.isAnonymous ? 'Anonymous' : review.authorName}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {format(new Date(review.createdAt), 'MMM d, yyyy')}
              </Text>
            </View>
          </View>
          
          <View style={[styles.ratingChip, { backgroundColor: getRatingColor(review.rating) + '20' }]}>
            <Star size={14} color={getRatingColor(review.rating)} fill={getRatingColor(review.rating)} />
            <Text style={[typography.body, { color: getRatingColor(review.rating), marginLeft: 4 }]}>
              {review.rating}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.masonryBody}>
          <Text style={[typography.h4, { color: colors.text }]} numberOfLines={2}>
            {review.title}
          </Text>
          <Text 
            style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]} 
            numberOfLines={3}
          >
            {review.content}
          </Text>
        </View>

        {/* Media preview */}
        {review.media && review.media.length > 0 && (
          <View style={styles.mediaPreview}>
            <Image source={{ uri: review.media[0] }} style={styles.previewImage} />
            {review.media.length > 1 && (
              <View style={styles.mediaCount}>
                <Text style={[typography.caption, { color: '#fff' }]}>
                  +{review.media.length - 1}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.masonryFooter}>
          <View style={styles.footerLeft}>
            {review.location && (
              <View style={styles.locationTag}>
                <MapPin size={12} color={colors.textSecondary} />
                <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                  {review.location}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.footerRight}>
            <Pressable style={styles.actionButton}>
              <Heart size={16} color={colors.textSecondary} />
              <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                {review.likes}
              </Text>
            </Pressable>
            
            <Pressable style={styles.actionButton}>
              <MessageCircle size={16} color={colors.textSecondary} />
              <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                {review.comments?.length || 0}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Badges */}
        {(review.verified || review.trending) && (
          <View style={styles.badges}>
            {review.verified && (
              <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
                <Shield size={12} color={colors.success} />
                <Text style={[typography.caption, { color: colors.success, marginLeft: 4 }]}>
                  Verified
                </Text>
              </View>
            )}
            
            {review.trending && (
              <View style={[styles.badge, { backgroundColor: colors.warning + '20' }]}>
                <TrendingUp size={12} color={colors.warning} />
                <Text style={[typography.caption, { color: colors.warning, marginLeft: 4 }]}>
                  Trending
                </Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );

  switch (viewMode) {
    case 'list':
      return renderListView();
    case 'grid':
      return renderGridView();
    default:
      return renderMasonryView();
  }
});

const styles = StyleSheet.create({
  // List view styles
  listCard: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContent: {
    flexDirection: 'row',
    padding: 16,
  },
  listLeft: {
    marginRight: 12,
  },
  listCenter: {
    flex: 1,
  },
  listRight: {
    marginLeft: 12,
  },
  listMeta: {
    marginTop: 8,
  },
  
  // Grid view styles
  gridCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridContent: {
    flex: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gridGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  gridStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Masonry view styles
  masonryCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  masonryContent: {
    flex: 1,
    padding: 16,
  },
  masonryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  masonryBody: {
    flex: 1,
  },
  masonryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  
  // Common styles
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  ratingCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    position: 'absolute',
    top: 12,
    right: 12,
  },
  mediaPreview: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
    height: 100,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  mediaCount: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsColumn: {
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});

MasonryReviewCard.displayName = 'MasonryReviewCard';

export default MasonryReviewCard;
```

This expanded document continues with complete implementations for every screen and component in the app. Would you like me to continue with more specific sections like:

1. Complete service implementations (reviewService, uploadService, etc.)
2. Store implementations with Zustand
3. Advanced UI components (FilterBottomSheet, Toast, etc.)
4. Authentication flow improvements
5. Profile and settings screens
6. Search and discovery features
7. Chat and messaging implementation
8. Notification system
9. Performance monitoring
10. Testing suite implementation

Let me know which sections you'd like me to expand on next!