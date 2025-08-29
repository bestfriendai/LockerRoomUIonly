import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import Text from '../ui/Text';
import { Input } from '../ui/Input';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';

export default function SignInForm() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'signIn' | 'signUp'>('signIn');

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (step === 'signIn') {
        const success = await signIn(email, password);
        if (success) {
          router.replace('/(tabs)');
        } else {
          setError('Sign in failed');
        }
      } else {
        // For sign up, redirect to the full signup screen
        router.push('/(auth)/signup');
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${step === 'signIn' ? 'sign in' : 'sign up'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const success = await demoLogin();
      if (success) {
        router.replace('/(tabs)');
      } else {
        setError('Demo login failed');
      }
    } catch (err: any) {
      setError('Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.welcomeSection}>
        <Text
          variant="h1"
          weight="bold"
          style={{ color: colors.text, marginBottom: 8 }}
        >
          Welcome {step === 'signIn' ? 'back' : 'to MockTrae'}
        </Text>
        <Text variant="body" style={{ color: colors.textSecondary }}>
          {step === 'signIn'
            ? 'Sign in to continue your journey'
            : 'Create an account to get started'}
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

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          leftIcon={<Lock size={18} color={colors.textSecondary} strokeWidth={1.5} />}
          containerStyle={{ marginBottom: 16 }}
        />

        {step === 'signIn' && (
          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            style={({ pressed }) => [
              styles.forgotPassword,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <Text variant="bodySmall" style={{ color: colors.primary }}>
              Forgot password?
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: (!email || !password) ? colors.chipBg : colors.primary,
            },
          ]}
          onPress={handleSubmit}
          disabled={isLoading || !email || !password}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.onPrimary} size="small" />
          ) : (
            <Text
              variant="body"
              weight="semibold"
              style={{ color: colors.onPrimary }}
            >
              {step === 'signIn' ? 'Sign In' : 'Sign Up'}
            </Text>
          )}
        </TouchableOpacity>

        {step === 'signIn' && (
          <TouchableOpacity
            style={[
              styles.demoButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary,
              },
            ]}
            onPress={handleDemoLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text
                variant="body"
                weight="semibold"
                style={{ color: colors.primary }}
              >
                Demo Login
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.switchContainer}>
        <Text variant="body" style={{ color: colors.textSecondary }}>
          {step === 'signIn' ? "Don't have an account?" : 'Already have an account?'}{' '}
        </Text>
        <Pressable
          onPress={() => {
            if (step === 'signIn') {
              router.push('/(auth)/signup');
            } else {
              setStep('signIn');
            }
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <Text variant="body" weight="semibold" style={{ color: colors.primary }}>
            {step === 'signIn' ? 'Sign up' : 'Sign in'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonSection: {
    marginBottom: 24,
  },
  container: {
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
    paddingVertical: 4,
  },
  formContainer: {
    marginBottom: 32,
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  switchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  welcomeSection: {
    marginBottom: 32,
  },
});