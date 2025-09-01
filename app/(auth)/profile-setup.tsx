import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';

import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, User, Cake, Book } from "lucide-react-native";
import { useTheme } from "../../providers/ThemeProvider";
import { useAuth } from "../../providers/AuthProvider";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuth();
  const { colors } = useTheme();

  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age?.toString() || "");
  const [bio, setBio] = useState(user?.bio || "");
  // Removed photos for anonymous app
  const [error, setError] = useState("");

  // Removed image picking functionality for anonymous app

  const handleSave = async () => {
    if (!name || !age || !bio) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await updateProfile({
        name,
        age: parseInt(age),
        bio,
        // Removed photos for anonymous app
        profileComplete: true,
        isAnonymous: true,
      });
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (err: unknown) {
      const error = err as Error;
      setError((error as any)?.message || "Failed to update profile.");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={[styles.header, { borderBottomColor: colors.divider }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={{ color: colors.text }}>
            Setup Your Profile
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {error ? (
              <View
                style={[styles.errorContainer, { backgroundColor: colors.errorBg }]}
              >
                <Text style={{ color: colors.error }}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              leftIcon={<User size={18} color={colors.textSecondary} />}
              containerStyle={{ marginBottom: 16 }}
            />

            <Input
              label="Age"
              value={age}
              onChangeText={setAge}
              placeholder="Your age"
              keyboardType="number-pad"
              leftIcon={<Cake size={18} color={colors.textSecondary} />}
              containerStyle={{ marginBottom: 16 }}
            />

            <Input
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
              leftIcon={<Book size={18} color={colors.textSecondary} />}
              containerStyle={{ marginBottom: 24 }}
            />

            {/* Anonymous Profile Notice */}
            <View style={styles.anonymousNotice}>
              <Text
                style={{ color: colors.text, marginBottom: 12 }}
              >
                Anonymous Profile
              </Text>
              <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                🎭 Your identity remains completely anonymous. No profile photos are needed -
                your reviews and interactions speak for themselves!
              </Text>
            </View>

            <Button
              onPress={handleSave}
              loading={isLoading}
              style={{ marginTop: 32 }}
            >
              <Text style={{ color: colors.onPrimary }}>
                Save and Continue
              </Text>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  anonymousNotice: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
  },
});