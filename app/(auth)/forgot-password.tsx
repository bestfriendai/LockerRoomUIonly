import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  KeyboardAvoidingView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  TouchableOpacity,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { useTheme } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { validateInput, checkRateLimit } from '../../utils/inputSanitization';
import type {
  ForgotPasswordFormData,
  ValidationResult,
  AuthError,
  AuthFormState,
} from '../../types/auth';
import { createTypographyStyles } from '../../styles/typography';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { resetPassword } = useAuth();
  const typography = createTypographyStyles(colors);

  // Form state with proper typing
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: ''
  });

  const [formState, setFormState] = useState<AuthFormState>({
    isLoading: false,
    error: ''
  });

  const handleResetPassword = async (): Promise<void> => {
    if (!formData.email.trim()) {
      setFormState(prev => ({ ...prev, error: 'Please enter your email address' }));
      return;
    }

    // Rate limit reset attempts: 3 per 10 minutes per email
    const userKey = `reset_${formData.email || 'unknown'}`;
    if (!checkRateLimit(userKey, 3, 600000)) {
      setFormState(prev => ({
        ...prev,
        error: 'Too many reset attempts. Please try again in 10 minutes.'
      }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      // Validate input with proper typing
      const validationResult = validateInput(formData, 'signup') as ValidationResult<ForgotPasswordFormData>;

      if (!validationResult.isValid) {
        setFormState(prev => ({
          ...prev,
          error: validationResult.errors[0] || 'Please enter a valid email address',
          isLoading: false
        }));
        return;
      }

      // Use the useAuth hook's resetPassword method
      await resetPassword(validationResult.data.email);

      Alert.alert(
        'Reset Email Sent',
        'We have sent a password reset link to your email address. Please check your inbox and follow the instructions.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(auth)/signin'),
          },
        ]
      );
    } catch (err: unknown) {
      const authError = err as AuthError;
      setFormState(prev => ({
        ...prev,
        error: authError.message || 'Failed to send reset email',
        isLoading: false
      }));
    }
  };

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
              accessibilityLabel="Reset Password screen title"
            >
              Reset Password
            </Text>
            <Text
              style={typography.body}
              accessibilityLabel="Instructions for password reset"
            >
              Enter your email address and we will send you a reset link
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
              accessibilityLabel="Email address input field"
              accessibilityHint="Enter your email address to receive a password reset link"
            />
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[
                styles.resetButton,
                {
                  backgroundColor: !formData.email.trim() ? colors.chipBg : colors.primary,
                },
              ]}
              onPress={handleResetPassword}
              disabled={formState.isLoading || !formData.email.trim()}
              accessibilityLabel="Send reset link button"
              accessibilityHint="Sends a password reset link to your email address"
              accessibilityRole="button"
            >
              {formState.isLoading ? (
                <ActivityIndicator
                  color={colors.onPrimary}
                  size="small"
                  accessibilityLabel="Loading, please wait"
                />
              ) : (
                <Text
                  style={typography.button}
                  accessibilityLabel="Send Reset Link"
                >
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.signInContainer}>
            <Text
              style={typography.body}
              accessibilityLabel="Remember your password?"
            >
              Remember your password?{' '}
            </Text>
            <Pressable
              onPress={() => router.push('/(auth)/signin')}
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
  errorContainer: {
    borderRadius: 8,
    marginBottom: 20,
    padding: 12,
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
  resetButton: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  signInContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  welcomeSection: {
    marginBottom: 32,
  },
});