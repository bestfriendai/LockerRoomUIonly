import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import Text from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useTheme } from '@/providers/ThemeProvider';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
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
          >
            <ArrowLeft color={colors.text} size={24} strokeWidth={1.5} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text
              variant="h2"
              weight="semibold"
              style={{ color: colors.text, marginBottom: 8 }}
            >
              Reset Password
            </Text>
            <Text variant="body" style={{ color: colors.textSecondary }}>
              Enter your email address and we will send you a reset link
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
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={colors.textSecondary} strokeWidth={1.5} />}
              containerStyle={{ marginBottom: 16 }}
            />
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[
                styles.resetButton,
                {
                  backgroundColor: !email ? colors.chipBg : colors.primary,
                },
              ]}
              onPress={handleResetPassword}
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.onPrimary} size="small" />
              ) : (
                <Text
                  variant="body"
                  weight="semibold"
                  style={{ color: colors.onPrimary }}
                >
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.signInContainer}>
            <Text variant="body" style={{ color: colors.textSecondary }}>
              Remember your password?{' '}
            </Text>
            <Pressable
              onPress={() => router.push('/(auth)/signin')}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <Text variant="body" weight="semibold" style={{ color: colors.primary }}>
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