import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Mail, Lock } from "lucide-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import Text from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      await signIn(email, password);
      // Don't manually navigate - let the AuthProvider and index.tsx handle navigation
      // This prevents race conditions and navigation conflicts
      console.log('Sign in successful, waiting for auth state change...');
    } catch (err: any) {
      const errorCode = err.code;
      switch (errorCode) {
        case 'auth/invalid-credential':
          setError('Invalid email or password');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError(err.message || 'Sign in failed');
      }
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
          >
            <ArrowLeft color={colors.text} size={24} strokeWidth={1.5} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text variant="h2" weight="semibold" style={{ color: colors.text, marginBottom: 8 }}>
              Welcome back
            </Text>
            <Text variant="body" style={{ color: colors.textSecondary }}>
              Sign in to continue
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
              containerStyle={{ marginBottom: 8 }}
            />

            <Pressable 
              style={styles.forgotPassword}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text variant="bodySmall" style={{ color: colors.primary }}>
                Forgot password?
              </Text>
            </Pressable>
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[
                styles.signInButton,
                { backgroundColor: (!email || !password) ? colors.chipBg : colors.primary }
              ]}
              onPress={handleSignIn}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.onPrimary} size="small" />
              ) : (
                <Text variant="body" weight="semibold" style={{ color: colors.onPrimary }}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.signUpContainer}>
            <Text variant="body" style={{ color: colors.textSecondary }}>
              Don&apos;t have an account?{" "}
            </Text>
            <Pressable 
              onPress={() => router.push("/(auth)/signup")}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <Text variant="body" weight="semibold" style={{ color: colors.primary }}>
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