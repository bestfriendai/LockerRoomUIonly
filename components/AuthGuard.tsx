import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import Text from "@/components/ui/Text";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const { colors } = useTheme();

  useEffect(() => {
    if (isLoading) return; // Still loading, don't redirect yet

    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';
    const inProtectedRoute = inTabsGroup || 
      segments.includes('profile') || 
      segments.includes('chat') || 
      segments.includes('review') || 
      segments.includes('notifications');

    if (!user && inProtectedRoute) {
      // User is not signed in but trying to access protected route
      router.replace('/auth/signin');
    } else if (user && inAuthGroup) {
      // User is signed in but on auth screen
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {/* App Logo/Brand */}
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Text 
              variant="h1" 
              weight="bold" 
              style={[styles.logoText, { color: colors.background }]}
            >
              MT
            </Text>
          </View>
          
          {/* Loading Indicator */}
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="large" color={colors.primary} />
            <Text 
              variant="bodySmall" 
              style={[styles.loadingText, { color: colors.textSecondary }]}
            >
              Authenticating...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    borderRadius: 40,
    elevation: 4,
    height: 80,
    justifyContent: 'center',
    marginBottom: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: 80,
  },
  logoText: {
    fontSize: 32,
  },
});