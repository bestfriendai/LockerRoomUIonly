import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text
} from 'react-native';
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../providers/AuthProvider";
import { useTheme } from "../providers/ThemeProvider";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import * as Sentry from "sentry-expo";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const { colors } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Wait for component to mount before attempting navigation
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading || !isMounted) return; // Still loading or not mounted, don't redirect yet

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inProtectedRoute = inTabsGroup ||
      segments.includes('profile') ||
      segments.includes('chat') ||
      segments.includes('review') ||
      segments.includes('notifications');



    if (!user && (inProtectedRoute || segments.length === 0)) {
      // User is not signed in and either trying to access protected route or at root
      if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
        try {
          Sentry.Native.addBreadcrumb({
            category: 'nav',
            message: 'Redirect to /(auth)/signin',
            level: 'info' as const
          });
        } catch (sentryError) {
          console.warn('Sentry breadcrumb failed:', sentryError);
        }
      }


      router.replace('/(auth)/signin');
    } else if (user && (inAuthGroup || segments.length === 0)) {
      if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
        try {
          Sentry.Native.addBreadcrumb({
            category: 'nav',
            message: 'Redirect to /(tabs)',
            level: 'info' as const
          });
        } catch (sentryError) {
          console.warn('Sentry breadcrumb failed:', sentryError);
        }
      }

      // User is signed in and either on auth screen or at root

      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading, isMounted, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {/* App Logo/Brand */}
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Text style={[styles.logoText, { color: colors.background }]}
            >
              LR
            </Text>
          </View>

          {/* Loading Indicator */}
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}
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