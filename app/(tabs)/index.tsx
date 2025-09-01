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
import { useTheme } from "../../providers/ThemeProvider";
import { Review } from "../../types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { FILTER_CATEGORIES } from "../../constants/categories";
import { LocationSelector } from "../../components/LocationSelector";
import { LocationService } from "../../services/locationService";
import { createTypographyStyles } from "../../styles/typography";
import { EmptyState } from "../../components/EmptyState";
import { DiscoverFeedSkeleton } from "../../components/ui/LoadingSkeletons";

const RADIUS_OPTIONS = [5, 10, 15, 25, 50, 100]; // miles

// Memoized category pill component for better performance
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
        typography.body,
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
  // const { user } = useAuth(); // Not currently used
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

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    if (!refreshing && reviews.length === 0) {
      setIsInitialLoading(true);
    }
    setRefreshing(true);
    try {
      const reviewsCollection = collection(db, "reviews");
      const reviewsSnapshot = await getDocs(reviewsCollection);
      const reviewsList = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc as any).data() } as Review));
      setReviews(reviewsList);
    } catch (error) {
      if (__DEV__) {
        console.error("Error fetching reviews: ", error);
      }
      Alert.alert("Error", "Could not fetch reviews.");
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
            Alert.alert(
              'No Reviews Nearby',
              `No reviews found within ${searchRadius} miles. Showing all reviews instead.`,
              [{ text: 'OK', onPress: () => setReviews(reviewsData) }]
            );
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
        console.error('Error fetching reviews for location:', error);
      }
      Alert.alert('Error', 'Failed to fetch reviews for this location.');
    } finally {
      setIsLoadingReviews(false);
      setIsInitialLoading(false);
    }
  }, [normalizeLocationToString, getSelectedCoords, getReviewCoords, distanceMiles, searchRadius, useRadiusFilter]);

  // Load saved location on component mount; if none, auto-detect current location
  useEffect(() => {
    const initLocation = async () => {
      const savedLocation = await LocationService.getSelectedLocation();
      if (savedLocation) {
        const locationData = { type: 'selected', data: savedLocation };
        setSelectedLocationData(locationData);
        await fetchReviewsForLocation(locationData);
        return;
      }

      // Try auto-detect current location
      const granted = await LocationService.requestLocationPermission();
      if (granted) {
        try {
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
          await LocationService.saveSelectedLocation(currentData);
          const locationData = { type: 'current', data: currentData };
          setSelectedLocationData(locationData);
          await fetchReviewsForLocation(locationData);
        } catch (e) {
          // Fallback to global if detection fails
          const locationData = { type: 'global', data: { name: 'Global', coordinates: null } };
          setSelectedLocationData(locationData);
          await fetchReviewsForLocation(locationData);
        }
      } else {
        const locationData = { type: 'global', data: { name: 'Global', coordinates: null } };
        setSelectedLocationData(locationData);
        await fetchReviewsForLocation(locationData);
      }
    };

    initLocation();
  }, [fetchReviewsForLocation]);

  // Re-apply location filtering when radius or toggle changes
  useEffect(() => {
    if (selectedLocationData) {
      fetchReviewsForLocation(selectedLocationData);
    }
  }, [searchRadius, useRadiusFilter, selectedLocationData, fetchReviewsForLocation]);

  const handleCurrentLocation = useCallback(async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use current location.');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync();
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get city and state
      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      let city = 'Unknown';
      let region = 'Unknown';
      if (reverseGeocode.length > 0) {
        city = reverseGeocode[0].city || 'Unknown';
        region = reverseGeocode[0].region || 'Unknown';
      }

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

  const renderReviewItem = useCallback(({ item, index }: { item: Review; index: number }) => (
    <View style={{ marginBottom: 16 }}>
      <MasonryReviewCard
        review={item}
        onPress={() => router.push(`/review/${item.id}`)}
      />
    </View>
  ), [router]);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* App Header */}
      <View style={styles.locationHeader}>
        <Text style={typography.h1}>
          LockerRoom Talk App
        </Text>
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

      {/* Location Selector */}
      <View style={styles.locationContainer}>
        <LocationSelector
          onLocationSelect={handleLocationSelect}
          currentLocation={selectedLocationData}
          style={styles.locationSelector}
        />

        {selectedLocationData && (
          <Text style={[typography.caption, { marginTop: 8, textAlign: 'center' }]}>
            {selectedLocationData.type === 'global'
              ? 'Showing reviews from everywhere'
              : selectedLocationData.type === 'current'
              ? `Showing reviews within ${searchRadius} miles of your location`
              : `Showing reviews within ${searchRadius} miles of ${(selectedLocationData as any)?.data.name}`
            }
          </Text>
        )}
      </View>

      {/* Title with Location Button */}
      <View style={styles.titleContainer}>
        <Text style={typography.h2}>
          Discover
        </Text>
        <Pressable
          onPress={() => setShowLocationModal(true)}
          style={[styles.locationButton, { backgroundColor: colors.surfaceElevated }]}
        >
          <MapPin size={16} color={colors.primary} strokeWidth={1.5} />
          <Text style={[typography.body, { color: colors.primary, marginLeft: 4 }]}>
            Location
          </Text>
        </Pressable>
      </View>

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
          <Text style={[
            typography.body,  
            {
              color: useRadiusFilter ? colors.surface : colors.text,
              marginLeft: 6
            }
          ]}>
            Radius Filter
          </Text>
        </Pressable>
        {/* Quick radius selector trigger */}
        <Pressable
          onPress={() => setShowRadiusModal(true)}
          style={[styles.filterButton, { marginLeft: 8, backgroundColor: colors.surfaceElevated }]}
        >
          <Text style={typography.body}>{searchRadius} mi</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
        estimatedItemSize={350}
        keyExtractor={(item) => item._id || item.id}
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
    flexDirection: 'row',
    alignItems: 'center',
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
  locationContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  locationSelector: {
    // Additional styles for location selector if needed
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
  titleContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  locationButton: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  locationOption: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  manualLocationContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  locationInput: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  confirmButton: {
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});