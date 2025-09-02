import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import logger from '../../utils/logger';

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Shield, Eye, EyeOff, Lock, Users, Bell, MapPin, Heart, MessageCircle } from "lucide-react-native";
import { useTheme } from "../../providers/ThemeProvider";
import { useAuth } from "../../providers/AuthProvider";
import { Button } from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { createTypographyStyles } from "../../styles/typography";

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showAge: boolean;
  showLocation: boolean;
  showLastSeen: boolean;
  allowMessages: 'everyone' | 'friends' | 'nobody';
  allowReviews: 'everyone' | 'friends' | 'nobody';
  showReviewsOnProfile: boolean;
  allowNotifications: {
    messages: boolean;
    reviews: boolean;
    matches: boolean;
    marketing: boolean;
  };
  dataSharing: {
    analytics: boolean;
    personalization: boolean;
    thirdParty: boolean;
  };
}

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

function SettingItem({ icon, title, description, value, onValueChange, disabled }: SettingItemProps) {
  const { colors } = useTheme();
  const typography = createTypographyStyles(colors);

  return (
    <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={typography.body}>
            {title}
          </Text>
          {description && (
            <Text style={[typography.caption, { marginTop: 2 }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? colors.background : colors.textSecondary}
      />
    </View>
  );
}

interface OptionItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  options: { label: string; value: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

function OptionItem({ icon, title, description, options, selectedValue, onValueChange }: OptionItemProps) {
  const { colors } = useTheme();
  const typography = createTypographyStyles(colors);

  return (
    <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={typography.body}>
            {title}
          </Text>
          {description && (
            <Text style={[typography.caption, { marginTop: 2 }]}>
              {description}
            </Text>
          )}
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <Button
                key={option.value}
                variant={selectedValue === option.value ? "primary" : "outline"}
                size="sm"
                onPress={() => onValueChange(option.value)}
                style={styles.optionButton}
              >
                <Text style={[
                    typography.button,
                    {
                      color: selectedValue === option.value ? colors.onPrimary : colors.text,
                    }
                  ]}
                >
                  {option.label}
                </Text>
              </Button>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

export default function PrivacyScreen() {
  const router = useRouter();
  const { colors, tokens, isDark } = useTheme();
  const typography = createTypographyStyles(colors);
  const { user } = useAuth();

  // Initialize privacy settings with default values
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showAge: true,
    showLocation: true,
    showLastSeen: true,
    allowMessages: 'everyone',
    allowReviews: 'everyone',
    showReviewsOnProfile: true,
    allowNotifications: {
      messages: true,
      reviews: true,
      matches: true,
      marketing: false,
    },
    dataSharing: {
      analytics: true,
      personalization: true,
      thirdParty: false,
    },
  });

  const [loading, setLoading] = useState(false);

  // Handlers
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleToggleSetting = useCallback((category: keyof PrivacySettings, key?: string) => {
    setSettings(prev => {
      if (key && typeof prev[category] === 'object' && prev[category] !== null) {
        return {
          ...(prev as any),
          [category]: {
            ...(prev[category] as any),
            [key]: !(prev[category] as any)[key],
          },
        };
      } else {
        return {
          ...(prev as any),
          [category]: !prev[category],
        };
      }
    });
  }, []);

  const handleOptionChange = useCallback((category: keyof PrivacySettings, value: string) => {
    setSettings(prev => ({
      ...(prev as any),
      [category]: value,
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Success',
        'Your privacy settings have been updated successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error updating privacy settings:', error);
      }
      Alert.alert('Error', 'Failed to update privacy settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [settings]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deleted',
              'Your account has been scheduled for deletion. You will be logged out now.',
              [{ text: 'OK', onPress: () => router.replace('/auth/signin') }]
            );
          },
        },
      ]
    );
  }, [router]);

  const profileVisibilityOptions = [
    { label: 'Public', value: 'public' },
    { label: 'Friends', value: 'friends' },
    { label: 'Private', value: 'private' },
  ];

  const messageOptions = [
    { label: 'Everyone', value: 'everyone' },
    { label: 'Friends', value: 'friends' },
    { label: 'Nobody', value: 'nobody' },
  ];

  const reviewOptions = [
    { label: 'Everyone', value: 'everyone' },
    { label: 'Friends', value: 'friends' },
    { label: 'Nobody', value: 'nobody' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          size="sm"
          onPress={handleBack}
          leftIcon={<ArrowLeft size={20} color={colors.text} strokeWidth={1.5} />}
        />
        <Text style={typography.h2}>
          Privacy Settings
        </Text>
        <Button
          size="sm"
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={{ color: colors.primary }}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </Button>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Visibility */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>
            Profile Visibility
          </Text>
          
          <OptionItem
            icon={<Eye size={20} color={colors.primary} strokeWidth={1.5} />}
            title="Who can see your profile"
            description="Control who can view your profile information"
            options={profileVisibilityOptions}
            selectedValue={settings.profileVisibility}
            onValueChange={(value) => handleOptionChange('profileVisibility', value)}
          />

          <SettingItem
            icon={<Users size={20} color={colors.primary} strokeWidth={1.5} />}
            title="Show age on profile"
            description="Display your age to other users"
            value={settings.showAge}
            onValueChange={() => handleToggleSetting('showAge')}
          />

          <SettingItem
            icon={<MapPin size={20} color={colors.primary} strokeWidth={1.5} />}
            title="Show location"
            description="Display your location to other users"
            value={settings.showLocation}
            onValueChange={() => handleToggleSetting('showLocation')}
          />

          <SettingItem
            icon={<Eye size={20} color={colors.primary} strokeWidth={1.5} />}
            title="Show last seen"
            description="Let others see when you were last active"
            value={settings.showLastSeen}
            onValueChange={() => handleToggleSetting('showLastSeen')}
          />
        </Card>

        {/* Communication */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>
            Communication
          </Text>
          
          <OptionItem
            icon={<MessageCircle size={20} color={colors.primary} strokeWidth={1.5} />}
            title="Who can message you"
            description="Control who can send you direct messages"
            options={messageOptions}
            selectedValue={settings.allowMessages}
            onValueChange={(value) => handleOptionChange('allowMessages', value)}
          />

          <OptionItem
            icon={<Heart size={20} color={colors.primary} strokeWidth={1.5} />}
            title="Who can review you"
            description="Control who can write reviews about you"
            options={reviewOptions}
            selectedValue={settings.allowReviews}
            onValueChange={(value) => handleOptionChange('allowReviews', value)}
          />

          <SettingItem
            icon={<Eye size={20} color={colors.primary} strokeWidth={1.5} />}
            title="Show reviews on profile"
            description="Display reviews about you on your profile"
            value={settings.showReviewsOnProfile}
            onValueChange={() => handleToggleSetting('showReviewsOnProfile')}
          />
        </Card>

        {/* Notifications */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>
            Notifications
          </Text>
          
          <SettingItem
            icon={<MessageCircle size={20} color={colors.primary} strokeWidth={1.5} />}
            title="Message notifications"
            description="Get notified when you receive new messages"
            value={(settings as any)?.allowNotifications?.messages}
            onValueChange={() => handleToggleSetting('allowNotifications', 'messages')}
          />

          <SettingItem
            icon={<Heart size={20} color={colors.primary} strokeWidth={1.5} />}
            title="Review notifications"
            description="Get notified when someone reviews you"
            value={settings.allowNotifications.reviews}
            onValueChange={() => handleToggleSetting('allowNotifications', 'reviews')}
          />

          <SettingItem
            icon={<Users size={20} color={colors.primary} strokeWidth={1.5} />}
            title="Match notifications"
            description="Get notified about new matches"
            value={settings.allowNotifications.matches}
            onValueChange={() => handleToggleSetting('allowNotifications', 'matches')}
          />

          <SettingItem
            icon={<Bell size={20} color={colors.primary} strokeWidth={1.5} />}
            title="Marketing notifications"
            description="Receive updates about new features and promotions"
            value={settings.allowNotifications.marketing}
            onValueChange={() => handleToggleSetting('allowNotifications', 'marketing')}
          />
        </Card>

        {/* Data & Privacy */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>
            Data & Privacy
          </Text>
          
          <SettingItem
            icon={<Shield size={20} color={colors.primary} strokeWidth={1.5} />}
            title="Analytics data"
            description="Help improve the app by sharing usage analytics"
            value={(settings as any)?.dataSharing.analytics}
            onValueChange={() => handleToggleSetting('dataSharing', 'analytics')}
          />

          <SettingItem
            icon={<Eye size={20} color={colors.primary} strokeWidth={1.5} />}
            title="Personalization"
            description="Use your data to personalize your experience"
            value={(settings as any)?.dataSharing.personalization}
            onValueChange={() => handleToggleSetting('dataSharing', 'personalization')}
          />

          <SettingItem
            icon={<Lock size={20} color={colors.primary} strokeWidth={1.5} />}
            title="Third-party sharing"
            description="Share data with trusted partners for better service"
            value={(settings as any)?.dataSharing.thirdParty}
            onValueChange={() => handleToggleSetting('dataSharing', 'thirdParty')}
          />
        </Card>

        {/* Account Actions */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>
            Account Actions
          </Text>
          
          <Button
            onPress={() => Alert.alert('Export Data', 'Your data export will be sent to your email within 24 hours.')}
            style={styles.actionButton}
          >
            <Text style={typography.button}>
              Export My Data
            </Text>
          </Button>

          <Button
            onPress={handleDeleteAccount}
            style={styles.actionButton}
          >
            <Text style={typography.button}>
              Delete Account
            </Text>
          </Button>
        </Card>

        {/* Privacy Policy */}
        <View style={styles.footer}>
          <Text style={[typography.caption, { textAlign: 'center' }]}>
            By using this app, you agree to our Privacy Policy and Terms of Service.
            Your privacy is important to us and we are committed to protecting your personal information.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    marginBottom: 12,
  },
  container: {
    flex: 1,
  },
  footer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingContent: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row',
  },
  settingIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  settingItem: {
    alignItems: 'flex-start',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingText: {
    flex: 1,
  },
});