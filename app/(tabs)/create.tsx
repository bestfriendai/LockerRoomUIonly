import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Camera, Image as ImageIcon, X, ChevronDown, Check, Flag } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useTheme } from "../../providers/ThemeProvider";
import { useAuth } from "../../providers/AuthProvider";
import { ModernButton } from "../../components/ui/ModernButton";
import { Input } from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { LocationSelector } from "../../components/LocationSelector";
import { LocationService } from "../../services/locationService";
import { createTypographyStyles } from "../../styles/typography";
import { SHADOWS, BORDER_RADIUS } from "../../constants/shadows";



type MediaItem = {
  id: string;
  uri: string;
  type: 'image' | 'video';
};

type LocationSuggestion = {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
};

const _categories = ['Men', 'Women', 'LGBT'];

const platforms = [
  'Tinder', 'Bumble', 'Hinge', 'Instagram', 'Snapchat', 'WhatsApp', 'LinkedIn', 'Facebook', 'Twitter', 'Other'
];

export default function CreateReviewScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuth();
  const typography = createTypographyStyles(colors);

  // Form state
  const [personName, setPersonName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [flag, setFlag] = useState<'green' | 'red' | null>(null);
  const [platform, setPlatform] = useState("");
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [location, setLocation] = useState<string>("");
  const [_locationSuggestions, _setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [_showLocationSuggestions, _setShowLocationSuggestions] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New location system state
  const [selectedLocationData, setSelectedLocationData] = useState<any>(null);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock location suggestions
  const mockLocationSuggestions: LocationSuggestion[] = [
    { id: '1', name: 'Central Park', address: 'New York, NY, USA' },
    { id: '2', name: 'Times Square', address: 'New York, NY, USA' },
    { id: '3', name: 'Brooklyn Bridge', address: 'Brooklyn, NY, USA' },
    { id: '4', name: 'Statue of Liberty', address: 'New York, NY, USA' },
    { id: '5', name: 'Empire State Building', address: 'New York, NY, USA' },
  ];

  // New location handling
  const handleLocationSelect = useCallback((locationData: any) => {
    setSelectedLocationData(locationData);
    // Also update the old location field for backward compatibility
    if (locationData.data && locationData.data.name) {
      setLocation(locationData.data.name);
    }
  }, []);

  // Load saved location on component mount
  useEffect(() => {
    const loadSavedLocation = async () => {
      const savedLocation = await LocationService.getSelectedLocation();
      if (savedLocation) {
        setSelectedLocationData({
          type: 'selected',
          data: savedLocation,
        });
        setLocation((savedLocation as any).name || (savedLocation as any).city || 'Unknown Location');
      }
    };

    loadSavedLocation();
  }, []);

  // Get current location (legacy function - kept for compatibility)
  const _getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to get your current location.');
        return;
      }

      const _currentLocation = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: _currentLocation.coords.latitude,
        longitude: _currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0] as any;
        const locationString = `${address.city}, ${address.region}, ${address.country}`;
        setLocation(locationString);
      }
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error getting location:', error);
      }
      Alert.alert('Error', 'Failed to get your current location.');
    }
  };

  // Handle location search
  const _handleLocationSearch = useCallback((query: string) => {
    setLocation(query);
    if (query.length > 2) {
      const filtered = mockLocationSuggestions.filter(suggestion =>
        suggestion.name.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.address.toLowerCase().includes(query.toLowerCase())
      );
      // _setLocationSuggestions(filtered);
      // _setShowLocationSuggestions(true);
    } else {
      // _setShowLocationSuggestions(false);
    }
  }, []);

  // Handle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Handle media selection
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera roll permission is required to select images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newMedia: MediaItem = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        type: 'image',
      };
      setMedia(prev => [...prev, newMedia]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newMedia: MediaItem = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        type: 'image',
      };
      setMedia(prev => [...prev, newMedia]);
    }
  };

  const removeMedia = (id: string) => {
    setMedia(prev => prev.filter(item => item.id !== id));
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!personName.trim()) {
      newErrors.personName = 'Person name is required';
    }

    if (selectedCategories.length === 0) {
      newErrors.categories = 'At least one category is required';
    }

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!content.trim()) {
      newErrors.content = 'Review content is required';
    } else if (content.length < 10) {
      newErrors.content = "Review must be at least 10 characters long";
    }
    if (!flag) {
      newErrors.flag = "Please select a flag (green or red)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    if (!user) {
      Alert.alert("Authentication Error", "You must be logged in to submit a review.");
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        authorId: user.id,
        targetName: personName,
        category: selectedCategories.join(', '),
        content,
        rating: flag === 'green' ? 5 : 1,
        isAnonymous,
        title,
        platform: platform || '',
        location: selectedLocationData ? selectedLocationData.data.name : location,
        locationData: selectedLocationData || null,
        coordinates: selectedLocationData?.data?.coordinates || null,
        media: media.map(m => m.uri),
        verified: false,
        likes: 0,
        dislikes: 0,
        comments: [],
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, "reviews"), reviewData);

      Alert.alert(
        'Review Submitted!',
        'Your review has been submitted successfully and is now live.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setPersonName("");
              setSelectedCategories([]);
              setTitle("");
              setContent("");
              setFlag(null);
              setPlatform("");
              setMedia([]);
              setLocation("");
              setIsAnonymous(true);
              setErrors({});
              
              // Navigate back to home
              router.push('/(tabs)/');
            }
          }
        ]
      );
    } catch {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFlagOptions = () => {
    return (
      <View style={styles.flagContainer}>
        <Pressable
          onPress={() => setFlag('green')}
          style={[
            styles.flagButton,
            {
              backgroundColor: flag === 'green' ? '#10B981' : colors.surfaceElevated,
              borderColor: flag === 'green' ? '#10B981' : colors.border,
            }
          ]}
        >
          <Flag
            size={24}
            color={flag === 'green' ? '#FFFFFF' : '#10B981'}
            fill={flag === 'green' ? '#FFFFFF' : 'none'}
            strokeWidth={1.5}
          />
          <Text style={{
              color: flag === 'green' ? '#FFFFFF' : '#10B981',
              marginLeft: 8
            }}
          >
            Green Flag
          </Text>
        </Pressable>
        
        <Pressable
          onPress={() => setFlag('red')}
          style={[
            styles.flagButton,
            {
              backgroundColor: flag === 'red' ? '#EF4444' : colors.surfaceElevated,
              borderColor: flag === 'red' ? '#EF4444' : colors.border,
            }
          ]}
        >
          <Flag
            size={24}
            color={flag === 'red' ? '#FFFFFF' : '#EF4444'}
            fill={flag === 'red' ? '#FFFFFF' : 'none'}
            strokeWidth={1.5}
          />
          <Text style={{
              color: flag === 'red' ? '#FFFFFF' : '#EF4444',
              marginLeft: 8
            }}
          >
            Red Flag
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Modern Header */}
          <View style={[styles.header, { backgroundColor: colors.surface }, SHADOWS.sm]}>
            <Text style={typography.h1}>
              Create Review
            </Text>
            <Text style={[typography.body, { marginTop: 8, color: colors.textSecondary }]}>
              Share your experience with others anonymously
            </Text>
          </View>

          {/* Person Name */}
          <Card style={[styles.section, SHADOWS.sm]}>
            <Text style={[typography.h3, { marginBottom: 12 }]}>
              Who are you reviewing? *
            </Text>
            <Input
              placeholder="Enter person's name or username"
              value={personName}
              onChangeText={setPersonName}
              error={errors.personName}
              style={styles.input}
            />
          </Card>

          {/* Categories */}
          <Card style={styles.section}>
            <Text style={typography.h2}>
              Categories
            </Text>
            {errors.categories && (
              <Text style={{ color: colors.error, marginBottom: 8 }}>
                {errors.categories}
              </Text>
            )}
            <View style={styles.categoriesGrid}>
              {_categories.map((category: string) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <Pressable
                    key={category}
                    onPress={() => toggleCategory(category)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceElevated,
                        borderColor: isSelected ? colors.primary : colors.border,
                      }
                    ]}
                  >
                    <Text style={{
                        color: isSelected ? colors.onPrimary : colors.text
                      }}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          {/* Enhanced Flag Selection */}
          <Card style={[styles.section, SHADOWS.sm]}>
            <Text style={[typography.h3, { marginBottom: 8 }]}>
              Flag Type *
            </Text>
            <Text style={[typography.body, { marginBottom: 16, color: colors.textSecondary }]}>
              Is this a positive (green) or negative (red) experience?
            </Text>
            {renderFlagOptions()}
            {errors.flag && (
              <Text style={[typography.error, { marginTop: 12 }]}>
                {errors.flag}
              </Text>
            )}
          </Card>

          {/* Title */}
          <Card style={styles.section}>
            <Text style={typography.h2}>
              Review Title
            </Text>
            <Input
              placeholder="Summarize your experience in a few words"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
              maxLength={100}
              style={styles.input}
            />
          </Card>

          {/* Content */}
          <Card style={styles.section}>
            <Text style={typography.h2}>
              Your Review
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: errors.content ? colors.error : colors.border,
                  color: colors.text,
                }
              ]}
              placeholder="Share your detailed experience... (minimum 50 characters)"
              placeholderTextColor={colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <View style={styles.characterCount}>
              <Text style={{ color: colors.textSecondary }}>
                {content.length}/1000 characters
              </Text>
            </View>
            {errors.content && (
              <Text style={{ color: colors.error, marginTop: 4 }}>
                {errors.content}
              </Text>
            )}
          </Card>

          {/* Platform */}
          <Card style={styles.section}>
             <Text style={[typography.h2, { marginBottom: 12 }]}>
               Platform (Optional)
             </Text>
            <Pressable
              onPress={() => setShowPlatformPicker(!showPlatformPicker)}
              style={[
                styles.platformPicker,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                }
              ]}
            >
              <Text style={{
                  color: platform ? colors.text : colors.textSecondary,
                  flex: 1
                }}
              >
                {platform || 'Select platform'}
              </Text>
              <ChevronDown size={20} color={colors.textSecondary} strokeWidth={1.5} />
            </Pressable>
            {showPlatformPicker && (
              <View style={[styles.platformList, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                {platforms.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => {
                      setPlatform(p);
                      setShowPlatformPicker(false);
                    }}
                    style={styles.platformItem}
                  >
                    <Text style={{ color: colors.text }}>
                      {p}
                    </Text>
                    {platform === p && (
                      <Check size={16} color={colors.primary} strokeWidth={2} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </Card>

          {/* Location */}
          <Card style={styles.section}>
             <Text style={[typography.h2, { marginBottom: 8 }]}>
               Location (Optional)
             </Text>
             <Text style={[typography.body, { color: colors.textSecondary, marginBottom: 12 }]}>
               Where did this experience take place?
             </Text>

            <LocationSelector
              onLocationSelect={handleLocationSelect}
              currentLocation={selectedLocationData}
              style={styles.locationSelector}
            />

            {selectedLocationData && (
              <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
                📍 {selectedLocationData.data.name}
              </Text>
            )}
          </Card>

          {/* Media */}
          <Card style={styles.section}>
             <Text style={[typography.h2, { marginBottom: 12 }]}>
               Photos (Optional)
             </Text>
            <View style={styles.mediaContainer}>
              {media.map((item) => (
                <View key={item.id} style={styles.mediaItem}>
                  <ImageIcon size={40} color={colors.textSecondary} strokeWidth={1.5} />
                  <Pressable
                    onPress={() => removeMedia(item.id)}
                    style={[styles.removeMediaButton, { backgroundColor: colors.error }]}
                  >
                    <X size={12} color={colors.surface} strokeWidth={2} />
                  </Pressable>
                </View>
              ))}
              {media.length < 5 && (
                <View style={styles.mediaActions}>
                  <Pressable
                    onPress={pickImage}
                    style={[styles.mediaButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                  >
                    <ImageIcon size={20} color={colors.textSecondary} strokeWidth={1.5} />
                    <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                      Gallery
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={takePhoto}
                    style={[styles.mediaButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                  >
                    <Camera size={20} color={colors.textSecondary} strokeWidth={1.5} />
                    <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                      Camera
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </Card>

          {/* Anonymous Option */}
          <Card style={styles.section}>
            <Pressable
              onPress={() => setIsAnonymous(!isAnonymous)}
              style={styles.anonymousOption}
            >
               <View style={styles.anonymousInfo}>
                 <Text style={[typography.body, { fontWeight: '500' }]}>
                   Post Anonymously
                 </Text>
                 <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                   Your name won't be visible to others
                 </Text>
               </View>
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: isAnonymous ? colors.primary : 'transparent',
                    borderColor: isAnonymous ? colors.primary : colors.border,
                  }
                ]}
              >
                {isAnonymous && (
                  <Check size={16} color={colors.surface} strokeWidth={2} />
                )}
              </View>
            </Pressable>
          </Card>

          {/* Modern Submit Button */}
          <ModernButton
            variant="gradient"
            size="lg"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            fullWidth
            accessibilityLabel="Submit review"
          >
            {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
          </ModernButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anonymousInfo: {
    flex: 1,
  },
  anonymousOption: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryChip: {
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 32,
    padding: 20,
    borderRadius: BORDER_RADIUS.xl,
    marginHorizontal: 4,
  },
  input: {
    marginBottom: 0,
  },
  keyboardAvoid: {
    flex: 1,
  },
  locationSelector: {
    width: '100%',
  },
  mediaActions: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaButton: {
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    height: 90,
    justifyContent: 'center',
    width: 90,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: BORDER_RADIUS.lg,
    height: 90,
    justifyContent: 'center',
    position: 'relative',
    width: 90,
  },
  platformItem: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  platformList: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginTop: 12,
    maxHeight: 240,
  },
  platformPicker: {
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  removeMediaButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: -8,
    top: -8,
    width: 24,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    padding: 20,
    borderRadius: BORDER_RADIUS.xl,
  },
  flagContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  flagButton: {
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  submitButton: {
    marginTop: 24,
    marginHorizontal: 4,
  },
  textArea: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 140,
    padding: 16,
    textAlignVertical: 'top',
  },
});
