/**
 * LocationSelector Component for MockTrae
 * Provides Current Location / Pick Location / Global options with autocomplete
 */

import React, { useState, useEffect, useRef } from 'react';
import {
import logger from '../utils/logger';
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { LocationService } from '../services/locationService';

interface LocationData {
  id: string;
  name: string;
  city?: string;
  region?: string;
  country?: string;
  coordinates: [number, number];
  type?: string;
}

interface LocationSelection {
  type: 'current' | 'selected' | 'global';
  data: LocationData | { name: string; coordinates: null };
}

interface LocationSelectorProps {
  onLocationSelect: (location: LocationSelection) => void;
  currentLocation?: LocationSelection | null;
  style?: any;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  currentLocation,
  style,
}) => {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const locationOptions = [
    {
      id: 'current',
      name: 'Current Location',
      icon: 'location' as const,
      description: 'Use your current location',
      color: '#007AFF',
    },
    {
      id: 'global',
      name: 'Global',
      icon: 'globe' as const,
      description: 'See reviews from everywhere',
      color: '#34C759',
    },
    {
      id: 'pick',
      name: 'Pick a Location',
      icon: 'search' as const,
      description: 'Search for a specific location',
      color: '#FF9500',
    },
  ];

  useEffect(() => {
    loadLocationHistory();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      
      searchTimeout.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const results = await LocationService.searchLocations(searchQuery);
          setSearchResults(results);
        } catch (error) {
          if (__DEV__) {
            __DEV__ && console.error('Search error:', error);
          }
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const loadLocationHistory = async () => {
    try {
      const history = await LocationService.getLocationHistory();
      setLocationHistory(history);
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error loading location history:', error);
      }
    }
  };

  const handleCurrentLocation = async () => {
    try {
      setIsGettingCurrentLocation(true);
      
      const hasPermission = await LocationService.requestLocationPermission();
      
      if (hasPermission) {
        const position = await LocationService.getCurrentLocation();
        const locationData = await LocationService.reverseGeocode(
          position.latitude,
          position.longitude
        );

        if (locationData) {
          const selection: LocationSelection = {
            type: 'current',
            data: locationData as LocationData,
          };
          
          onLocationSelect(selection);
          await LocationService.saveSelectedLocation(locationData);
          setIsVisible(false);
        } else {
          Alert.alert('Error', 'Unable to determine your location. Please try again.');
        }
      } else {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions to use current location feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {/* Open settings */} }
          ]
        );
      }
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Current location error:', error);
      }
      Alert.alert('Error', 'Unable to get current location. Please try again.');
    } finally {
      setIsGettingCurrentLocation(false);
    }
  };

  const handleLocationSelect = async (location: LocationData) => {
    try {
      const selection: LocationSelection = {
        type: 'selected',
        data: location,
      };
      
      onLocationSelect(selection);
      await LocationService.saveSelectedLocation(location);
      setIsVisible(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error selecting location:', error);
      }
    }
  };

  const handleGlobalSelect = () => {
    const selection: LocationSelection = {
      type: 'global',
      data: { name: 'Global', coordinates: null },
    };
    
    onLocationSelect(selection);
    setIsVisible(false);
  };

  const getDisplayText = () => {
    if (!currentLocation) return 'Select Location';
    
    switch (currentLocation.type) {
      case 'current':
        return `📍 ${currentLocation.data.name}`;
      case 'global':
        return '🌍 Global';
      case 'selected':
        return `📍 ${currentLocation.data.name}`;
      default:
        return 'Select Location';
    }
  };

  const getDisplayIcon = () => {
    if (!currentLocation) return 'location-outline';
    
    switch (currentLocation.type) {
      case 'current':
        return 'location';
      case 'global':
        return 'globe';
      case 'selected':
        return 'location-outline';
      default:
        return 'location-outline';
    }
  };

  const renderLocationOption = ({ item }: { item: typeof locationOptions[0] }) => (
    <TouchableOpacity
      style={[styles.optionItem, { borderBottomColor: colors.border }]}
      onPress={() => {
        if (item.id === 'current') {
          handleCurrentLocation();
        } else if (item.id === 'global') {
          handleGlobalSelect();
        }
        // For 'pick', just stay in modal for search
      }}
      disabled={item.id === 'current' && isGettingCurrentLocation}
    >
      <View style={[styles.optionIcon, { backgroundColor: `${item.color}20` }]}>
        {item.id === 'current' && isGettingCurrentLocation ? (
          <ActivityIndicator size="small" color={item.color} />
        ) : (
          <Ionicons name={item.icon} size={24} color={item.color} />
        )}
      </View>
      <View style={styles.optionContent}>
        <Text style={[styles.optionName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }: { item: LocationData }) => (
    <TouchableOpacity
      style={[styles.searchResultItem, { borderBottomColor: colors.border }]}
      onPress={() => handleLocationSelect(item)}
    >
      <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
      <View style={styles.searchResultContent}>
        <Text style={[styles.searchResultName, { color: colors.text }]}>
          {item.name}
        </Text>
        {item.city && (
          <Text style={[styles.searchResultDetails, { color: colors.textSecondary }]}>
            {item.city}{item.region && `, ${item.region}`}{item.country && `, ${item.country}`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: LocationData }) => (
    <TouchableOpacity
      style={[styles.searchResultItem, { borderBottomColor: colors.border }]}
      onPress={() => handleLocationSelect(item)}
    >
      <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
      <View style={styles.searchResultContent}>
        <Text style={[styles.searchResultName, { color: colors.text }]}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.locationButton, { 
          backgroundColor: colors.surface,
          borderColor: colors.primary,
        }, style]}
        onPress={() => setIsVisible(true)}
      >
        <Ionicons 
          name={getDisplayIcon()} 
          size={16} 
          color={colors.primary} 
        />
        <Text style={[styles.locationText, { color: colors.primary }]}>
          {getDisplayText()}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.primary} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setIsVisible(false)}>
              <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Location</Text>
            <View style={{ width: 60 }} />
          </View>

          <FlatList
            data={locationOptions}
            renderItem={renderLocationOption}
            keyExtractor={(item) => item.id}
            style={styles.optionsList}
            showsVerticalScrollIndicator={false}
          />

          <View style={[styles.searchSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.searchTitle, { color: colors.text }]}>
              Search for a location
            </Text>
            
            <View style={[styles.searchInputContainer, { 
              backgroundColor: colors.surface,
              borderColor: colors.border 
            }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Enter city, neighborhood, or landmark"
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Searching...
                </Text>
              </View>
            )}

            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id}
                style={styles.searchResults}
                showsVerticalScrollIndicator={false}
              />
            ) : searchQuery.length === 0 && locationHistory.length > 0 ? (
              <>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Recent Searches
                </Text>
                <FlatList
                  data={locationHistory.slice(0, 5)}
                  renderItem={renderHistoryItem}
                  keyExtractor={(item) => `history-${item.id}`}
                  style={styles.searchResults}
                  showsVerticalScrollIndicator={false}
                />
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  locationText: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionsList: {
    paddingHorizontal: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  searchSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchResultContent: {
    marginLeft: 12,
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchResultDetails: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default LocationSelector;
