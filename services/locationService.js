/**
 * Location Service for LockerRoom Talk App Anonymous Dating Review Platform
 * Provides comprehensive location functionality with autocomplete and geospatial features
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import logger from '../utils/logger';

export class LocationService {
  static STORAGE_KEYS = {
    SELECTED_LOCATION: 'selectedLocation',
    LOCATION_HISTORY: 'locationHistory',
    LOCATION_PERMISSIONS: 'locationPermissions',
  };

  /**
   * Request location permissions
   * @returns {Promise<boolean>} Whether permission was granted
   */
  static async requestLocationPermission() {
    try {
      if (__DEV__) {
        __DEV__ && console.log('Requesting location permission...');
      }

      // Use Expo Location for real permission request
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';

      // Store permission status
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.LOCATION_PERMISSIONS,
        JSON.stringify({ granted, timestamp: Date.now() })
      );

      return granted;
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Location permission error:', error);
      }
      return false;
    }
  }

  /**
   * Get current location
   * @returns {Promise<{latitude: number, longitude: number, accuracy: number, timestamp: number}>} Current location coordinates
   */
  static async getCurrentLocation() {
    try {
      if (__DEV__) {
        __DEV__ && console.log('Getting current location...');
      }

      // Use Expo Location for real location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000,
        maximumAge: 10000
      });

      const result = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      if (__DEV__) {
        __DEV__ && console.log('Current location obtained:', result);
      }

      return result;
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Geolocation error:', error);
      }
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to location name
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<Object>} Location information
   */
  static async reverseGeocode(latitude, longitude) {
    try {
      if (__DEV__) {
        __DEV__ && console.log(`Reverse geocoding: ${latitude}, ${longitude}`);
      }

      // Use Expo Location for real reverse geocoding
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const result = {
          name: `${address.city || address.subregion || address.region}, ${address.region || address.country}`,
          city: address.city || address.subregion || '',
          region: address.region || '',
          state: address.region || '',
          country: address.country || '',
          coordinates: [longitude, latitude],
          formatted: `${address.city || address.subregion || address.region}, ${address.region || address.country}`,
        };

        if (__DEV__) {
          __DEV__ && console.log('Reverse geocoding result:', result);
        }

        return result;
      }

      return null;
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Reverse geocoding error:', error);
      }
      return null;
    }
  }

  /**
   * Search for locations with autocomplete
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of location suggestions
   */
  static async searchLocations(query) {
    try {
      if (__DEV__) {
        __DEV__ && console.log(`Searching locations for: ${query}`);
      }
      
      if (!query || query.length < 2) {
        return [];
      }
      
      // Mock location search results
      const mockResults = [
        {
          id: 'sf-1',
          name: 'San Francisco, CA, USA',
          city: 'San Francisco',
          region: 'California',
          country: 'United States',
          coordinates: [-122.4194, 37.7749],
          type: 'city',
        },
        {
          id: 'sf-2',
          name: 'South of Market, San Francisco, CA',
          city: 'San Francisco',
          region: 'California',
          country: 'United States',
          coordinates: [-122.4089, 37.7849],
          type: 'neighborhood',
        },
        {
          id: 'ny-1',
          name: 'New York, NY, USA',
          city: 'New York',
          region: 'New York',
          country: 'United States',
          coordinates: [-74.0060, 40.7128],
          type: 'city',
        },
        {
          id: 'la-1',
          name: 'Los Angeles, CA, USA',
          city: 'Los Angeles',
          region: 'California',
          country: 'United States',
          coordinates: [-118.2437, 34.0522],
          type: 'city',
        },
        {
          id: 'chicago-1',
          name: 'Chicago, IL, USA',
          city: 'Chicago',
          region: 'Illinois',
          country: 'United States',
          coordinates: [-87.6298, 41.8781],
          type: 'city',
        },
        {
          id: 'miami-1',
          name: 'Miami, FL, USA',
          city: 'Miami',
          region: 'Florida',
          country: 'United States',
          coordinates: [-80.1918, 25.7617],
          type: 'city',
        },
      ];
      
      // Filter results based on query
      const filtered = mockResults.filter(location =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.city.toLowerCase().includes(query.toLowerCase())
      );
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return filtered.slice(0, 10); // Return max 10 results
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Location search error:', error);
      }
      return [];
    }
  }

  /**
   * Save selected location to storage
   * @param {Object} location - Location object to save
   */
  static async saveSelectedLocation(location) {
    try {
      if (__DEV__) {
        __DEV__ && console.log('Saving selected location:', location);
      }
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.SELECTED_LOCATION, 
        JSON.stringify({
          ...location,
          savedAt: Date.now(),
        })
      );
      
      // Also add to location history
      await this.addToLocationHistory(location);
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Save location error:', error);
      }
    }
  }

  /**
   * Get saved location from storage
   * @returns {Promise<Object|null>} Saved location or null
   */
  static async getSelectedLocation() {
    try {
      const locationData = await AsyncStorage.getItem(this.STORAGE_KEYS.SELECTED_LOCATION);
      if (locationData) {
        const location = JSON.parse(locationData);
        if (__DEV__) {
          __DEV__ && console.log('Retrieved saved location:', location);
        }
        return location;
      }
      return null;
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Get location error:', error);
      }
      return null;
    }
  }

  /**
   * Add location to search history
   * @param {Object} location - Location to add to history
   */
  static async addToLocationHistory(location) {
    try {
      const historyData = await AsyncStorage.getItem(this.STORAGE_KEYS.LOCATION_HISTORY);
      let history = historyData ? JSON.parse(historyData) : [];

      // Remove duplicate if exists
      history = history.filter(item => item.id !== location.id);

      // Add to beginning of array
      history.unshift({
        ...location,
        searchedAt: Date.now(),
      });

      // Keep only last 20 searches
      history = history.slice(0, 20);
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.LOCATION_HISTORY, JSON.stringify(history));
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Add to history error:', error);
      }
    }
  }

  /**
   * Get location search history
   * @returns {Promise<Array>} Array of previously searched locations
   */
  static async getLocationHistory() {
    try {
      const historyData = await AsyncStorage.getItem(this.STORAGE_KEYS.LOCATION_HISTORY);
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Get history error:', error);
      }
      return [];
    }
  }

  /**
   * Clear location history
   */
  static async clearLocationHistory() {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEYS.LOCATION_HISTORY);
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Clear history error:', error);
      }
    }
  }

  /**
   * Calculate distance between two coordinates
   * @param {number} lat1 - First latitude
   * @param {number} lon1 - First longitude
   * @param {number} lat2 - Second latitude
   * @param {number} lon2 - Second longitude
   * @returns {number} Distance in kilometers
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  /**
   * Convert degrees to radians
   * @param {number} deg - Degrees
   * @returns {number} Radians
   */
  static deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Get popular locations for suggestions
   * @returns {Array} Array of popular locations
   */
  static getPopularLocations() {
    return [
      {
        id: 'popular-sf',
        name: 'San Francisco, CA',
        city: 'San Francisco',
        region: 'California',
        country: 'United States',
        coordinates: [-122.4194, 37.7749],
        type: 'city',
        isPopular: true,
      },
      {
        id: 'popular-ny',
        name: 'New York, NY',
        city: 'New York',
        region: 'New York',
        country: 'United States',
        coordinates: [-74.0060, 40.7128],
        type: 'city',
        isPopular: true,
      },
      {
        id: 'popular-la',
        name: 'Los Angeles, CA',
        city: 'Los Angeles',
        region: 'California',
        country: 'United States',
        coordinates: [-118.2437, 34.0522],
        type: 'city',
        isPopular: true,
      },
    ];
  }
}

export default LocationService;
