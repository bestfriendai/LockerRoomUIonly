import React, { useState, useCallback, useRef } from "react";
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, MapPin, Calendar, User, Mail, Phone, Edit3 } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import Text from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import { Picker } from "@react-native-picker/picker";

type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
type LookingFor = 'male' | 'female' | 'both' | 'non-binary';

interface FormData {
  displayName: string;
  bio: string;
  age: string;
  gender: Gender;
  location: string;
  phone: string;
  profilePicture: string;
  datingPreferences: {
    ageRange: {
      min: number;
      max: number;
    };
    gender: LookingFor;
  };
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors, tokens, isDark } = useTheme();
  const { user, updateUser } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize form data with current user data
  const [formData, setFormData] = useState<FormData>({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    age: user?.age?.toString() || '',
    gender: (user?.gender as Gender) || 'prefer-not-to-say',
    location: user?.location || '',
    phone: user?.phone || '',
    profilePicture: user?.profilePicture || '',
    datingPreferences: {
      ageRange: {
        min: user?.datingPreferences?.ageRange?.min || 18,
        max: user?.datingPreferences?.ageRange?.max || 35,
      },
      gender: (user?.datingPreferences?.gender as LookingFor) || 'both',
    },
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Handlers
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handlePreferenceChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      datingPreferences: {
        ...prev.datingPreferences,
        [field]: value,
      },
    }));
  }, []);

  const handleAgeRangeChange = useCallback((type: 'min' | 'max', value: number) => {
    setFormData(prev => ({
      ...prev,
      datingPreferences: {
        ...prev.datingPreferences,
        ageRange: {
          ...prev.datingPreferences.ageRange,
          [type]: value,
        },
      },
    }));
  }, []);

  const handleImagePicker = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ ...prev, profilePicture: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 18 || Number(formData.age) > 100)) {
      newErrors.age = 'Please enter a valid age between 18 and 100';
    }

    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    if (formData.datingPreferences.ageRange.min >= formData.datingPreferences.ageRange.max) {
      Alert.alert('Invalid Age Range', 'Minimum age must be less than maximum age.');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user data
      const updatedUser = {
        ...user,
        displayName: formData.displayName,
        bio: formData.bio,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender,
        location: formData.location,
        phone: formData.phone,
        profilePicture: formData.profilePicture,
        datingPreferences: formData.datingPreferences,
      };

      updateUser(updatedUser);
      
      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, user, updateUser, router]);

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Non-binary', value: 'non-binary' },
    { label: 'Prefer not to say', value: 'prefer-not-to-say' },
  ];

  const lookingForOptions = [
    { label: 'Men', value: 'male' },
    { label: 'Women', value: 'female' },
    { label: 'Both', value: 'both' },
    { label: 'Non-binary', value: 'non-binary' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Button
            variant="ghost"
            size="sm"
            onPress={handleBack}
            leftIcon={<ArrowLeft size={20} color={colors.text} strokeWidth={1.5} />}
          />
          <Text variant="h3" weight="bold">
            Edit Profile
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onPress={handleSave}
            disabled={loading}
          >
            <Text variant="body" weight="medium" style={{ color: colors.primary }}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </Button>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Picture */}
          <Card style={styles.section}>
            <Text variant="body" weight="medium" style={styles.sectionTitle}>
              Profile Picture
            </Text>
            <View style={styles.avatarContainer}>
              <Avatar
                size="xl"
                name={formData.displayName || user?.username || 'User'}
                src={formData.profilePicture}
                style={styles.avatar}
              />
              <Button
                variant="outline"
                size="sm"
                onPress={handleImagePicker}
                leftIcon={<Camera size={16} color={colors.text} strokeWidth={1.5} />}
                style={styles.changePhotoButton}
              >
                Change Photo
              </Button>
            </View>
          </Card>

          {/* Basic Information */}
          <Card style={styles.section}>
            <Text variant="body" weight="medium" style={styles.sectionTitle}>
              Basic Information
            </Text>
            
            <Input
              label="Display Name"
              value={formData.displayName}
              onChangeText={(value: string) => handleInputChange('displayName', value)}
              placeholder="Enter your display name"
              error={errors.displayName}
              leftIcon={<User size={16} color={colors.textSecondary} strokeWidth={1.5} />}
              style={styles.input}
            />

            <Input
              label="Bio"
              value={formData.bio}
              onChangeText={(value: string) => handleInputChange('bio', value)}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={4}
              maxLength={500}
              error={errors.bio}
              leftIcon={<Edit3 size={16} color={colors.textSecondary} strokeWidth={1.5} />}
              style={styles.input}
            />
            <Text variant="caption" style={{ color: colors.textSecondary, textAlign: 'right' }}>
              {formData.bio.length}/500
            </Text>

            <Input
              label="Age"
              value={formData.age}
              onChangeText={(value: string) => handleInputChange('age', value)}
              placeholder="Enter your age"
              keyboardType="numeric"
              error={errors.age}
              leftIcon={<Calendar size={16} color={colors.textSecondary} strokeWidth={1.5} />}
              style={styles.input}
            />

            <View style={styles.pickerContainer}>
              <Text variant="bodySmall" weight="medium" style={styles.pickerLabel}>
                Gender
              </Text>
              <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  style={[styles.picker, { color: colors.text }]}
                >
                  {genderOptions.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </Card>

          {/* Contact Information */}
          <Card style={styles.section}>
            <Text variant="body" weight="medium" style={styles.sectionTitle}>
              Contact Information
            </Text>
            
            <Input
              label="Email"
              value={user?.email || ''}
              placeholder="Email address"
              editable={false}
              leftIcon={<Mail size={16} color={colors.textSecondary} strokeWidth={1.5} />}
              style={[styles.input, { opacity: 0.6 }]}
            />
            <Text variant="caption" style={{ color: colors.textSecondary, marginTop: -8, marginBottom: 16 }}>
              Email cannot be changed
            </Text>

            <Input
              label="Phone (Optional)"
              value={formData.phone}
              onChangeText={(value: string) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              leftIcon={<Phone size={16} color={colors.textSecondary} strokeWidth={1.5} />}
              style={styles.input}
            />

            <Input
              label="Location (Optional)"
              value={formData.location}
              onChangeText={(value: string) => handleInputChange('location', value)}
              placeholder="Enter your location"
              leftIcon={<MapPin size={16} color={colors.textSecondary} strokeWidth={1.5} />}
              style={styles.input}
            />
          </Card>

          {/* Dating Preferences */}
          <Card style={styles.section}>
            <Text variant="body" weight="medium" style={styles.sectionTitle}>
              Dating Preferences
            </Text>
            
            <View style={styles.pickerContainer}>
              <Text variant="bodySmall" weight="medium" style={styles.pickerLabel}>
                Looking for
              </Text>
              <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Picker
                  selectedValue={formData.datingPreferences.gender}
                  onValueChange={(value) => handlePreferenceChange('gender', value)}
                  style={[styles.picker, { color: colors.text }]}
                >
                  {lookingForOptions.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <Text variant="bodySmall" weight="medium" style={styles.ageRangeLabel}>
              Age Range: {formData.datingPreferences.ageRange.min} - {formData.datingPreferences.ageRange.max}
            </Text>
            
            <View style={styles.ageRangeContainer}>
              <View style={styles.ageRangeItem}>
                <Text variant="caption" style={{ color: colors.textSecondary, marginBottom: 8 }}>
                  Minimum Age
                </Text>
                <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: colors.card }]}>
                  <Picker
                    selectedValue={formData.datingPreferences.ageRange.min}
                    onValueChange={(value) => handleAgeRangeChange('min', value)}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    {Array.from({ length: 63 }, (_, i) => i + 18).map((age) => (
                      <Picker.Item key={age} label={age.toString()} value={age} />
                    ))}
                  </Picker>
                </View>
              </View>
              
              <View style={styles.ageRangeItem}>
                <Text variant="caption" style={{ color: colors.textSecondary, marginBottom: 8 }}>
                  Maximum Age
                </Text>
                <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: colors.card }]}>
                  <Picker
                    selectedValue={formData.datingPreferences.ageRange.max}
                    onValueChange={(value) => handleAgeRangeChange('max', value)}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    {Array.from({ length: 63 }, (_, i) => i + 18).map((age) => (
                      <Picker.Item key={age} label={age.toString()} value={age} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </Card>

          {/* Save Button */}
          <Button
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
          >
            Save Changes
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ageRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  ageRangeItem: {
    flex: 1,
  },
  ageRangeLabel: {
    marginBottom: 12,
  },
  avatar: {
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  changePhotoButton: {
    paddingHorizontal: 24,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  input: {
    marginBottom: 16,
  },
  keyboardAvoid: {
    flex: 1,
  },
  picker: {
    height: 50,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    marginBottom: 8,
  },
  pickerWrapper: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  saveButton: {
    marginTop: 16,
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
    marginBottom: 16,
  },
});