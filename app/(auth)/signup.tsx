import { useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Animated,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Check } from "lucide-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import Text from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import AnimatedPressable from "@/components/ui/AnimatedPressable";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleSignUp = async () => {
    setError("");
    
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    if (!agreeTerms) {
      setError("You must agree to the Terms of Service");
      return;
    }
    
    try {
      await signUp({ email, password, name: email.split('@')[0] });
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.push("/(auth)/profile-setup") }
      ]);
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    }
  };

  const isFormValid = email && password && confirmPassword && password === confirmPassword && agreeTerms;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={[styles.header, { borderBottomColor: colors.divider }]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { 
                backgroundColor: colors.surface,
                opacity: pressed ? 0.5 : 1 
              }
            ]}
          >
            <ArrowLeft color={colors.text} size={24} />
          </Pressable>
          <Text variant="h3" weight="semibold" style={{ color: colors.text }}>
            Create Account
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.welcomeSection}>
              <Text variant="h2" weight="semibold" style={{ color: colors.text, textAlign: "center" }}>
                Join MockTrae
              </Text>
              <Text variant="body" style={{ color: colors.textSecondary, textAlign: "center" }}>
                Create your account to start sharing and reading dating experiences
              </Text>
            </View>

            {error ? (
              <Animated.View style={[styles.errorContainer, { backgroundColor: colors.errorBg }]}>
                <Text variant="bodySmall" style={{ color: colors.error, textAlign: "center" }}>
                  {error}
                </Text>
              </Animated.View>
            ) : null}

            <View style={styles.formContainer}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={colors.textSecondary} strokeWidth={1.5} />}
                containerStyle={{ marginBottom: 16 }}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={!showPassword}
                leftIcon={<Lock size={18} color={colors.textSecondary} strokeWidth={1.5} />}
                rightIcon={
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={18} color={colors.textSecondary} strokeWidth={1.5} />
                    ) : (
                      <Eye size={18} color={colors.textSecondary} strokeWidth={1.5} />
                    )}
                  </Pressable>
                }
                containerStyle={{ marginBottom: 16 }}
              />

              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                secureTextEntry={!showPassword}
                leftIcon={<Lock size={18} color={colors.textSecondary} strokeWidth={1.5} />}
                containerStyle={{ marginBottom: 24 }}
              />

              <AnimatedPressable
                onPress={() => setAgreeTerms(!agreeTerms)}
                style={styles.termsContainer}
              >
                <View style={[
                  styles.checkbox,
                  {
                    backgroundColor: agreeTerms ? colors.primary : colors.surface,
                    borderColor: agreeTerms ? colors.primary : colors.border,
                  }
                ]}>
                  {agreeTerms && <Check size={16} color={colors.onPrimary} strokeWidth={2} />}
                </View>
                <Text variant="bodySmall" style={{ color: colors.textSecondary, flex: 1 }}>
                  I agree to the{" "}
                  <Text style={{ color: colors.primary }}>Terms of Service</Text>
                  {" "}and{" "}
                  <Text style={{ color: colors.primary }}>Privacy Policy</Text>
                </Text>
              </AnimatedPressable>
            </View>

            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[
                  styles.signUpButton,
                  {
                    backgroundColor: !isFormValid ? colors.chipBg : colors.primary,
                  },
                ]}
                onPress={handleSignUp}
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                ) : (
                  <Text variant="body" weight="semibold" style={{ color: colors.onPrimary }}>
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.signInContainer}>
              <Text variant="body" style={{ color: colors.textSecondary }}>
                Already have an account?{" "}
              </Text>
              <Pressable 
                onPress={() => router.push("/(auth)/signin")}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              >
                <Text variant="body" weight="semibold" style={{ color: colors.primary }}>
                  Sign in
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  buttonSection: {
    marginBottom: 32,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    marginRight: 12,
    width: 20,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
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
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  signInContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpButton: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  termsContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  welcomeSection: {
    marginBottom: 32,
  },
});