import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
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
import { MapPin, ChevronDown, Search, Bell, Target, Navigation, Edit3 } from "lucide-react-native";
import * as Location from 'expo-location';
import { MasonryFlashList } from "@shopify/flash-list";
import { useAuth } from "@/providers/AuthProvider";
import { MasonryReviewCard } from "@/components/MasonryReviewCard";
import { useTheme } from "@/providers/ThemeProvider";
import { Review } from "@/types";
import { Button } from "@/components/ui/Button";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { FILTER_CATEGORIES } from "@/constants/categories";
import { LocationSelector } from "@/components/LocationSelector";
import { LocationService } from "@/services/locationService";

const RADIUS_OPTIONS = [5, 10, 15, 25, 50, 100]; // miles

// Memoized category pill component for better performance
const CategoryPill = React.memo(({ category, isSelected, onPress, colors }: {
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
      style={{
        color: isSelected ? colors.chipTextActive : colors.chipText,
        fontWeight: isSelected ? "500" : "400",
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [useRadiusFilter, setUseRadiusFilter] = useState(true);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchRadius, setSearchRadius] = useState(25);
  const [currentLocation, setCurrentLocation] = useState({
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
    }
  };

  // Filter reviews based on selected category
  let filteredReviews = useMemo(() => {
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
  const handleLocationSelect = useCallback(async (location: any) => {
    setSelectedLocationData(location);
    await fetchReviewsForLocation(location);
  }, []);

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

      // Filter reviews based on location type
      if (location.type === 'global') {
        // Show all reviews for global
        setReviews(reviewsData);
      } else if (location.type === 'current' || location.type === 'selected') {
        // Filter reviews by location proximity
        const locationData = (location as any)?.data;
        const coordinates = locationData?.coordinates;

        if (coordinates) {
          // Filter reviews within a reasonable distance (for demo purposes)
          const filteredReviews = reviewsData.filter(review => {
            // For demo, we'll use a simple location name matching
            // In production, implement proper geospatial filtering
            if (review.location) {
              const reviewLocation = review.location.toLowerCase();
              const selectedLocation = (location as any)?.data?.name?.toLowerCase() || '';

              // Check if review location contains selected location terms
              const locationTerms = selectedLocation.split(',')[0].trim(); // Get city name
              return reviewLocation.includes(locationTerms) ||
                     reviewLocation.includes((location as any)?.data?.city?.toLowerCase() || '');
            }
            return false;
          });

          setReviews(filteredReviews);

          // Show message if no reviews found for location
          if (filteredReviews.length === 0) {
            Alert.alert(
              'No Reviews Found',
              `No reviews found for ${(location as any)?.data?.name || 'this location'}. Showing all reviews instead.`,
              [{ text: 'OK', onPress: () => setReviews(reviewsData) }]
            );
          }
        } else {
          setReviews(reviewsData);
        }
      } else {
        setReviews(reviewsData);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error fetching reviews for location:', error);
      }
      Alert.alert('Error', 'Failed to fetch reviews for this location.');
    } finally {
      setIsLoadingReviews(false);
    }
  }, []);

  // Load saved location on component mount
  useEffect(() => {
    const loadSavedLocation = async () => {
      const savedLocation = await LocationService.getSelectedLocation();
      let locationData;

      if (savedLocation) {
        locationData = {
          type: 'selected',
          data: savedLocation,
        };
      } else {
        // Default to global
        locationData = {
          type: 'global',
          data: { name: 'Global', coordinates: null },
        };
      }

      setSelectedLocationData(locationData);
      // Fetch reviews for the loaded location
      await fetchReviewsForLocation(locationData);
    };

    loadSavedLocation();
  }, [fetchReviewsForLocation]);

  const handleCurrentLocation = useCallback(async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use current location.');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get city and state
      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverseGeocode.length > 0) {
        const { city, region } = reverseGeocode[0];
        setCurrentLocation({
          city: city || 'Unknown',
          state: region || 'Unknown',
          coords: { latitude, longitude }
        });
      }
      setShowLocationModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    }
  }, []);

  const handleManualLocation = useCallback(() => {
    if (locationInput.trim()) {
      // Simple parsing for "City, State" format
      const parts = locationInput.split(',').map(part => part.trim());
      if (parts.length >= 2) {
        setCurrentLocation({
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
        <Text style={{ color: colors.text }}>
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
          <Text style={{ color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
            {selectedLocationData.type === 'global'
              ? 'Showing reviews from everywhere'
              : selectedLocationData.type === 'current'
              ? 'Showing reviews near your current location'
              : `Showing reviews near ${(selectedLocationData as any)?.data.name}`
            }
          </Text>
        )}
      </View>

      {/* Title with Location Button */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Discover
        </Text>
        <Pressable
          onPress={() => setShowLocationModal(true)}
          style={[styles.locationButton, { backgroundColor: colors.surfaceElevated }]}
        >
          <MapPin size={16} color={colors.primary} strokeWidth={1.5} />
          <Text style={{ color: colors.primary, marginLeft: 4 }}>
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
          <Text style={{
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
            <Text style={styles.modalTitle}>
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
            <Text style={styles.modalTitle}>
              Change Location
            </Text>
            
            {/* Current Location Button */}
            <Pressable
              onPress={handleCurrentLocation}
              style={[styles.locationOption, { backgroundColor: colors.surfaceElevated }]}
            >
              <Navigation size={20} color={colors.primary} strokeWidth={1.5} />
              <Text style={{ color: colors.text, marginLeft: 12 }}>
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
                <Text style={{ color: colors.surface }}>
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