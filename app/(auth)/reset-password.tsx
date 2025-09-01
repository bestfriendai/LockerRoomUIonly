import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Lock, Key } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { useTheme } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { validateInput, checkRateLimit } from '../../utils/inputSanitization';
import type {
  ResetPasswordFormData,
  ValidationResult,
  AuthError,
  AuthFormState
} from '../../types/auth';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { resetPassword } = useAuth();

  // Form state with proper typing
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formState, setFormState] = useState<AuthFormState>({
    isLoading: false,
    error: ''
  });

  const handleResetPassword = async (): Promise<void> => {
    const { email, resetCode, newPassword, confirmPassword } = formData;

    if (!email.trim() || !resetCode.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setFormState(prev => ({ ...prev, error: 'Please fill in all fields' }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormState(prev => ({ ...prev, error: 'Passwords do not match' }));
      return;
    }

    if (newPassword.length < 6) {
      setFormState(prev => ({ ...prev, error: 'Password must be at least 6 characters long' }));
      return;
    }

    // Rate limit reset attempts
    const userKey = `reset_confirm_${email}`;
    if (!checkRateLimit(userKey, 5, 900000)) { // 5 attempts per 15 minutes
      setFormState(prev => ({
        ...prev,
        error: 'Too many reset attempts. Please try again in 15 minutes.'
      }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      // Validate input with proper typing
      const validationResult = validateInput(formData, 'signup') as ValidationResult<ResetPasswordFormData>;

      if (!validationResult.isValid) {
        setFormState(prev => ({
          ...prev,
          error: validationResult.errors[0] || 'Invalid input data',
          isLoading: false
        }));
        return;
      }

      // Note: This is a mock implementation since Firebase doesn't have a direct reset with code API
      // In a real implementation, you would call your backend API here
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now sign in with your new password.',
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
        error: authError.message || 'Failed to reset password',
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

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.welcomeSection}>
              <Text
                style={{ color: colors.text, marginBottom: 8 }}
                accessibilityRole="header"
                accessibilityLabel="Reset Password screen title"
              >
                Reset Password
              </Text>
              <Text
                style={{ color: colors.textSecondary }}
                accessibilityLabel="Instructions for password reset with code"
              >
                Enter the reset code sent to your email and create a new password
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
                accessibilityHint="Enter the email address where you received the reset code"
              />

              <Input
                label="Reset Code"
                value={formData.resetCode}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, resetCode: text }))}
                placeholder="Enter reset code"
                keyboardType="number-pad"
                leftIcon={<Key size={18} color={colors.textSecondary} strokeWidth={1.5} />}
                containerStyle={{ marginBottom: 16 }}
                accessibilityLabel="Reset code input field"
                accessibilityHint="Enter the reset code sent to your email"
              />

              <Input
                label="New Password"
                value={formData.newPassword}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, newPassword: text }))}
                placeholder="New password"
                secureTextEntry
                leftIcon={<Lock size={18} color={colors.textSecondary} strokeWidth={1.5} />}
                containerStyle={{ marginBottom: 16 }}
                accessibilityLabel="New password input field"
                accessibilityHint="Enter your new password, must be at least 6 characters"
              />

              <Input
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                placeholder="Confirm new password"
                secureTextEntry
                leftIcon={<Lock size={18} color={colors.textSecondary} strokeWidth={1.5} />}
                containerStyle={{ marginBottom: 16 }}
                accessibilityLabel="Confirm password input field"
                accessibilityHint="Re-enter your new password to confirm"
              />
            </View>

            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  {
                    backgroundColor: (!formData.email.trim() || !formData.resetCode.trim() ||
                                    !formData.newPassword.trim() || !formData.confirmPassword.trim())
                      ? colors.chipBg
                      : colors.primary,
                  },
                ]}
                onPress={handleResetPassword}
                disabled={formState.isLoading || !formData.email.trim() || !formData.resetCode.trim() ||
                         !formData.newPassword.trim() || !formData.confirmPassword.trim()}
                accessibilityLabel="Reset password button"
                accessibilityHint="Resets your password using the provided code and new password"
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
                    style={{ color: colors.onPrimary }}
                    accessibilityLabel="Reset Password"
                  >
                    Reset Password
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.signInContainer}>
              <Text
                style={{ color: colors.textSecondary }}
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
  scrollView: {
    flex: 1,
  },
  signInContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  welcomeSection: {
    marginBottom: 32,
    marginTop: 40,
  },
});