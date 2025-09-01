import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  Share as RNShare
} from 'react-native';

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Share, Flag, Heart, MessageCircle, Star, Users, Settings, Info } from "lucide-react-native";
import { useTheme } from "../providers/ThemeProvider";
import { useAuth } from "../providers/AuthProvider";
import { Button } from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Card from "../components/ui/Card";
// Removed mock data imports - using real data from props

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type ModalType = 'user-actions' | 'review-actions' | 'share' | 'report' | 'settings' | 'info';

interface ModalContentProps {
  type: ModalType;
  data?: any;
  onClose: () => void;
}

function UserActionsModal({ data, onClose }: { data: any; onClose: () => void }) {
  const { colors } = useTheme();
  let router = useRouter();
  const user = data?.user;

  let handleAction = useCallback((action: string) => {
    switch (action) {
      case 'message':
        router.push(`/chat/1`);
        onClose();
        break;
      case 'profile':
        router.push(`/profile/${user.id}`);
        onClose();
        break;
      case 'block':
        Alert.alert(
          'Block User',
          `Are you sure you want to block ${user.username}? They won't be able to message you or see your profile.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Block', style: 'destructive', onPress: () => {
              Alert.alert('User Blocked', `${user.username} has been blocked.`);
              onClose();
            }}
          ]
        );
        break;
      case 'report':
        Alert.alert(
          'Report User',
          `Report ${user.username} for inappropriate behavior?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Report', style: 'destructive', onPress: () => {
              Alert.alert('User Reported', 'Thank you for your report. We will review it shortly.');
              onClose();
            }}
          ]
        );
        break;
    }
  }, [user, router, onClose]);

  return (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Avatar size="lg" name={user.username} isAnonymous={true} />
        <Text style={{ marginTop: 12 }}>
          {user.username}
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
          {user.bio}
        </Text>
      </View>

      <View style={styles.actionsList}>
        <Button
          onPress={() => handleAction('message')}
          leftIcon={<MessageCircle size={20} color={colors.primary} strokeWidth={1.5} />}
          style={styles.actionButton}
        >
          Send Message
        </Button>

        <Button
          onPress={() => handleAction('profile')}
          leftIcon={<Users size={20} color={colors.text} strokeWidth={1.5} />}
          style={styles.actionButton}
        >
          View Profile
        </Button>

        <Button
          onPress={() => handleAction('block')}
          leftIcon={<X size={20} color={colors.warning} strokeWidth={1.5} />}
          style={styles.actionButton}
        >
          Block User
        </Button>

        <Button
          onPress={() => handleAction('report')}
          leftIcon={<Flag size={20} color={colors.error} strokeWidth={1.5} />}
          style={styles.actionButton}
        >
          Report User
        </Button>
      </View>
    </View>
  );
}

function ReviewActionsModal({ data, onClose }: { data: any; onClose: () => void }) {
  const { colors } = useTheme();
  const router = useRouter();
  const review = data?.review;

  const handleAction = useCallback((action: string) => {
    switch (action) {
      case 'like':
        Alert.alert('Liked', 'You liked this review!');
        onClose();
        break;
      case 'share':
        Alert.alert('Shared', 'Review shared successfully!');
        onClose();
        break;
      case 'report':
        Alert.alert(
          'Report Review',
          'Report this review for inappropriate content?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Report', style: 'destructive', onPress: () => {
              Alert.alert('Review Reported', 'Thank you for your report. We will review it shortly.');
              onClose();
            }}
          ]
        );
        break;
      case 'view':
        router.push(`/review/${review.id}`);
        onClose();
        break;
    }
  }, [review, router, onClose]);

  return (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text >
          Review Actions
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
          {review.title}
        </Text>
      </View>

      <View style={styles.actionsList}>
        <Button
          onPress={() => handleAction('like')}
          leftIcon={<Heart size={20} color={colors.error} strokeWidth={1.5} />}
          style={styles.actionButton}
        >
          Like Review
        </Button>

        <Button
          onPress={() => handleAction('share')}
          leftIcon={<Share size={20} color={colors.primary} strokeWidth={1.5} />}
          style={styles.actionButton}
        >
          Share Review
        </Button>

        <Button
          onPress={() => handleAction('view')}
          leftIcon={<Star size={20} color={colors.warning} strokeWidth={1.5} />}
          style={styles.actionButton}
        >
          View Full Review
        </Button>

        <Button
          onPress={() => handleAction('report')}
          leftIcon={<Flag size={20} color={colors.error} strokeWidth={1.5} />}
          style={styles.actionButton}
        >
          Report Review
        </Button>
      </View>
    </View>
  );
}

function ShareModal({ data, onClose }: { data: any; onClose: () => void }) {
  const { colors } = useTheme();
  const shareData = data || { title: 'Check this out!', url: 'https://example.com' };

  const shareOptions = [
    { id: 'copy', label: 'Copy Link', icon: '🔗' },
    { id: 'message', label: 'Message', icon: '💬' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'social', label: 'Social Media', icon: '📱' },
  ];

  const handleShare = useCallback((option: string) => {
    Alert.alert('Shared', `Shared via ${option}!`);
    onClose();
  }, [onClose]);

  return (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text >
          Share
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
          {shareData.title}
        </Text>
      </View>

      <View style={styles.shareGrid}>
        {shareOptions.map((option) => (
          <Button
            key={option.id}
            onPress={() => handleShare(option.label)}
            style={styles.shareOption}
          >
            <Text style={{ fontSize: 24, marginBottom: 8 }}>{option.icon}</Text>
            <Text style={{ textAlign: 'center' }}>
              {option.label}
            </Text>
          </Button>
        ))}
      </View>
    </View>
  );
}

function ReportModal({ data, onClose }: { data: any; onClose: () => void }) {
  const { colors } = useTheme();
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const reportReasons = [
    'Inappropriate content',
    'Harassment or bullying',
    'Spam or fake account',
    'Hate speech',
    'Violence or threats',
    'Other',
  ];

  const handleSubmitReport = useCallback(() => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for reporting.');
      return;
    }

    Alert.alert(
      'Report Submitted',
      'Thank you for your report. We will review it and take appropriate action.',
      [{ text: 'OK', onPress: onClose }]
    );
  }, [selectedReason, customReason, onClose]);

  return (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text >
          Report Content
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
          Help us understand what's wrong
        </Text>
      </View>

      <ScrollView style={styles.reportReasons}>
        {reportReasons.map((reason) => (
          <Button
            key={reason}
            variant={selectedReason === reason ? 'primary' : 'outline'}
            onPress={() => setSelectedReason(reason)}
            style={styles.reasonButton}
          >
            <Text style={{
                color: selectedReason === reason ? colors.background : colors.text,
              }}
            >
              {reason}
            </Text>
          </Button>
        ))}
      </ScrollView>

      <Button
        onPress={handleSubmitReport}
        disabled={!selectedReason}
        style={styles.submitButton}
      >
        Submit Report
      </Button>
    </View>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  let router = useRouter();

  const settingsOptions = [
    { id: 'profile', label: 'Edit Profile', icon: Users },
    { id: 'privacy', label: 'Privacy Settings', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: MessageCircle },
    { id: 'help', label: 'Help & Support', icon: Info },
  ];

  const handleSettingPress = useCallback((settingId: string) => {
    switch (settingId) {
      case 'profile':
        router.push('/profile/edit');
        break;
      case 'privacy':
        router.push('/profile/privacy');
        break;
      case 'notifications':
        router.push('/notifications');
        break;
      case 'help':
        Alert.alert('Help & Support', 'Contact us at support@mocktrae.com');
        break;
    }
    onClose();
  }, [router, onClose]);

  return (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text >
          Settings
        </Text>
      </View>

      <View style={styles.actionsList}>
        {settingsOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Button
              key={option.id}
              onPress={() => handleSettingPress(option.id)}
              leftIcon={<IconComponent size={20} color={colors.text} strokeWidth={1.5} />}
              style={styles.actionButton}
            >
              {option.label}
            </Button>
          );
        })}
      </View>
    </View>
  );
}

function InfoModal({ data, onClose }: { data: any; onClose: () => void }) {
  const { colors } = useTheme();
  const info = data || {
    title: 'About MockTrae',
    content: 'MockTrae is a demo dating and review platform that allows users to connect and share experiences.',
  };

  return (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text >
          {info.title}
        </Text>
      </View>

      <ScrollView style={styles.infoContent}>
        <Text style={{ color: colors.text, lineHeight: 24 }}>
          {info.content}
        </Text>
        
        <View style={styles.infoSection}>
          <Text style={{ marginBottom: 8 }}>
            Features:
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>
            • Connect with people in your area{"\n"}
            • Share and read honest reviews{"\n"}
            • Join chat rooms and conversations{"\n"}
            • Discover new places and experiences{"\n"}
            • Privacy-focused and secure
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={{ marginBottom: 8 }}>
            Version:
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            MockTrae v1.0.0 (Demo)
          </Text>
        </View>
      </ScrollView>

      <Button onPress={onClose} style={styles.closeButton}>
        Close
      </Button>
    </View>
  );
}

function ModalContent({ type, data, onClose }: ModalContentProps) {
  switch (type) {
    case 'user-actions':
      return <UserActionsModal data={data} onClose={onClose} />;
    case 'review-actions':
      return <ReviewActionsModal data={data} onClose={onClose} />;
    case 'share':
      return <ShareModal data={data} onClose={onClose} />;
    case 'report':
      return <ReportModal data={data} onClose={onClose} />;
    case 'settings':
      return <SettingsModal onClose={onClose} />;
    case 'info':
      return <InfoModal data={data} onClose={onClose} />;
    default:
      return (
        <View style={styles.modalContent}>
          <Text >
            Modal Content
          </Text>
          <Button onPress={onClose} style={{ marginTop: 20 }}>
            Close
          </Button>
        </View>
      );
  }
}

export default function ModalScreen() {
  const router = useRouter();
  const { colors, tokens, isDark } = useTheme();
  const { user } = useAuth();

  // Demo modal states - in a real app, these would come from navigation params
  const [activeModal, setActiveModal] = useState<ModalType>('user-actions');
  const [modalData, setModalData] = useState(null);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const demoModals = [
    { type: 'user-actions' as ModalType, label: 'User Actions' },
    { type: 'review-actions' as ModalType, label: 'Review Actions' },
    { type: 'share' as ModalType, label: 'Share' },
    { type: 'report' as ModalType, label: 'Report' },
    { type: 'settings' as ModalType, label: 'Settings' },
    { type: 'info' as ModalType, label: 'Info' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          size="sm"
          onPress={handleClose}
          leftIcon={<X size={20} color={colors.text} strokeWidth={1.5} />}
        />
        <Text >
          Modal Demo
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Modal Type Selector */}
      <Card style={styles.selectorCard}>
        <Text style={{ marginBottom: 16 }}>
          Select Modal Type:
        </Text>
        <View style={styles.modalSelector}>
          {demoModals.map((modal) => (
            <Button
              key={modal.type}
              variant={activeModal === modal.type ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setActiveModal(modal.type)}
              style={styles.selectorButton}
            >
              <Text style={{
                  color: activeModal === modal.type ? colors.background : colors.text,
                }}
              >
                {modal.label}
              </Text>
            </Button>
          ))}
        </View>
      </Card>

      {/* Modal Preview */}
      <View style={styles.modalPreview}>
        <Card style={StyleSheet.flatten([styles.modalCard, { backgroundColor: colors.card }])}>
          <ModalContent
            type={activeModal}
            data={modalData}
            onClose={() => Alert.alert('Modal', 'Modal would close in real app')}
          />
        </Card>
      </View>

      {/* Instructions */}
      <Card style={styles.instructionsCard}>
        <Text style={{ marginBottom: 8 }}>
          Instructions:
        </Text>
        <Text style={{ color: colors.textSecondary, lineHeight: 18 }}>
          This screen demonstrates different modal types used throughout the app. 
          In a real implementation, modals would be triggered by user actions and 
          receive appropriate data through navigation parameters.
        </Text>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    justifyContent: 'flex-start',
  },
  actionsList: {
    gap: 12,
  },
  closeButton: {
    marginTop: 16,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  infoContent: {
    flex: 1,
    marginBottom: 20,
  },
  infoSection: {
    marginTop: 20,
  },
  instructionsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  modalCard: {
    borderRadius: 16,
    flex: 1,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalPreview: {
    flex: 1,
    margin: 16,
    marginTop: 0,
  },
  modalSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reasonButton: {
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  reportReasons: {
    marginBottom: 20,
    maxHeight: 200,
  },
  selectorButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectorCard: {
    margin: 16,
    padding: 16,
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  shareOption: {
    alignItems: 'center',
    flexDirection: 'column',
    height: 80,
    justifyContent: 'center',
    width: (screenWidth - 80) / 2,
  },
  submitButton: {
    marginTop: 16,
  },
});