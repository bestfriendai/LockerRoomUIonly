import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Sentry from "sentry-expo";


import { ThemeProvider } from "../providers/ThemeProvider";
import { AuthProvider } from "../providers/AuthProvider";
import { ChatProvider } from "../providers/ChatProvider";
import { NotificationProvider } from "../providers/NotificationProvider";
import ErrorBoundary from "../components/ErrorBoundary";
import AuthGuard from "../components/AuthGuard";

// Initialize Sentry for error and performance monitoring only if DSN is provided
if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    enableInExpoDevelopment: true,
    debug: __DEV__,
    tracesSampleRate: 1.0,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 10000,
    enableWatchdogTerminationTracking: false,
    beforeSend: (event) => {
      // Add custom debugging information
      if (event.exception) {
        console.log('Sentry capturing exception:', event.exception);
      }
      if (event.message) {
        console.log('Sentry capturing message:', event.message);
      }
      return event;
    },
  });

  // Optional Sentry test trigger controlled by env variable
  if (process.env.EXPO_PUBLIC_SENTRY_TEST === '1') {
    try {
      Sentry.Native.captureException(new Error('Sentry test error: startup'));
    } catch (sentryError) {
      console.warn('Sentry test error capture failed:', sentryError);
    }
  }
} else if (__DEV__) {
  console.log('Sentry DSN not provided - Sentry monitoring disabled');
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    // Add custom fonts here if needed
    // 'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    // 'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    // 'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    // 'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <AuthGuard>
                <NotificationProvider>
                  <ChatProvider>
                    <StatusBar style="auto" />
                    <Slot />
                  </ChatProvider>
                </NotificationProvider>
              </AuthGuard>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

// Export the default layout for Expo Router
export { ErrorBoundary } from "expo-router";