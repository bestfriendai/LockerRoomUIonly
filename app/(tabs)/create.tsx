import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, StyleSheet, ScrollView, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Camera, Image as ImageIcon, MapPin, X, Plus, Star, ChevronDown, Check, Flag } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import Text from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/utils/firebase";

const { width: screenWidth } = Dimensions.get('window');

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

const categories = ['Men', 'Women', 'LGBT'];

const platforms = [
  'Tinder', 'Bumble', 'Hinge', 'Instagram', 'Snapchat', 'WhatsApp', 'LinkedIn', 'Facebook', 'Twitter', 'Other'
];

export default function CreateReviewScreen() {
  const router = useRouter();
  const { colors, tokens, isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuth();

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
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to get your current location.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationString = `${address.city}, ${address.region}, ${address.country}`;
        setLocation(locationString);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location.');
    }
  };

  // Handle location search
  const handleLocationSearch = useCallback((query: string) => {
    setLocation(query);
    if (query.length > 2) {
      const filtered = mockLocationSuggestions.filter(suggestion =>
        suggestion.name.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.address.toLowerCase().includes(query.toLowerCase())
      );
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
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
        userId: user.id,
        targetId: personName, // Assuming personName is the targetId for now
        targetType: 'user',
        rating: flag === 'green' ? 5 : 1, // Simple mapping from flag to rating
        title,
        content,
        timestamp: serverTimestamp(),
        likes: 0,
        dislikes: 0,
        comments: [],
        media: media.map(m => m.uri), // Storing URIs for now, will need to implement upload
        verified: false,
        category: selectedCategories.join(', '),
        platform,
        isAnonymous,
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
    } catch (error) {
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
          <Text
            variant="body"
            weight="medium"
            style={{
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
          <Text
            variant="body"
            weight="medium"
            style={{
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
          {/* Header */}
          <View style={styles.header}>
            <Text variant="h2" weight="bold">
              Create Review
            </Text>
            <Text variant="body" style={{ color: colors.textSecondary, marginTop: 4 }}>
              Share your experience with others
            </Text>
          </View>

          {/* Person Name */}
          <Card style={styles.section}>
            <Text variant="body" weight="medium" style={styles.sectionTitle}>
              Who are you reviewing?
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
            <Text variant="body" weight="medium" style={styles.sectionTitle}>
              Categories
            </Text>
            {errors.categories && (
              <Text variant="caption" style={{ color: colors.error, marginBottom: 8 }}>
                {errors.categories}
              </Text>
            )}
            <View style={styles.categoriesGrid}>
              {categories.map((category) => {
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
                    <Text
                      variant="body"
                      weight="medium"
                      style={{
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

          {/* Flag Selection */}
          <Card style={styles.section}>
            <Text variant="body" weight="medium" style={styles.sectionTitle}>
              Flag Type *
            </Text>
            <Text variant="bodySmall" style={{ color: colors.textSecondary, marginBottom: 12 }}>
              Choose whether this is a positive (green flag) or negative (red flag) experience
            </Text>
            {renderFlagOptions()}
            {errors.flag && (
              <Text variant="caption" style={{ color: colors.error, marginTop: 8 }}>
                {errors.flag}
              </Text>
            )}
          </Card>

          {/* Title */}
          <Card style={styles.section}>
            <Text variant="body" weight="medium" style={styles.sectionTitle}>
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
            <Text variant="body" weight="medium" style={styles.sectionTitle}>
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
              <Text variant="caption" style={{ color: colors.textSecondary }}>
                {content.length}/1000 characters
              </Text>
            </View>
            {errors.content && (
              <Text variant="caption" style={{ color: colors.error, marginTop: 4 }}>
                {errors.content}
              </Text>
            )}
          </Card>

          {/* Platform */}
          <Card style={styles.section}>
            <Text variant="body" weight="medium" style={styles.sectionTitle}>
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
              <Text
                variant="body"
                style={{
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
                    <Text variant="body" style={{ color: colors.text }}>
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
            <Text variant="body" weight="medium" style={styles.sectionTitle}>
              Location (Optional)
            </Text>
            <View style={styles.locationContainer}>
              <Input
                placeholder="Add location"
                value={location}
                onChangeText={handleLocationSearch}
                style={[styles.input, { flex: 1 }]}
                leftIcon={<MapPin size={16} color={colors.textSecondary} strokeWidth={1.5} />}
              />
              <Button
                variant="outline"
                size="sm"
                onPress={getCurrentLocation}
                style={styles.locationButton}
              >
                Current
              </Button>
            </View>
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <View style={[styles.locationSuggestions, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                {locationSuggestions.map((suggestion) => (
                  <Pressable
                    key={suggestion.id}
                    onPress={() => {
                      setLocation(suggestion.address);
                      setShowLocationSuggestions(false);
                    }}
                    style={styles.locationSuggestion}
                  >
                    <MapPin size={16} color={colors.textSecondary} strokeWidth={1.5} />
                    <View style={styles.locationInfo}>
                      <Text variant="body" style={{ color: colors.text }}>
                        {suggestion.name}
                      </Text>
                      <Text variant="caption" style={{ color: colors.textSecondary }}>
                        {suggestion.address}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </Card>

          {/* Media */}
          <Card style={styles.section}>
            <Text variant="body" weight="medium" style={styles.sectionTitle}>
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
                    <Text variant="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>
                      Gallery
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={takePhoto}
                    style={[styles.mediaButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                  >
                    <Camera size={20} color={colors.textSecondary} strokeWidth={1.5} />
                    <Text variant="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>
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
                <Text variant="body" weight="medium">
                  Post Anonymously
                </Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
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

          {/* Submit Button */}
          <Button
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
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
    gap: 8,
  },
  categoryChip: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 0,
  },
  keyboardAvoid: {
    flex: 1,
  },
  locationButton: {
    paddingHorizontal: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 8,
  },
  locationSuggestion: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    padding: 12,
  },
  locationSuggestions: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    maxHeight: 200,
  },
  mediaActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaItem: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    height: 80,
    justifyContent: 'center',
    position: 'relative',
    width: 80,
  },
  platformItem: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  platformList: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    maxHeight: 200,
  },
  platformPicker: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 12,
  },
  removeMediaButton: {
    alignItems: 'center',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -6,
    top: -6,
    width: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  flagContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  flagButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  submitButton: {
    marginTop: 8,
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    minHeight: 120,
    padding: 12,
  },
});