import React from 'react';
import {
  View,
  Text as RNText,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert
} from 'react-native';

import { useRouter } from 'expo-router';
import { LogOut, Settings, User, MapPin } from 'lucide-react-native';
import { Text } from '../ui/Text';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';

export default function UserProfile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)');
            } catch (error) {
              if (__DEV__) {
                console.error('Sign out error:', error);
              }
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/(tabs)/profile/edit');
  };

  const handleGoToApp = () => {
    router.replace('/(tabs)');
  };

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {/* Anonymous avatar - no profile photos */}
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.chipBg }]}>
            <User color={colors.primary} size={32} strokeWidth={1.5} />
          </View>
        </View>

        <View style={styles.userInfo}>
          <Text
            style={{ color: colors.text, marginBottom: 4 }}
          >
            {user.displayName || user.email?.split('@')[0] || 'User'}
          </Text>
          
          <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>
            {user.email}
          </Text>

          {user.age && (
            <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
              Age: {user.age}
            </Text>
          )}

          {user.location && (
            <View style={styles.locationContainer}>
              <MapPin color={colors.textSecondary} size={14} strokeWidth={1.5} />
              <Text
                style={{ color: colors.textSecondary, marginLeft: 4 }}
              >
                {user.location}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={{ color: colors.text }}>
            {user.reviewsCount || 0}
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            Reviews
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={{ color: colors.text }}>
            {user.matchesCount || 0}
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            Matches
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={{ color: colors.text }}>
            {user.rating || '0.0'}
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            Rating
          </Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={handleGoToApp}
        >
          <Text
            style={{ color: colors.onPrimary }}
          >
            Go to App
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.secondaryButton,
            { backgroundColor: colors.cardBg, borderColor: colors.border },
          ]}
          onPress={handleEditProfile}
        >
          <Settings color={colors.text} size={18} strokeWidth={1.5} />
          <Text
            style={{ color: colors.text, marginLeft: 8 }}
          >
            Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.secondaryButton,
            { backgroundColor: colors.errorBg, borderColor: colors.error },
          ]}
          onPress={handleSignOut}
        >
          <LogOut color={colors.error} size={18} strokeWidth={1.5} />
          <Text
            style={{ color: colors.error, marginLeft: 8 }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>

      {!user.profileComplete && (
        <View style={[styles.incompleteProfileBanner, { backgroundColor: colors.warningBg }]}>
          <Text style={{ color: colors.warning, textAlign: 'center' }}>
            Complete your profile to get better matches
          </Text>
          <Pressable
            onPress={() => router.push('/(auth)/profile-setup')}
            style={({ pressed }) => [
              styles.completeProfileButton,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <Text
              style={{ color: colors.warning }}
            >
              Complete Now
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    paddingVertical: 14,
  },
  actionsSection: {
    marginBottom: 20,
  },
  avatar: {
    borderRadius: 40,
    height: 80,
    width: 80,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  completeProfileButton: {
    marginTop: 8,
  },
  container: {
    paddingHorizontal: 20,
  },
  incompleteProfileBanner: {
    borderRadius: 8,
    padding: 12,
  },
  locationContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  profileSection: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 24,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    marginBottom: 32,
    paddingVertical: 16,
  },
  userInfo: {
    flex: 1,
  },
});