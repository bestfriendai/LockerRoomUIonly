import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react-native';
import Text from '@/components/ui/Text';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import * as Location from 'expo-location';

export default function LocationSetupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationName, setLocationName] = useState('');
  const [error, setError] = useState('');
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const requestLocationPermission = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission is required to find matches near you');
        setIsLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);

      // Reverse geocode to get location name
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationStr = `${address.city || address.subregion || address.region}, ${address.country}`;
        setLocationName(locationStr);
      }

      // Update user profile with location
      await updateProfile({
        location: locationName,
      });

    } catch (err: any) {
      setError(err.message || 'Failed to get location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (user?.profileComplete) {
      router.replace('/(tabs)');
    } else {
      router.push('/(auth)/profile-setup');
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Location Setup?',
      'You can enable location services later in settings to find matches near you.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip',
          onPress: handleContinue,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.5 : 1 },
          ]}
        >
          <ArrowLeft color={colors.text} size={24} strokeWidth={1.5} />
        </Pressable>
        
        <Pressable
          onPress={handleSkip}
          style={({ pressed }) => [
            styles.skipButton,
            { opacity: pressed ? 0.5 : 1 },
          ]}
        >
          <Text variant="body" weight="medium" style={{ color: colors.primary }}>
            Skip for now
          </Text>
        </Pressable>
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
            <MapPin color={colors.primary} size={48} strokeWidth={1.5} />
          </View>
        </View>

        <View style={styles.textSection}>
          <Text
            variant="h2"
            weight="semibold"
            style={{ color: colors.text, marginBottom: 12, textAlign: 'center' }}
          >
            Enable Location
          </Text>
          <Text
            variant="body"
            style={{
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 24,
            }}
          >
            We use your location to show you people and reviews nearby. Your exact location is never shared with other users.
          </Text>
        </View>

        {location && locationName ? (
          <View style={[styles.locationCard, { backgroundColor: colors.cardBg }]}>
            <Navigation color={colors.primary} size={20} strokeWidth={1.5} />
            <Text
              variant="body"
              weight="medium"
              style={{ color: colors.text, marginLeft: 12 }}
            >
              {locationName}
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: colors.errorBg }]}>
            <Text variant="bodySmall" style={{ color: colors.error, textAlign: 'center' }}>
              {error}
            </Text>
          </View>
        ) : null}

        <View style={styles.buttonSection}>
          {!location ? (
            <TouchableOpacity
              style={[
                styles.enableButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={requestLocationPermission}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.onPrimary} size="small" />
              ) : (
                <>
                  <MapPin color={colors.onPrimary} size={20} strokeWidth={1.5} />
                  <Text
                    variant="body"
                    weight="semibold"
                    style={{ color: colors.onPrimary, marginLeft: 8 }}
                  >
                    Enable Location
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.continueButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleContinue}
            >
              <Text
                variant="body"
                weight="semibold"
                style={{ color: colors.onPrimary }}
              >
                Continue
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.privacyNote}>
          <Text
            variant="caption"
            style={{
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 18,
            }}
          >
            Your privacy is important to us. We only use your location to improve your experience and never share your exact location with other users.
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  buttonSection: {
    marginBottom: 24,
  },
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  continueButton: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    paddingVertical: 16,
    width: '100%',
  },
  enableButton: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    width: '100%',
  },
  errorContainer: {
    borderRadius: 8,
    marginBottom: 24,
    padding: 12,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 60,
    height: 120,
    justifyContent: 'center',
    width: 120,
  },
  iconContainer: {
    marginBottom: 32,
  },
  locationCard: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 24,
    padding: 16,
    width: '100%',
  },
  privacyNote: {
    paddingHorizontal: 20,
  },
  skipButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  textSection: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
});