import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import Text from "@/components/ui/Text";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function IndexScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // User is authenticated, redirect to main app
        router.replace('/(tabs)');
      } else {
        // User is not authenticated, redirect to onboarding/signin
        router.replace('/(auth)');
      }
    }
  }, [user, isLoading, router]);

  // Show loading screen while checking authentication
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
        
        {/* App Name */}
        <Text 
          variant="h2" 
          weight="bold" 
          style={[styles.appName, { color: colors.text }]}
        >
          MockTrae
        </Text>
        
        {/* Tagline */}
        <Text 
          variant="body" 
          style={[styles.tagline, { color: colors.textSecondary }]}
        >
          Connect. Review. Discover.
        </Text>
        
        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" color={colors.primary} />
          <Text 
            variant="bodySmall" 
            style={[styles.loadingText, { color: colors.textSecondary }]}
          >
            Loading...
          </Text>
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text 
          variant="caption" 
          style={[styles.footerText, { color: colors.textSecondary }]}
        >
          © 2024 MockTrae. Demo Version.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appName: {
    marginBottom: 8,
    textAlign: 'center',
  },
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
  footer: {
    paddingBottom: 32,
    paddingHorizontal: 32,
  },
  footerText: {
    textAlign: 'center',
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
    marginBottom: 24,
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
  tagline: {
    marginBottom: 48,
    textAlign: 'center',
  },
});