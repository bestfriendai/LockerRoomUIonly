import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ChatProvider } from "@/providers/ChatProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

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
              <NotificationProvider>
                <ChatProvider>
                  <StatusBar style="auto" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  gestureEnabled: true,
                }}
              >
                {/* Auth Group */}
                <Stack.Screen 
                  name="(auth)" 
                  options={{ 
                    headerShown: false
                  }} 
                />

                {/* Main App Tabs */}
                <Stack.Screen 
                  name="(tabs)" 
                  options={{ 
                    headerShown: false 
                  }} 
                />

                {/* Individual Screens */}
                <Stack.Screen 
                  name="chat/[id]" 
                  options={{ 
                    headerShown: false,
                    presentation: 'card'
                  }} 
                />
                <Stack.Screen 
                  name="profile/[id]" 
                  options={{ 
                    headerShown: false,
                    presentation: 'card'
                  }} 
                />
                <Stack.Screen 
                  name="profile/edit" 
                  options={{ 
                    headerShown: false,
                    presentation: 'card'
                  }} 
                />
                <Stack.Screen 
                  name="profile/privacy" 
                  options={{ 
                    headerShown: false,
                    presentation: 'card'
                  }} 
                />
                <Stack.Screen 
                  name="review/[id]" 
                  options={{ 
                    headerShown: false,
                    presentation: 'card'
                  }} 
                />
                <Stack.Screen 
                  name="notifications" 
                  options={{ 
                    headerShown: false,
                    presentation: 'card'
                  }} 
                />

                {/* Modal */}
                <Stack.Screen 
                  name="modal" 
                  options={{ 
                    presentation: 'modal',
                    headerShown: false,
                    animation: 'slide_from_bottom'
                  }} 
                />

                {/* Not Found */}
                <Stack.Screen 
                  name="+not-found" 
                  options={{ 
                    headerShown: false 
                  }} 
                />
                  </Stack>
                </ChatProvider>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

// Export the default layout for Expo Router
export { ErrorBoundary } from "expo-router";