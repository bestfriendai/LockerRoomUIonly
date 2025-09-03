import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ViewStyle,
  Animated,
  Modal,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';
import { tokens } from '../../constants/tokens';
import { BORDER_RADIUS, SHADOWS } from '../../constants/shadows';
import { createTypographyStyles } from '../../styles/typography';
import { ModernButton } from './ModernButton';
import { LoadingSkeletons } from './LoadingSkeletons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface LocationData {
  id: string;
  name: string;
  fullName?: string;
  city: string;
  state?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  type?: 'city' | 'neighborhood' | 'landmark' | 'current';
}

interface LocationSelectorProps {
  onLocationSelect: (location: LocationData) => void;
  onClose?: () => void;
  visible?: boolean;
  style?: ViewStyle;
  placeholder?: string;
  enableCurrentLocation?: boolean;
  enableSearch?: boolean;
  maxResults?: number;
  searchRadius?: number; // in kilometers
  variant?: 'modal' | 'inline' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  showRecentLocations?: boolean;
  recentLocations?: LocationData[];
  popularLocations?: LocationData[];
  selectedLocation?: LocationData;
}

// Mock popular locations - in a real app, this would come from an API
const POPULAR_LOCATIONS: LocationData[] = [
  {
    id: 'nyc',
    name: 'New York City',
    city: 'New York City',
    state: 'NY',
    country: 'United States',
    type: 'city',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
  },
  {
    id: 'la',
    name: 'Los Angeles',
    city: 'Los Angeles',
    state: 'CA',
    country: 'United States',
    type: 'city',
    coordinates: { latitude: 34.0522, longitude: -118.2437 },
  },
  {
    id: 'chicago',
    name: 'Chicago',
    city: 'Chicago',
    state: 'IL',
    country: 'United States',
    type: 'city',
    coordinates: { latitude: 41.8781, longitude: -87.6298 },
  },
  {
    id: 'miami',
    name: 'Miami',
    city: 'Miami',
    state: 'FL',
    country: 'United States',
    type: 'city',
    coordinates: { latitude: 25.7617, longitude: -80.1918 },
  },
  {
    id: 'sf',
    name: 'San Francisco',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    type: 'city',
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
  },
];

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  onClose,
  visible = false,
  style,
  placeholder = 'Search for a location...',
  enableCurrentLocation = true,
  enableSearch = true,
  maxResults = 10,
  searchRadius = 50,
  variant = 'modal',
  size = 'md',
  showRecentLocations = true,
  recentLocations = [],
  popularLocations = POPULAR_LOCATIONS,
  selectedLocation,
}) => {
  const { colors, isDark } = useTheme();
  const typography = createTypographyStyles(colors);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const inputRef = useRef<TextInput>(null);

  // Size configurations
  const sizeConfig = {
    sm: {
      inputHeight: 40,
      fontSize: tokens.fontSize.sm,
      padding: tokens.spacing.sm,
      iconSize: 18,
    },
    md: {
      inputHeight: 48,
      fontSize: tokens.fontSize.base,
      padding: tokens.spacing.md,
      iconSize: 20,
    },
    lg: {
      inputHeight: 56,
      fontSize: tokens.fontSize.lg,
      padding: tokens.spacing.lg,
      iconSize: 24,
    },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: tokens.duration.normal,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: tokens.duration.fast,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission denied',
          'Location access is needed to find places near you.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // In a real app, you'd reverse geocode to get the address
      const currentLoc: LocationData = {
        id: 'current',
        name: 'Current Location',
        city: 'Current Location',
        country: 'Unknown',
        type: 'current',
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };

      setCurrentLocation(currentLoc);
      onLocationSelect(currentLoc);
      
      if (variant === 'modal' && onClose) {
        onClose();
      }
    } catch (error) {
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Mock search function - in a real app, this would call a geocoding API
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter popular locations that match the query
    const filtered = popularLocations.filter(location =>
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.city.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filtered.slice(0, maxResults));
    setIsLoading(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (enableSearch) {
      searchLocations(query);
    }
  };

  const handleLocationSelect = (location: LocationData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLocationSelect(location);
    setSearchQuery(location.name);
    setShowDropdown(false);
    
    if (variant === 'modal' && onClose) {
      onClose();
    }
  };

  const renderLocationItem = ({ item }: { item: LocationData }) => (
    <TouchableOpacity
      style={[styles.locationItem, { borderBottomColor: colors.border }]}
      onPress={() => handleLocationSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.locationIcon}>
        <Ionicons
          name={item.type === 'current' ? 'location' : 'location-outline'}
          size={config.iconSize}
          color={item.type === 'current' ? colors.primary : colors.textSecondary}
        />
      </View>
      
      <View style={styles.locationInfo}>
        <Text style={[styles.locationName, { color: colors.text }]}>
          {item.name}
        </Text>
        {item.fullName && (
          <Text style={[styles.locationFullName, { color: colors.textSecondary }]}>
            {item.fullName}
          </Text>
        )}
      </View>
      
      {item.type === 'current' && isLoadingLocation && (
        <View style={styles.loadingIndicator}>
          <Ionicons name="refresh" size={16} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSearchInput = () => (
    <View style={[styles.searchContainer, { borderColor: colors.border }]}>
      <View style={styles.searchIconContainer}>
        <Ionicons name="search" size={config.iconSize} color={colors.textSecondary} />
      </View>
      
      <TextInput
        ref={inputRef}
        style={[
          styles.searchInput,
          {
            height: config.inputHeight,
            fontSize: config.fontSize,
            color: colors.text,
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={searchQuery}
        onChangeText={handleSearch}
        onFocus={() => setShowDropdown(true)}
        returnKeyType="search"
      />
      
      {searchQuery.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            setSearchQuery('');
            setSearchResults([]);
          }}
        >
          <Ionicons name="close-circle" size={config.iconSize} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderContent = () => {
    const displayLocations = searchQuery 
      ? searchResults 
      : [
          ...(currentLocation ? [currentLocation] : []),
          ...(showRecentLocations ? recentLocations : []),
          ...popularLocations,
        ];

    return (
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.h3, styles.headerTitle, { color: colors.text }]}>
            Select Location
          </Text>
          {variant === 'modal' && onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Input */}
        {enableSearch && renderSearchInput()}

        {/* Current Location Button */}
        {enableCurrentLocation && !currentLocation && (
          <View style={styles.currentLocationContainer}>
            <ModernButton
              variant="outline"
              size={size}
              onPress={getCurrentLocation}
              loading={isLoadingLocation}
              icon={<Ionicons name="location" size={config.iconSize} color={colors.primary} />}
              style={styles.currentLocationButton}
            >
              Use Current Location
            </ModernButton>
          </View>
        )}

        {/* Results List */}
        <View style={styles.resultsList}>
          {isLoading ? (
            <LoadingSkeletons variant="list-item" count={3} />
          ) : (
            <>
              {!searchQuery && recentLocations.length > 0 && (
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Recent Locations
                </Text>
              )}
              
              {!searchQuery && !recentLocations.length && (
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Popular Locations
                </Text>
              )}
              
              <FlatList
                data={displayLocations}
                renderItem={renderLocationItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                maxToRenderPerBatch={10}
                windowSize={10}
                keyboardShouldPersistTaps="handled"
              />
            </>
          )}
        </View>
      </View>
    );
  };

  if (variant === 'inline') {
    return (
      <View style={[styles.inlineContainer, style]}>
        {renderSearchInput()}
        {showDropdown && (
          <View style={[styles.dropdown, { backgroundColor: colors.card }, SHADOWS.md]}>
            <FlatList
              data={searchResults}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item.id}
              maxHeight={200}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    );
  }

  if (variant === 'dropdown') {
    return (
      <View style={[styles.dropdownContainer, style]}>
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
              height: config.inputHeight,
            }
          ]}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={[
            styles.dropdownButtonText,
            { 
              color: selectedLocation ? colors.text : colors.textTertiary,
              fontSize: config.fontSize,
            }
          ]}>
            {selectedLocation?.name || placeholder}
          </Text>
          <Ionicons 
            name={showDropdown ? "chevron-up" : "chevron-down"} 
            size={config.iconSize} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
        
        {showDropdown && (
          <View style={[styles.dropdown, { backgroundColor: colors.card }, SHADOWS.md]}>
            {renderContent()}
          </View>
        )}
      </View>
    );
  }

  // Modal variant (default)
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.modalOverlay,
          { opacity: fadeAnim }
        ]}
      >
        <BlurView
          intensity={20}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.card,
              transform: [{ scale: scaleAnim }],
            },
            SHADOWS.lg,
          ]}
        >
          {renderContent()}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: screenHeight * 0.8,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  
  // Inline styles
  inlineContainer: {
    position: 'relative',
  },
  
  // Dropdown styles
  dropdownContainer: {
    position: 'relative',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.md,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
  },
  dropdownButtonText: {
    flex: 1,
    fontWeight: tokens.fontWeight.normal,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: tokens.spacing.xs,
    maxHeight: 300,
  },

  // Content styles
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontWeight: tokens.fontWeight.semibold,
    letterSpacing: tokens.letterSpacing.tight,
  },
  closeButton: {
    padding: tokens.spacing.xs,
  },

  // Search styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: tokens.spacing.lg,
    marginTop: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'transparent',
  },
  searchIconContainer: {
    paddingLeft: tokens.spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: tokens.spacing.sm,
    fontWeight: tokens.fontWeight.normal,
  },
  clearButton: {
    paddingRight: tokens.spacing.md,
  },

  // Current location styles
  currentLocationContainer: {
    paddingHorizontal: tokens.spacing.lg,
    marginBottom: tokens.spacing.sm,
  },
  currentLocationButton: {
    marginBottom: tokens.spacing.sm,
  },

  // Results styles
  resultsList: {
    flex: 1,
    paddingHorizontal: tokens.spacing.lg,
  },
  sectionTitle: {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    marginBottom: tokens.spacing.sm,
    marginTop: tokens.spacing.xs,
  },

  // Location item styles
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  locationIcon: {
    marginRight: tokens.spacing.sm,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: tokens.fontSize.base,
    fontWeight: tokens.fontWeight.medium,
    marginBottom: 2,
  },
  locationFullName: {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.normal,
  },
  loadingIndicator: {
    padding: tokens.spacing.xs,
  },
});

export default LocationSelector;