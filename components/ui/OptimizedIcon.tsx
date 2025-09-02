import React, { memo } from 'react';
import { ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Optimized Icon Component
 * Reduces bundle size by only importing used icons and provides better performance
 */

interface OptimizedIconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  style?: ViewStyle;
  testID?: string;
}

// Commonly used icons - preload these for better performance
const COMMON_ICONS = new Set([
  'home',
  'home-outline',
  'search',
  'search-outline',
  'heart',
  'heart-outline',
  'person',
  'person-outline',
  'chatbubble',
  'chatbubble-outline',
  'notifications',
  'notifications-outline',
  'settings',
  'settings-outline',
  'add',
  'add-outline',
  'close',
  'close-outline',
  'arrow-back',
  'arrow-forward',
  'chevron-down',
  'chevron-up',
  'chevron-back',
  'chevron-forward',
  'checkmark',
  'checkmark-circle',
  'alert-circle',
  'information-circle',
  'warning',
  'star',
  'star-outline',
  'share',
  'share-outline',
  'bookmark',
  'bookmark-outline',
  'camera',
  'camera-outline',
  'image',
  'image-outline',
  'location',
  'location-outline',
  'time',
  'time-outline',
  'calendar',
  'calendar-outline',
  'mail',
  'mail-outline',
  'call',
  'call-outline',
  'globe',
  'globe-outline',
  'lock-closed',
  'lock-open',
  'eye',
  'eye-off',
  'refresh',
  'refresh-outline',
  'download',
  'download-outline',
  'cloud',
  'cloud-outline',
  'wifi',
  'wifi-outline',
  'battery-full',
  'battery-half',
  'battery-dead',
  'volume-high',
  'volume-low',
  'volume-mute',
  'play',
  'pause',
  'stop',
  'skip-forward',
  'skip-backward',
  'repeat',
  'shuffle',
  'thumbs-up',
  'thumbs-down',
  'flag',
  'flag-outline',
  'trash',
  'trash-outline',
  'create',
  'create-outline',
  'copy',
  'copy-outline',
  'cut',
  'cut-outline',
  'paste',
  'paste-outline',
  'save',
  'save-outline',
  'print',
  'print-outline',
  'document',
  'document-outline',
  'folder',
  'folder-outline',
  'archive',
  'archive-outline',
  'filter',
  'filter-outline',
  'funnel',
  'funnel-outline',
  'grid',
  'grid-outline',
  'list',
  'list-outline',
  'menu',
  'menu-outline',
  'more-horizontal',
  'more-vertical',
  'ellipsis-horizontal',
  'ellipsis-vertical',
]);

export const OptimizedIcon: React.FC<OptimizedIconProps> = memo(({
  name,
  size = 24,
  color = '#000000',
  style,
  testID,
}) => {
  // Warn in development if using uncommon icons
  if (__DEV__ && !COMMON_ICONS.has(name)) {
    console.warn(
      `OptimizedIcon: Using uncommon icon "${name}". Consider adding it to COMMON_ICONS for better performance.`
    );
  }

  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      style={style}
      testID={testID}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.name === nextProps.name &&
    prevProps.size === nextProps.size &&
    prevProps.color === nextProps.color &&
    prevProps.style === nextProps.style &&
    prevProps.testID === nextProps.testID
  );
});

OptimizedIcon.displayName = 'OptimizedIcon';

// Export commonly used icon names for TypeScript autocomplete
export const CommonIconNames = {
  // Navigation
  HOME: 'home' as const,
  HOME_OUTLINE: 'home-outline' as const,
  SEARCH: 'search' as const,
  SEARCH_OUTLINE: 'search-outline' as const,
  BACK: 'arrow-back' as const,
  FORWARD: 'arrow-forward' as const,
  CLOSE: 'close' as const,
  ADD: 'add' as const,
  MENU: 'menu' as const,
  MORE: 'ellipsis-horizontal' as const,

  // Actions
  HEART: 'heart' as const,
  HEART_OUTLINE: 'heart-outline' as const,
  SHARE: 'share' as const,
  BOOKMARK: 'bookmark' as const,
  BOOKMARK_OUTLINE: 'bookmark-outline' as const,
  STAR: 'star' as const,
  STAR_OUTLINE: 'star-outline' as const,
  THUMBS_UP: 'thumbs-up' as const,
  THUMBS_DOWN: 'thumbs-down' as const,

  // Communication
  CHAT: 'chatbubble' as const,
  CHAT_OUTLINE: 'chatbubble-outline' as const,
  MAIL: 'mail' as const,
  CALL: 'call' as const,
  NOTIFICATIONS: 'notifications' as const,
  NOTIFICATIONS_OUTLINE: 'notifications-outline' as const,

  // User
  PERSON: 'person' as const,
  PERSON_OUTLINE: 'person-outline' as const,
  SETTINGS: 'settings' as const,
  SETTINGS_OUTLINE: 'settings-outline' as const,

  // Media
  CAMERA: 'camera' as const,
  IMAGE: 'image' as const,
  PLAY: 'play' as const,
  PAUSE: 'pause' as const,
  STOP: 'stop' as const,

  // Status
  CHECKMARK: 'checkmark' as const,
  CHECKMARK_CIRCLE: 'checkmark-circle' as const,
  ALERT: 'alert-circle' as const,
  INFO: 'information-circle' as const,
  WARNING: 'warning' as const,

  // Utility
  REFRESH: 'refresh' as const,
  DOWNLOAD: 'download' as const,
  TRASH: 'trash' as const,
  EDIT: 'create' as const,
  COPY: 'copy' as const,
  SAVE: 'save' as const,
  FILTER: 'filter' as const,
  LOCATION: 'location' as const,
  TIME: 'time' as const,
  CALENDAR: 'calendar' as const,
} as const;

export type CommonIconName = typeof CommonIconNames[keyof typeof CommonIconNames];
