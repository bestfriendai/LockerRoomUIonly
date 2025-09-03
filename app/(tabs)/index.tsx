import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
  Text
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MapPin, Search, Bell, Target, Navigation, Edit3 } from "lucide-react-native";
import * as Location from 'expo-location';
import { MasonryFlashList } from "@shopify/flash-list";
import MasonryReviewCard from "../../components/MasonryReviewCard";
import { ModernButton } from "../../components/ui/ModernButton";
import { useTheme } from "../../providers/ThemeProvider";
import { useAuth } from "../../providers/AuthProvider";
import { Review } from "../../types";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { FILTER_CATEGORIES } from "../../constants/categories";
import { LocationSelector } from "../../components/LocationSelector";
import { LocationService } from "../../services/locationService";
import { createTypographyStyles } from "../../styles/typography";
import { EmptyState } from "../../components/EmptyState";
import { DiscoverFeedSkeleton } from "../../components/ui/LoadingSkeletons";
import { SHADOWS } from "../../constants/shadows";
import { compactTextPresets } from "../../constants/tokens";
// MODERN DESIGN IMPORTS
// import { GradientBackground } from "../../components/ui/GradientBackground";
import { GlassmorphismCard } from "../../components/ui/GlassmorphismCard";
import { ModernText, HeadingText, BodyText } from "../../components/ui/ModernText";

const RADIUS_OPTIONS = [5, 10, 15, 25, 50, 100]; // miles

// COMPACT Category pill component - TeaOnHer style
const CategoryPill = React.memo(({ category, isSelected, onPress, colors, typography }: {
  category: { id: string; label: string };
  isSelected: boolean;
  onPress: () => void;
  colors: any;
  typography: any;
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
    accessible={true}
    accessibilityLabel={`${category.label} category ${isSelected ? 'selected' : 'not selected'}`}
  >
    <Text
      style={[
        compactTextPresets.caption,
        {
          color: isSelected ? colors.chipTextActive : colors.chipText,
          fontWeight: isSelected ? "500" : "400",
        }
      ]}
    >
      {category.label}
    </Text>
  </Pressable>
));

CategoryPill.displayName = 'CategoryPill';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const typography = createTypographyStyles(colors);
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [useRadiusFilter, setUseRadiusFilter] = useState(true);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  // Default to 50 miles as requested
  const [searchRadius, setSearchRadius] = useState(50);
  const [_currentLocation, _setCurrentLocation] = useState({
    city: "Washington",
    state: "DC",
    coords: { latitude: 38.9072, longitude: -77.0369 }
  });
  const [locationInput, setLocationInput] = useState("");

  // New location system state
  const [selectedLocationData, setSelectedLocationData] = useState<any>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [hasShownNoReviewsAlert, setHasShownNoReviewsAlert] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    if (!refreshing && reviews.length === 0) {
      setIsInitialLoading(true);
    }
    setRefreshing(true);
    try {
      // Check if user is authenticated before making Firestore queries
      if (!user?.id) {
        if (__DEV__) {
          console.log('User not authenticated, skipping reviews fetch');
        }
        setReviews([]);
        return;
      }

      // Enhanced query with proper ordering
      const reviewsQuery = query(
        collection(db, "reviews"),
        orderBy("createdAt", "desc")
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsList = reviewsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Review));
      setReviews(reviewsList);
    } catch (error) {
      if (__DEV__) {
        console.error("Error fetching reviews: ", error);
      }
      // Set empty reviews instead of showing alert
      setReviews([]);
    } finally {
      setRefreshing(false);
      setIsInitialLoading(false);
    }
  };

  // Filter reviews based on selected category
  const filteredReviews = useMemo(() => {
    if (selectedCategory === "All") {
      return reviews;
    }
    return reviews.filter(review => review.category === selectedCategory);
  }, [selectedCategory, reviews]);

  const _onRefresh = useCallback(async () => {
    await fetchReviews();
  }, []);

  const onSelectCategory = useCallback((id: string) => {
    setSelectedCategory(id);
  }, []);

  // Location handling functions
  const handleLocationSelect = useCallback(async (location: {
    type: 'current' | 'selected' | 'global';
    data: any;
  }) => {
    setSelectedLocationData(location);
    await fetchReviewsForLocation(location);
  }, []);

  // Normalize any location shape (string or object) to a display string
  const normalizeLocationToString = (loc: unknown): string => {
    if (!loc) return '';
    if (typeof loc === 'string') return loc;
    if (typeof loc === 'object' && loc !== null) {
      const locationObj = loc as Record<string, unknown>;
      const { name, city, state, region, country, locality, adminArea, subregion } = locationObj;
      // Join the most common fields, skipping empties
      return [name, city, state ?? region ?? adminArea ?? subregion, country ?? locality]
        .filter((item): item is string => typeof item === 'string' && item.length > 0)
        .join(', ');
    }
    try { return String(loc); } catch { return ''; }
  };

  // Coordinate helpers
  const extractCoords = (coords: unknown): { lat: number; lon: number } | null => {
    if (!coords) return null;
    if (Array.isArray(coords) && coords.length >= 2) {
      const [lon, lat] = coords;
      if (typeof lat === 'number' && typeof lon === 'number') return { lat, lon };
    } else if (typeof coords === 'object' && coords !== null) {
      const coordObj = coords as Record<string, unknown>;
      const lat = coordObj.latitude ?? coordObj.lat;
      const lon = coordObj.longitude ?? coordObj.lon ?? coordObj.lng;
      if (typeof lat === 'number' && typeof lon === 'number') return { lat, lon };
    }
    return null;
  };

  const getSelectedCoords = (location: unknown): { lat: number; lon: number } | null => {
    const locationObj = location as Record<string, unknown>;
    const data = locationObj?.data ?? location;
    const dataObj = data as Record<string, unknown>;
    return extractCoords(dataObj?.coordinates) || extractCoords(dataObj?.coords) || null;
  };

  const getReviewCoords = (review: any): { lat: number; lon: number } | null => {
    return (
      extractCoords(review?.coordinates) ||
      extractCoords(review?.locationData?.data?.coordinates) ||
      extractCoords(review?.locationData?.coordinates) ||
      null
    );
  };

  const distanceMiles = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
    // LocationService.calculateDistance returns kilometers
    const km = LocationService.calculateDistance(a.lat, a.lon, b.lat, b.lon);
    return km * 0.621371; // km to miles
  };

  const fetchReviewsForLocation = useCallback(async (location: any) => {
    setIsLoadingReviews(true);
    try {
      // Check if user is authenticated before making Firestore queries
      if (!user?.id) {
        if (__DEV__) {
          console.log('User not authenticated, skipping reviews fetch for location');
        }
        setReviews([]);
        setIsLoadingReviews(false);
        return;
      }

      // Fetch all reviews first
      const reviewsQuery = collection(db, 'reviews');
      const snapshot = await getDocs(reviewsQuery);
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc as any).data(),
      })) as Review[];

      if (location?.type === 'global') {
        setReviews(reviewsData);
      } else {
        const selectedCoords = getSelectedCoords(location);

        if (selectedCoords && useRadiusFilter) {
          // Filter by radius
          const filtered = reviewsData.filter((review) => {
            const rc = getReviewCoords(review);
            if (!rc) return false; // skip reviews without coordinates when radius filter is on
            return distanceMiles(selectedCoords, rc) <= searchRadius;
          });
          setReviews(filtered);

          if (filtered.length === 0) {
            // Only show alert once to avoid spam
            if (!hasShownNoReviewsAlert) {
              setHasShownNoReviewsAlert(true);
              // Don't show alert, just show all reviews
              setReviews(reviewsData);
              // Optionally show a less intrusive notification
              __DEV__ && console.log(`No reviews found within ${searchRadius} miles. Showing all reviews.`);
            } else {
              setReviews(reviewsData);
            }
          } else {
            // Reset flag when reviews are found
            setHasShownNoReviewsAlert(false);
          }
        } else {
          // Fallback to string-based matching if no coords or radius filter off
          const locationData = (location as any)?.data;
          const selectedLocationString = normalizeLocationToString(locationData).toLowerCase();
          const locationTerms = (selectedLocationString.split(',')[0] || '').trim();
          const selectedCity = ((locationData?.city) ?? '').toString().toLowerCase();
          const selectedState = ((locationData?.state) ?? (locationData?.region) ?? '').toString().toLowerCase();

          const filtered = reviewsData.filter((review) => {
            if ((review as any).location) {
              const reviewLocationString = normalizeLocationToString((review as any).location).toLowerCase();
              const locationParts = reviewLocationString.split(',').map(part => part.trim());
              const reviewCity = locationParts[0] || '';
              const reviewState = locationParts[1] || '';

              return (
                (locationTerms && (
                  reviewCity.includes(locationTerms) ||
                  reviewState.includes(locationTerms) ||
                  reviewLocationString.includes(locationTerms)
                )) ||
                (selectedCity && (
                  reviewCity.includes(selectedCity) ||
                  reviewState.includes(selectedCity) ||
                  reviewLocationString.includes(selectedCity)
                )) ||
                (selectedState && (
                  reviewCity.includes(selectedState) ||
                  reviewState.includes(selectedState) ||
                  reviewLocationString.includes(selectedState)
                ))
              );
            }
            return false;
          });

          setReviews(filtered.length > 0 ? filtered : reviewsData);
        }
      }
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error fetching reviews for location:', error);
      }
      // Set empty reviews instead of crashing
      setReviews([]);
      Alert.alert('Error', 'Failed to fetch reviews for this location.');
    } finally {
      setIsLoadingReviews(false);
      setIsInitialLoading(false);
    }
  }, [normalizeLocationToString, getSelectedCoords, getReviewCoords, distanceMiles, searchRadius, useRadiusFilter]);

  // Track if location has been initialized to prevent duplicate loads
  const [locationInitialized, setLocationInitialized] = useState(false);

  // Load saved location on component mount; if none, auto-detect current location
  useEffect(() => {
    // Skip if already initialized
    if (locationInitialized) return;
    
    const initLocation = async () => {
      // Always try to get current location first
      const granted = await LocationService.requestLocationPermission();
      if (granted) {
        try {
          __DEV__ && console.log('Getting current location...');
          const loc = await LocationService.getCurrentLocation();
          const place = await LocationService.reverseGeocode(loc.latitude, loc.longitude) as any;
          const currentData = {
            name: place?.name || place?.formatted || `${place?.city || ''}, ${place?.region || ''}`,
            city: place?.city || '',
            region: place?.region || '',
            state: place?.region || '',
            country: place?.country || '',
            coordinates: { latitude: loc.latitude, longitude: loc.longitude },
          };
          __DEV__ && console.log('Current location detected:', currentData.name);
          await LocationService.saveSelectedLocation(currentData);
          const locationData = { type: 'current', data: currentData };
          setSelectedLocationData(locationData);
          setLocationInitialized(true);
          await fetchReviewsForLocation(locationData);
          return;
        } catch (e) {
          __DEV__ && console.log('Could not get current location, checking for saved location...');
          // If current location fails, try saved location
          const savedLocation = await LocationService.getSelectedLocation();
          if (savedLocation) {
            const locationData = { type: 'selected', data: savedLocation };
            setSelectedLocationData(locationData);
            setLocationInitialized(true);
            await fetchReviewsForLocation(locationData);
            return;
          }
          // Fallback to global if both fail
          const locationData = { type: 'global', data: { name: 'Global', coordinates: null } };
          setSelectedLocationData(locationData);
          setLocationInitialized(true);
          await fetchReviewsForLocation(locationData);
        }
      } else {
        __DEV__ && console.log('Location permission denied, checking for saved location...');
        // If permission denied, try saved location
        const savedLocation = await LocationService.getSelectedLocation();
        if (savedLocation) {
          const locationData = { type: 'selected', data: savedLocation };
          setSelectedLocationData(locationData);
          setLocationInitialized(true);
          await fetchReviewsForLocation(locationData);
          return;
        }
        // Fallback to global
        const locationData = { type: 'global', data: { name: 'Global', coordinates: null } };
        setSelectedLocationData(locationData);
        setLocationInitialized(true);
        await fetchReviewsForLocation(locationData);
      }
    };

    initLocation();
  }, []); // Empty dependency array to run only once on mount

  // Re-apply location filtering when radius or toggle changes
  // Commented out to prevent duplicate fetches and multiple alerts
  // useEffect(() => {
  //   if (selectedLocationData) {
  //     fetchReviewsForLocation(selectedLocationData);
  //   }
  // }, [searchRadius, useRadiusFilter, selectedLocationData, fetchReviewsForLocation]);

  const handleCurrentLocation = useCallback(async () => {
    try {
      __DEV__ && console.log('Getting current location from user request...');
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use current location.');
        return;
      }

      // Get current location with higher accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      const { latitude, longitude } = location.coords;
      __DEV__ && console.log('Current coordinates:', latitude, longitude);

      // Reverse geocode to get city and state
      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      let city = 'Unknown';
      let region = 'Unknown';
      let country = 'Unknown';
      if (reverseGeocode.length > 0) {
        city = reverseGeocode[0].city || reverseGeocode[0].subregion || 'Unknown';
        region = reverseGeocode[0].region || reverseGeocode[0].country || 'Unknown';
        country = reverseGeocode[0].country || 'Unknown';
      }

      __DEV__ && console.log('Current location:', `${city}, ${region}, ${country}`);

      _setCurrentLocation({
        city,
        state: region,
        coords: { latitude, longitude }
      });

      // Also set as selected location and refetch
      const selected = {
        type: 'current',
        data: {
          name: `${city}, ${region}`,
          city,
          region,
          state: region,
          country,
          coordinates: { latitude, longitude },
        }
      };
      setSelectedLocationData(selected);
      await LocationService.saveSelectedLocation(selected.data);
      await fetchReviewsForLocation(selected);

      setShowLocationModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    }
  }, [fetchReviewsForLocation]);

  const handleManualLocation = useCallback(() => {
    if (locationInput.trim()) {
      // Simple parsing for "City, State" format
      const parts = locationInput.split(',').map(part => part.trim());
      if (parts.length >= 2) {
        _setCurrentLocation({
          city: parts[0],
          state: parts[1],
          coords: { latitude: 0, longitude: 0 } // Would need geocoding API for real coords
        });
        setLocationInput('');
        setShowLocationModal(false);
      } else {
        Alert.alert('Invalid Format', 'Please enter location as "City, State"');
      }
    }
  }, [locationInput]);

  const renderReviewItem = useCallback(({ item, index: _index }: { item: Review; index: number }) => (
    <View style={{ marginBottom: 16 }}>
      <MasonryReviewCard
        review={item}
        onPress={() => router.push(`/review/${item.id}`)}
      />
    </View>
  ), [router]);

  const keyExtractor = useCallback((item: Review) => item._id || item.id, []);

  const getItemType = useCallback((item: Review) => {
    // Group items by category for better recycling
    return item.category || 'default';
  }, []);

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      {/* Modern App Header with Better Typography */}
      <View style={styles.locationHeader}>
        <View style={styles.titleSection}>
          <HeadingText level={1} color={colors.text} weight="bold">
            LockerRoom
          </HeadingText>
          <HeadingText level={3} color={colors.primary} weight="medium">
            Talk
          </HeadingText>
        </View>
        <View style={styles.headerActions}>
          <ModernButton
            variant="ghost"
            size="sm"
            onPress={() => router.push("/search")}
            icon={<Search size={18} color={colors.text} strokeWidth={1.5} />}
            style={styles.headerActionButton}
          />
          <ModernButton
            variant="ghost"
            size="sm"
            onPress={() => router.push("/notifications")}
            icon={<Bell size={18} color={colors.text} strokeWidth={1.5} />}
            style={styles.headerActionButton}
          />
        </View>
      </View>

      {/* MODERN Title with Location Button */}
      <View style={styles.titleContainer}>
        <HeadingText level={4} color="#FFFFFF" weight="semibold">
          Discover
        </HeadingText>
        <Pressable
          onPress={() => setShowLocationModal(true)}
          style={[styles.locationButton, { backgroundColor: colors.surfaceElevated }]}
        >
          <MapPin size={12} color={colors.primary} strokeWidth={1.5} />
          <BodyText size="small" color="#FFFFFF" weight="medium" style={{ marginLeft: 4 }}>
            Location
          </BodyText>
        </Pressable>
      </View>

      {/* COMPACT Location Info */}
      {selectedLocationData && (
        <View style={[styles.locationInfo, { backgroundColor: colors.surface }]}>
          <BodyText size="small" color="rgba(255,255,255,0.8)" align="center">
            {selectedLocationData.type === 'global'
              ? '🌍 Showing reviews from everywhere'
              : selectedLocationData.type === 'current'
              ? `📍 Within ${searchRadius} miles of your location`
              : `📍 Within ${searchRadius} miles of ${(selectedLocationData as any)?.data.name}`
            }
          </BodyText>
        </View>
      )}

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
            typography={typography}
          />
        ))}
      </ScrollView>

      {/* COMPACT Filter Toggle - TeaOnHer style */}
      <View style={styles.filterToggle}>
        <ModernButton
          variant={useRadiusFilter ? "gradient" : "outline"}
          size="xs"
          onPress={() => setUseRadiusFilter(!useRadiusFilter)}
          icon={<Target size={12} color={useRadiusFilter ? colors.white : colors.primary} strokeWidth={1.5} />}
          style={{ paddingHorizontal: 6, paddingVertical: 3 }}
        >
          Radius Filter
        </ModernButton>
        <ModernButton
          variant="ghost"
          size="xs"
          onPress={() => setShowRadiusModal(true)}
          style={{ marginLeft: 6, paddingHorizontal: 4, paddingVertical: 3 }}
        >
          {searchRadius} mi
        </ModernButton>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* MODERN GRADIENT BACKGROUND */}
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {isInitialLoading && filteredReviews.length === 0 ? (
        <>
          {renderHeader()}
          <DiscoverFeedSkeleton />
        </>
      ) : (
        <MasonryFlashList
          data={filteredReviews}
          renderItem={renderReviewItem}
          numColumns={2}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
          isInitialLoading ? (
            <DiscoverFeedSkeleton />
          ) : (
            <EmptyState
              type={selectedLocationData ? 'no-location-reviews' : 'no-reviews'}
              location={typeof selectedLocationData?.data === 'string' ? selectedLocationData.data : selectedLocationData?.data?.city || 'your location'}
              searchRadius={searchRadius}
              onChangeLocation={() => setShowLocationModal(true)}
              onCreateReview={() => router.push('/(tabs)/create')}
              onClearFilters={() => {
                setSelectedCategory('All');
              }}
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={_onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={250} // reduced from 300 for more compact cards
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        removeClippedSubviews={true}
        drawDistance={400} // reduced for better performance
      />
      )}

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
            <Text style={[typography.h2, { textAlign: 'center', marginBottom: 20 }]}>
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
                <Text style={{
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

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLocationModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}> 
            <Text style={[typography.h2, { textAlign: 'center', marginBottom: 20 }]}>
              Change Location
            </Text>
            
            {/* Current Location Button */}
            <Pressable
              onPress={handleCurrentLocation}
              style={[styles.locationOption, { backgroundColor: colors.surfaceElevated }]}
            >
              <Navigation size={20} color={colors.primary} strokeWidth={1.5} />
              <Text style={[typography.body, { color: colors.text, marginLeft: 12 }]}>
                Use Current Location
              </Text>
            </Pressable>

            {/* Manual Location Input */}
            <View style={styles.manualLocationContainer}>
              <Edit3 size={20} color={colors.textSecondary} strokeWidth={1.5} />
              <TextInput
                style={[styles.locationInput, { 
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceElevated
                }]}
                placeholder="Enter City, State"
                placeholderTextColor={colors.textSecondary}
                value={locationInput}
                onChangeText={setLocationInput}
                onSubmitEditing={handleManualLocation}
              />
            </View>
            
            {locationInput.trim() && (
              <Pressable
                onPress={handleManualLocation}
                style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[typography.body, { color: colors.surface, fontWeight: '500' }]}>
                  Set Location
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // COMPACT STYLES - TeaOnHer-like spacing
  categoriesContainer: {
    // gap: 3, // Removed gap property - not supported in React Native Web
    paddingRight: 6, // reduced from 8
  },
  categoriesScroll: {
    marginBottom: 6, // reduced from 8
  },
  categoryPill: {
    borderRadius: 10, // reduced from 12
    borderWidth: 1,
    marginRight: 3, // reduced from 4
    paddingHorizontal: 6, // reduced from 8
    paddingVertical: 3, // reduced from 4
  },
  container: {
    flex: 1,
  },
  filterToggle: {
    marginBottom: 6, // reduced from 8
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 3, // reduced from 4
  },
  header: {
    paddingBottom: 6, // Further reduced for tighter layout
    paddingHorizontal: 6, // More compact horizontal padding
  },
  headerActions: {
    flexDirection: "row",
    // gap: 6, // Removed gap property - not supported in React Native Web
  },
  headerButton: {
    alignItems: "center",
    borderRadius: 18, // reduced from 20
    height: 36, // reduced from 40
    justifyContent: "center",
    width: 36, // reduced from 40
  },
  headerActionButton: {
    width: 36, // reduced from 40
    height: 36, // reduced from 40
    borderRadius: 18, // reduced from 20
  },
  listContent: {
    paddingBottom: 80, // reduced from 100
    paddingHorizontal: 8, // reduced from 12
  },
  locationHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8, // reduced from 12
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "baseline",
    // gap: 4, // Removed gap property as it's not fully supported in React Native Web
  },
  locationContainer: {
    alignItems: 'center',
    marginBottom: 6, // reduced from 8
  },
  locationSelector: {
    marginBottom: 3, // reduced from 4
  },
  locationInfo: {
    alignItems: "center",
    paddingHorizontal: 6, // reduced from 8
    paddingVertical: 2, // reduced from 3
    borderRadius: 6, // reduced from 8
    marginTop: 3, // reduced from 4
  },
  modalContent: {
    borderRadius: 14, // reduced from 16
    padding: 16, // reduced from 20
    width: "85%",
    maxWidth: 380,
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    flex: 1,
    justifyContent: "center",
  },
  radiusOption: {
    borderRadius: 8, // reduced from 10
    marginBottom: 8, // reduced from 10
    paddingHorizontal: 12, // reduced from 16
    paddingVertical: 10, // reduced from 12
  },
  titleContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8, // reduced from 10
  },
  locationButton: {
    alignItems: "center",
    borderRadius: 10, // reduced from 12
    flexDirection: "row",
    paddingHorizontal: 6, // reduced from 8
    paddingVertical: 3, // reduced from 4
  },
  locationOption: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  manualLocationContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  locationInput: {
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  confirmButton: {
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
