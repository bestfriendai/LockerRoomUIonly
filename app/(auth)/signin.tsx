import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Lock } from 'lucide-react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { Input } from '../../components/ui/Input';
import { validateInput, checkRateLimit } from '../../utils/inputSanitization';
import type {
  SignInFormData,
  ValidationResult,
  AuthError,
  AuthFormState,
  FirebaseAuthErrorCode,
} from '../../types/auth';
import { createTypographyStyles } from '../../styles/typography';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const { colors } = useTheme();
  const typography = createTypographyStyles(colors);

  // Form state with proper typing
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: ""
  });

  const [formState, setFormState] = useState<AuthFormState>({
    isLoading: false,
    error: ""
  });

  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: ""
  });

  // Real-time email validation
  useEffect(() => {
    if (formData.email && !formData.email.includes('@')) {
      setFieldErrors(prev => ({ ...prev, email: "Please enter a valid email" }));
    } else {
      setFieldErrors(prev => ({ ...prev, email: "" }));
    }
  }, [formData.email]);

  // Real-time password validation
  useEffect(() => {
    if (formData.password && formData.password.length < 6) {
      setFieldErrors(prev => ({ ...prev, password: "Password must be at least 6 characters" }));
    } else {
      setFieldErrors(prev => ({ ...prev, password: "" }));
    }
  }, [formData.password]);

  const handleSignIn = async (): Promise<void> => {
    setFormState(prev => ({ ...prev, error: "" }));

    // Rate limiting check
    const userKey = `signin_${formData.email || 'unknown'}`;
    if (!checkRateLimit(userKey, 5, 300000)) { // 5 attempts per 5 minutes
      setFormState(prev => ({
        ...prev,
        error: "Too many sign in attempts. Please wait 5 minutes before trying again."
      }));
      return;
    }

    if (!formData.email.trim() || !formData.password.trim()) {
      setFormState(prev => ({ ...prev, error: "Please enter both email and password" }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true }));

    try {
      // Validate and sanitize input
      const validationResult = validateInput(formData, 'signup') as ValidationResult<SignInFormData>;

      if (!validationResult.isValid) {
        setFormState(prev => ({
          ...prev,
          error: validationResult.errors[0] || "Invalid input",
          isLoading: false
        }));
        return;
      }

      const sanitizedData = validationResult.data;

      await signIn(sanitizedData.email, sanitizedData.password);
      // Don't manually navigate - let the AuthProvider and index.tsx handle navigation
      // This prevents race conditions and navigation conflicts
      if (__DEV__) {
        console.log('Sign in successful, waiting for auth state change...');
      }
      // Navigation will happen automatically via auth state change
    } catch (err: unknown) {
      const authError = err as AuthError & { code?: FirebaseAuthErrorCode };
      const errorCode = authError.code;

      let errorMessage: string;
      switch (errorCode) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = authError.message || 'Sign in failed';
      }

      setFormState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.5 : 1 }
            ]}
            accessibilityLabel="Go back to previous screen"
            accessibilityHint="Returns to the previous authentication screen"
            accessibilityRole="button"
          >
            <ArrowLeft color={colors.text} size={24} strokeWidth={1.5} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text
              style={typography.h2}
              accessibilityRole="header"
              accessibilityLabel="Welcome back to LockerRoom Talk App"
            >
              Welcome back
            </Text>
            <Text
              style={typography.body}
              accessibilityLabel="Sign in instructions"
            >
              Sign in to continue your anonymous dating reviews
            </Text>
          </View>

          {formState.error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.errorBg }]}>
              <Text
                style={{ color: colors.error }}
                accessibilityLabel={`Error: ${formState.error}`}
                accessibilityRole="text"
              >
                {formState.error}
              </Text>
            </View>
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
              error={fieldErrors.email}
              accessibilityLabel="Email address input field"
              accessibilityHint="Enter your email address to sign in"
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, password: text }))}
              placeholder="Password"
              secureTextEntry
              leftIcon={<Lock size={18} color={colors.textSecondary} strokeWidth={1.5} />}
              containerStyle={{ marginBottom: 8 }}
              error={fieldErrors.password}
              accessibilityLabel="Password input field"
              accessibilityHint="Enter your password to sign in"
            />

            <Pressable
              style={styles.forgotPassword}
              onPress={() => router.push('/(auth)/forgot-password')}
              accessibilityLabel="Forgot password"
              accessibilityHint="Navigate to password reset screen"
              accessibilityRole="button"
            >
              <Text style={{ color: colors.primary }}>
                Forgot password?
              </Text>
            </Pressable>
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[
                styles.signInButton,
                { backgroundColor: (!formData.email.trim() || !formData.password.trim()) ? colors.chipBg : colors.primary }
              ]}
              onPress={handleSignIn}
              disabled={formState.isLoading || isLoading || !formData.email.trim() || !formData.password.trim()}
              accessibilityLabel="Sign in button"
              accessibilityHint="Signs you into your account"
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
                  style={typography.button}
                  accessibilityLabel="Sign In"
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.signUpContainer}>
            <Text
              style={typography.body}
              accessibilityLabel="Don't have an account?"
            >
              Don&apos;t have an account?{' '}
            </Text>
            <Pressable
              onPress={() => router.push("/(auth)/signup")}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              accessibilityLabel="Sign up"
              accessibilityHint="Navigate to sign up screen"
              accessibilityRole="button"
            >
              <Text style={{ color: colors.primary }}>
                Sign up
              </Text>
            </Pressable>
          </View>
        </View>
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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  demoButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 16,
  },
  errorContainer: {
    borderRadius: 8,
    marginBottom: 20,
    padding: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
  },
  formContainer: {
    marginBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  keyboardView: {
    flex: 1,
  },
  signInButton: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  signUpContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  welcomeSection: {
    marginBottom: 32,
  },
});