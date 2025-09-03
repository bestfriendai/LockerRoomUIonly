import React from "react";
import { Tabs } from "expo-router";
import {
  View,
  Text,
  Platform,
  Pressable,
  StyleSheet,
  
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { LinearGradient } from "expo-linear-gradient";
import { Home, Search, PlusCircle, MessageCircle, Users } from "lucide-react-native";
import { useTheme } from "../../providers/ThemeProvider";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { Route } from "@react-navigation/native";
import { createTypographyStyles } from "../../styles/typography";
// import { MODERN_SHADOWS } from "../../constants/shadows";
import ErrorBoundary from "../../components/ErrorBoundary";

type MyTabBarProps = BottomTabBarProps;

function MyTabBar({ state, descriptors, navigation }: MyTabBarProps) {
  const { colors, tokens, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const typography = createTypographyStyles(colors);

  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === "ios" ? 20 : 10),
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          // ...MODERN_SHADOWS.header,
        },
      ]}
    >
      {state.routes.map((route: Route<string>, index: number) => {
        const { options } = descriptors[route.key];
        
        // Handle label which can be a string or function
        const getLabelText = (): string => {
          if (typeof options.tabBarLabel === 'function') {
            const result = options.tabBarLabel({
              focused: state.index === index,
              color: state.index === index ? (isDark ? "#FFFFFF" : colors.primary) : (isDark ? tokens.whiteAlpha[56] : colors.textSecondary),
              position: 'below-icon' as const,
              children: route.name
            });
            return typeof result === 'string' ? result : route.name;
          }
          return options.tabBarLabel ?? options.title ?? route.name;
        };
        
        const label = getLabelText();
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        // Noir tab colors
        const activeColor = isDark ? "#FFFFFF" : colors.primary;
        const inactiveColor = isDark ? tokens.whiteAlpha[56] : colors.textSecondary;
        const color = isFocused ? activeColor : inactiveColor;
        const iconSize = 20; // Smaller, more refined icons
        
        const icon =
          typeof options.tabBarIcon === "function"
            ? options.tabBarIcon({ color, focused: isFocused, size: iconSize })
            : null;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityHint={`Navigate to ${label} tab`}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            <View style={styles.iconContainer}>
              {icon}
              {isFocused && (
                <View 
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: activeColor }
                  ]} 
                />
              )}
            </View>
            <Text
              style={[
                typography.caption,
                { 
                  color: isFocused ? activeColor : inactiveColor,
                  fontWeight: isFocused ? "500" : "400",
                },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const typography = createTypographyStyles(colors);
  
  return (
    <ErrorBoundary level="page" retryable={true} showGoHome={true}>
      <Tabs
      tabBar={(props) => <MyTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: typography.h2,
        headerTitleAlign: "left",
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarLabel: "Discover",
          headerShown: false, // Keep custom header for home screen
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarLabel: "Search",
          headerShown: false, // Keep custom header for search screen
          tabBarIcon: ({ color, size }) => (
            <Search color={color} size={size} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create Review",
          tabBarLabel: "Create",
          headerShown: false, // Keep custom header for create screen
          tabBarIcon: ({ color, size }) => (
            <PlusCircle color={color} size={size} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Conversations", 
          tabBarLabel: "Chat",
          headerShown: false, // Keep custom header for chat screen
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          headerShown: false, // Keep custom header for profile screen
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size} strokeWidth={1.5} />
          ),
        }}
      />
    </Tabs>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  activeIndicator: {
    borderRadius: 2,
    bottom: -6,     // Moved closer to icon
    height: 3,      // Slightly thinner
    position: "absolute",
    width: 3,       // Smaller dot
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3, // Reduced spacing between icon and label
    position: "relative",
  },
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingHorizontal: 12, // Reduced horizontal padding
    paddingTop: 6,         // Reduced top padding
    paddingBottom: 4,      // Added bottom padding for balance
    minHeight: 60,         // Ensure consistent height
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: 6,    // Reduced vertical padding
  },
  tabLabel: {
    fontSize: 10,          // Slightly smaller text
    textAlign: "center",
    fontWeight: '500',     // Medium weight for better readability
  },
});