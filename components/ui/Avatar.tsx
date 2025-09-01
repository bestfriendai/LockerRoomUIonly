import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  Text
} from 'react-native';
import { User } from "lucide-react-native";
import { useTheme } from "../../providers/ThemeProvider";
import AnimatedPressable from "../../components/ui/AnimatedPressable";
import { createTypographyStyles } from "../../styles/typography";

export interface AvatarProps {
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "circle" | "rounded" | "square";
  onPress?: () => void;
  style?: ViewStyle;
  showBorder?: boolean;
  borderColor?: string;
  fallbackBg?: string;
  fallbackColor?: string;
  verified?: boolean;
  status?: "online" | "offline" | "away" | "busy";
  isAnonymous?: boolean;
}

export default function Avatar({
  alt,
  name,
  size = "md",
  variant = "circle",
  onPress,
  style,
  showBorder = false,
  borderColor,
  fallbackBg,
  fallbackColor,
  verified = false,
  status,
  isAnonymous = true,
}: AvatarProps) {
  const { colors, tokens } = useTheme();
  const typography = createTypographyStyles(colors);

  const getSize = () => {
    switch (size) {
      case "xs": return 24;
      case "sm": return 32;
      case "md": return 40;
      case "lg": return 48;
      case "xl": return 56;
      case "2xl": return 64;
      default: return 40;
    }
  };

  const getBorderRadius = () => {
    const avatarSize = getSize();
    switch (variant) {
      case "circle": return avatarSize / 2;
      case "rounded": return tokens.radii.lg;
      case "square": return tokens.radii.sm;
      default: return avatarSize / 2;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "xs": return 10;
      case "sm": return 12;
      case "md": return 16;
      case "lg": return 18;
      case "xl": return 20;
      case "2xl": return 24;
      default: return 16;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const getStatusSize = () => {
    const avatarSize = getSize();
    return Math.max(8, avatarSize * 0.2);
  };

  const getStatusColor = () => {
    switch (status) {
      case "online": return colors.success;
      case "away": return colors.warning;
      case "busy": return colors.error;
      case "offline": return colors.textTertiary;
      default: return colors.textTertiary;
    }
  };

  const avatarSize = getSize();
  const borderRadius = getBorderRadius();
  const fontSize = getFontSize();
  const statusSize = getStatusSize();

  const containerStyle: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius,
    backgroundColor: fallbackBg || colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: showBorder ? 2 : 0,
    borderColor: borderColor || colors.border,
  };

  const renderContent = () => {
    if (name && !isAnonymous) {
      return (
        <Text
          style={[
            typography.body, // Example style, adjust as needed
            { 
              fontSize,
              color: fallbackColor || colors.text,
            }
          ]}
        >
          {getInitials(name)}
        </Text>
      );
    }

    return (
      <User
        size={fontSize}
        color={fallbackColor || colors.primary}
        strokeWidth={1.5}
      />
    );
  };

  const renderVerifiedBadge = () => {
    if (!verified) return null;

    const badgeSize = Math.max(12, avatarSize * 0.25);

    return (
      <View
        style={[
          styles.verifiedBadge,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: colors.primary,
            borderColor: colors.surface,
            bottom: -2,
            right: -2,
          },
        ]}
      >
        <Text
          style={{
            fontSize: badgeSize * 0.6,
            color: colors.onPrimary,
            fontWeight: "600",
          }}
        >
          ✓
        </Text>
      </View>
    );
  };

  const renderStatusIndicator = () => {
    if (!status) return null;

    return (
      <View
        style={[
          styles.statusIndicator,
          {
            width: statusSize,
            height: statusSize,
            borderRadius: statusSize / 2,
            backgroundColor: getStatusColor(),
            borderColor: colors.surface,
            borderWidth: 2,
            bottom: 0,
            right: 0,
          },
        ]}
      />
    );
  };

  if (onPress) {
    return (
      <View style={[styles.container, style]}>
        <AnimatedPressable
          style={containerStyle}
          onPress={onPress}
          scaleTo={0.95}
          accessibilityRole="button"
          accessibilityLabel={alt || `Avatar for ${name || "user"}`}
        >
          {renderContent()}
        </AnimatedPressable>
        {renderVerifiedBadge()}
        {renderStatusIndicator()}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={containerStyle}>
        {renderContent()}
      </View>
      {renderVerifiedBadge()}
      {renderStatusIndicator()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  statusIndicator: {
    position: "absolute",
  },
  verifiedBadge: {
    alignItems: "center",
    borderWidth: 2,
    justifyContent: "center",
    position: "absolute",
  },
});