import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, User, Cake, Book, Camera } from "lucide-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import Text from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as ImagePicker from "expo-image-picker";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuth();
  const { colors } = useTheme();

  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age?.toString() || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [photos, setPhotos] = useState<string[]>(user?.photos || []);
  const [error, setError] = useState("");

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

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
        photos,
        profileComplete: true,
      });
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
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
          <Text variant="h3" weight="semibold" style={{ color: colors.text }}>
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

            <View style={styles.photosContainer}>
              <Text
                variant="h4"
                weight="semibold"
                style={{ color: colors.text, marginBottom: 12 }}
              >
                Your Photos
              </Text>
              <View style={styles.photoGrid}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoWrapper}>
                    <Text>Photo {index + 1}</Text>
                  </View>
                ))}
                {photos.length < 5 && (
                  <TouchableOpacity
                    style={[
                      styles.addPhoto,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={handleImagePick}
                  >
                    <Camera size={24} color={colors.textSecondary} />
                    <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 8 }}>
                      Add Photo
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Button
              onPress={handleSave}
              loading={isLoading}
              style={{ marginTop: 32 }}
            >
              <Text weight="semibold" style={{ color: colors.onPrimary }}>
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
  photosContainer: {
    marginBottom: 24,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  photoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  addPhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
});