import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Calendar, Users } from 'lucide-react-native';
import Text from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';

type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
type DatingPreference = 'men' | 'women' | 'everyone';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('prefer-not-to-say');
  const [datingPreference, setDatingPreference] = useState<DatingPreference>('everyone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const genderOptions: { value: Gender; label: string }[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  const datingPreferenceOptions: { value: DatingPreference; label: string }[] = [
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'everyone', label: 'Everyone' },
  ];

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      setError('Please enter a display name');
      return;
    }

    if (!age || parseInt(age) < 18 || parseInt(age) > 100) {
      setError('Please enter a valid age (18-100)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user profile
      await updateProfile({
        displayName: displayName.trim(),
        age: parseInt(age),
        gender,
        datingPreferences: { gender: datingPreference, ageRange: { min: 18, max: 50 } },
        profileComplete: true,
      });

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Profile Setup?',
      'You can complete your profile later in settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  const renderOptionButton = (
    value: string,
    label: string,
    selectedValue: string,
    onSelect: (value: any) => void
  ) => (
    <TouchableOpacity
      key={value}
      style={[
        styles.optionButton,
        {
          backgroundColor: selectedValue === value ? colors.primary : colors.chipBg,
          borderColor: selectedValue === value ? colors.primary : colors.border,
        },
      ]}
      onPress={() => onSelect(value)}
    >
      <Text
        variant="body"
        weight={selectedValue === value ? 'semibold' : 'normal'}
        style={{
          color: selectedValue === value ? colors.onPrimary : colors.text,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
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

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.welcomeSection}>
              <Text
                variant="h2"
                weight="semibold"
                style={{ color: colors.text, marginBottom: 8 }}
              >
                Complete Your Profile
              </Text>
              <Text variant="body" style={{ color: colors.textSecondary }}>
                Help others get to know you better
              </Text>
            </View>

            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: colors.errorBg }]}>
                <Text variant="bodySmall" style={{ color: colors.error }}>
                  {error}
                </Text>
              </View>
            ) : null}

            <View style={styles.formContainer}>
              <Input
                label="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="How should others see you?"
                leftIcon={<User size={18} color={colors.textSecondary} strokeWidth={1.5} />}
                containerStyle={{ marginBottom: 24 }}
              />

              <Input
                label="Age"
                value={age}
                onChangeText={setAge}
                placeholder="Your age"
                keyboardType="number-pad"
                leftIcon={<Calendar size={18} color={colors.textSecondary} strokeWidth={1.5} />}
                containerStyle={{ marginBottom: 24 }}
              />

              <View style={styles.sectionContainer}>
                <Text
                  variant="body"
                  weight="medium"
                  style={{ color: colors.text, marginBottom: 12 }}
                >
                  Gender
                </Text>
                <View style={styles.optionsContainer}>
                  {genderOptions.map(option =>
                    renderOptionButton(option.value, option.label, gender, setGender)
                  )}
                </View>
              </View>

              <View style={styles.sectionContainer}>
                <Text
                  variant="body"
                  weight="medium"
                  style={{ color: colors.text, marginBottom: 12 }}
                >
                  Interested in
                </Text>
                <View style={styles.optionsContainer}>
                  {datingPreferenceOptions.map(option =>
                    renderOptionButton(
                      option.value,
                      option.label,
                      datingPreference,
                      setDatingPreference
                    )
                  )}
                </View>
              </View>
            </View>

            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: !displayName.trim() || !age
                      ? colors.chipBg
                      : colors.primary,
                  },
                ]}
                onPress={handleSaveProfile}
                disabled={isLoading || !displayName.trim() || !age}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                ) : (
                  <Text
                    variant="body"
                    weight="semibold"
                    style={{ color: colors.onPrimary }}
                  >
                    Complete Profile
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: 32,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  errorContainer: {
    borderRadius: 8,
    marginBottom: 20,
    padding: 12,
  },
  formContainer: {
    marginBottom: 32,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  keyboardView: {
    flex: 1,
  },
  optionButton: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  skipButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  welcomeSection: {
    marginBottom: 32,
    marginTop: 20,
  },
});