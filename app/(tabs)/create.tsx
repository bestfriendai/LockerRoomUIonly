import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, StyleSheet, ScrollView, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Camera, Image as ImageIcon, MapPin, X, Plus, Star, ChevronDown, Check } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useTheme } from "@/providers/ThemeProvider";
import Text from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { mockUsers } from "@/data/mockData";

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

const categories = [
  { id: 'dating', label: 'Dating', emoji: '💕' },
  { id: 'social', label: 'Social', emoji: '👥' },
  { id: 'professional', label: 'Professional', emoji: '💼' },
  { id: 'social_media', label: 'Social Media', emoji: '📱' },
  { id: 'app', label: 'App/Platform', emoji: '💻' },
];

const platforms = [
  'Tinder', 'Bumble', 'Hinge', 'Instagram', 'Snapchat', 'WhatsApp', 'LinkedIn', 'Facebook', 'Twitter', 'Other'
];

export default function CreateReviewScreen() {
  const router = useRouter();
  const { colors, tokens, isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  // Form state
  const [personName, setPersonName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [platform, setPlatform] = useState("");
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [location, setLocation] = useState<string>("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
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
    } else if (content.trim().length < 50) {
      newErrors.content = 'Review must be at least 50 characters long';
    }

    if (rating === 0) {
      newErrors.rating = 'Rating is required';
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

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

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
              setRating(0);
              setPlatform("");
              setMedia([]);
              setLocation("");
              setIsAnonymous(false);
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

  const renderStarRating = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Star
              size={32}
              color={star <= rating ? colors.warning : colors.textSecondary}
              fill={star <= rating ? colors.warning : 'transparent'}
              strokeWidth={1.5}
            />
          </Pressable>
        ))}
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
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => toggleCategory(category.id)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceElevated,
                        borderColor: isSelected ? colors.primary : colors.border,
                      }
                    ]}
                  >
                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    <Text
                      variant="bodySmall"
                      weight={isSelected ? "medium" : "normal"}
                      style={{
                        color: isSelected ? colors.surface : colors.text,
                        marginLeft: 6
                      }}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          {/* Rating */}
          <Card style={styles.section}>
            <Text variant="body" weight="medium" style={styles.sectionTitle}>
              Overall Rating
            </Text>
            {errors.rating && (
              <Text variant="caption" style={{ color: colors.error, marginBottom: 8 }}>
                {errors.rating}
              </Text>
            )}
            {renderStarRating()}
            {rating > 0 && (
              <Text variant="bodySmall" style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
                {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
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
  starButton: {
    padding: 4,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginVertical: 8,
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