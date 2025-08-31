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
  Text
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Check } from "lucide-react-native";
import * as Sentry from "sentry-expo";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Input } from "@/components/ui/Input";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import { validateInput, checkRateLimit } from "@/utils/inputSanitization";
import type {
  SignUpFormData,
  ValidationResult,
  AuthError,
  AuthFormState,
  FirebaseAuthErrorCode
} from '@/types/auth';
import { generateMultipleUsernames } from "@/services/usernameGenerator";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const { colors } = useTheme();

  // Form state with proper typing
  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });

  const [formState, setFormState] = useState<AuthFormState>({
    isLoading: false,
    error: ""
  });

  const [showPassword, setShowPassword] = useState(false);


  // Remove username states - will be generated automatically
  
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

    // No username generation needed - will be done automatically
  }, [fadeAnim, slideAnim]);

  const handleSignUp = async (): Promise<void> => {
    setFormState(prev => ({ ...prev, error: "" }));

    // Rate limiting check
    const userKey = `signup_${formData.email || 'unknown'}`;
    if (!checkRateLimit(userKey, 3, 300000)) { // 3 attempts per 5 minutes
      setFormState(prev => ({
        ...prev,
        error: "Too many signup attempts. Please wait 5 minutes before trying again."
      }));
      return;
    }

    if (!formData.email.trim() || !formData.password.trim() || !formData.confirmPassword?.trim()) {
      setFormState(prev => ({ ...prev, error: "Please fill in all fields" }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormState(prev => ({ ...prev, error: "Passwords do not match" }));
      return;
    }

    if (formData.password.length < 6) {
      setFormState(prev => ({ ...prev, error: "Password must be at least 6 characters long" }));
      return;
    }

    if (!formData.agreeTerms) {
      setFormState(prev => ({ ...prev, error: "You must agree to the Terms of Service" }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true }));

    try {
      // Validate and sanitize input
      const validationResult = validateInput({
        email: formData.email,
        password: formData.password
      }, 'signup') as ValidationResult<SignUpFormData>;

      if (!validationResult.isValid) {
        setFormState(prev => ({
          ...prev,
          error: validationResult.errors[0] || "Invalid input",
          isLoading: false
        }));
        return;
      }

      const sanitizedData = validationResult.data;

      // Generate anonymous username automatically
      const anonymousUsername = generateMultipleUsernames(1)[0];

      // Sentry breadcrumb for signup start
      try {
        const level = 'info' as const;
        Sentry.Native.addBreadcrumb({
          category: 'auth',
          message: 'Signup started',
          level
        });
      } catch (sentryError) {
        console.warn('Sentry breadcrumb failed:', sentryError);
      }

      await signUp({
        email: sanitizedData.email,
        password: sanitizedData.password,
        name: anonymousUsername,
        isAnonymous: true
      });

      try {
        const level = 'info' as const;
        Sentry.Native.addBreadcrumb({
          category: 'auth',
          message: 'Signup completed',
          level
        });
      } catch (sentryError) {
        console.warn('Sentry breadcrumb failed:', sentryError);
      }
      if (__DEV__) {
        console.log('Sign up successful, waiting for auth state change...');
      }

      // Show brief success message
      // The auth state change will handle navigation automatically
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => {
          // The auth state listener in AuthProvider will handle navigation
          if (__DEV__) {
            console.log('User acknowledged success, navigation will happen automatically');
          }
        }}
      ]);
    } catch (err: unknown) {
      const authError = err as AuthError & { code?: FirebaseAuthErrorCode };
      const errorCode = authError.code;

      let errorMessage: string;
      switch (errorCode) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email address is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
          break;
        default:
          errorMessage = authError.message || "Sign up failed";
      }

      setFormState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
    }
  };

  const isFormValid = formData.email.trim() && formData.password.trim() &&
                      formData.confirmPassword?.trim() &&
                      formData.password === formData.confirmPassword &&
                      formData.agreeTerms;

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
          <Text style={{ color: colors.text }}>
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
              <Text style={{ color: colors.text, textAlign: "center" }}>
                Join LockerRoom Talk App
              </Text>
              <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
                Create your account to start sharing and reading dating experiences anonymously
              </Text>
            </View>

            {formState.error ? (
              <Animated.View style={[styles.errorContainer, { backgroundColor: colors.errorBg }]}>
                <Text
                  style={{ color: colors.error, textAlign: "center" }}
                  accessibilityLabel={`Error: ${formState.error}`}
                  accessibilityRole="text"
                >
                  {formState.error}
                </Text>
              </Animated.View>
            ) : null}

            <View style={styles.formContainer}>
              <Input
                label="Email"
                value={formData.email}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={colors.textSecondary} strokeWidth={1.5} />}
                containerStyle={{ marginBottom: 16 }}
                accessibilityLabel="Email address input field"
                accessibilityHint="Enter your email address to create an account"
              />

              <Input
                label="Password"
                value={formData.password}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, password: text }))}
                placeholder="Password"
                secureTextEntry={!showPassword}
                leftIcon={<Lock size={18} color={colors.textSecondary} strokeWidth={1.5} />}
                rightIcon={
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    accessibilityRole="button"
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={colors.textSecondary} strokeWidth={1.5} />
                    ) : (
                      <Eye size={18} color={colors.textSecondary} strokeWidth={1.5} />
                    )}
                  </Pressable>
                }
                containerStyle={{ marginBottom: 16 }}
                accessibilityLabel="Password input field"
                accessibilityHint="Enter a password, minimum 6 characters"
              />

              <Input
                label="Confirm Password"
                value={formData.confirmPassword || ""}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                placeholder="Confirm password"
                secureTextEntry={!showPassword}
                leftIcon={<Lock size={18} color={colors.textSecondary} strokeWidth={1.5} />}
                containerStyle={{ marginBottom: 16 }}
                accessibilityLabel="Confirm password input field"
                accessibilityHint="Re-enter your password to confirm"
              />

              {/* Anonymous signup info */}
              <View style={[styles.infoSection, { backgroundColor: colors.chipBg }]}>
                <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                  🎭 Your anonymous identity will be created automatically
                </Text>
              </View>

              <AnimatedPressable
                onPress={() => setFormData(prev => ({ ...prev, agreeTerms: !prev.agreeTerms }))}
                style={styles.termsContainer}
                accessibilityLabel="Terms and conditions agreement"
                accessibilityHint="Tap to agree or disagree to terms of service and privacy policy"
                accessibilityRole="checkbox"
                accessibilityState={{ checked: formData.agreeTerms }}
              >
                <View style={[
                  styles.checkbox,
                  {
                    backgroundColor: formData.agreeTerms ? colors.primary : colors.surface,
                    borderColor: formData.agreeTerms ? colors.primary : colors.border,
                  }
                ]}>
                  {formData.agreeTerms && <Check size={16} color={colors.onPrimary} strokeWidth={2} />}
                </View>
                <Text style={{ color: colors.textSecondary, flex: 1 }}>
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
                disabled={formState.isLoading || isLoading || !isFormValid}
                accessibilityLabel="Create account button"
                accessibilityHint="Creates your anonymous account"
                accessibilityRole="button"
              >
                {(formState.isLoading || isLoading) ? (
                  <ActivityIndicator
                    color={colors.onPrimary}
                    size="small"
                    accessibilityLabel="Loading, please wait"
                  />
                ) : (
                  <Text
                    style={{ color: colors.onPrimary }}
                    accessibilityLabel="Create Account"
                  >
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.signInContainer}>
              <Text
                style={{ color: colors.textSecondary }}
                accessibilityLabel="Already have an account?"
              >
                Already have an account?{" "}
              </Text>
              <Pressable
                onPress={() => router.push("/(auth)/signin")}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                accessibilityLabel="Sign in"
                accessibilityHint="Navigate to sign in screen"
                accessibilityRole="button"
              >
                <Text style={{ color: colors.primary }}>
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
  infoSection: {
    marginVertical: 16,
    padding: 12,
    borderRadius: 8,
  },
});