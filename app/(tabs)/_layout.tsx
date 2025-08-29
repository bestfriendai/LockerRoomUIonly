import React from "react";
import { Tabs } from "expo-router";
import {
  View,
  Text,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { Route } from "@react-navigation/native";

type MyTabBarProps = BottomTabBarProps;

function MyTabBar({ state, descriptors, navigation }: MyTabBarProps) {
  const { colors, tokens, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === "ios" ? 20 : 10),
          backgroundColor: colors.background,
          borderTopColor: colors.border,
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
                styles.tabLabel,
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
  
  return (
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
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: "600",
          color: colors.text,
        },
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
            <User color={color} size={size} strokeWidth={1.5} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIndicator: {
    borderRadius: 2,
    bottom: -8,
    height: 4,
    position: "absolute",
    width: 4,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    position: "relative",
  },
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    textAlign: "center",
  },
});