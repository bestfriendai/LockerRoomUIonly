import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
  Modal,
  Share,
  Animated,
  RefreshControl
} from 'react-native';
import logger from '../../utils/logger';

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Settings,
  Edit3,
  Star,
  Activity,
  MessageCircle,
  Heart,
  Eye,
  Calendar,
  MapPin,
  LogOut,
  Share as ShareIcon,
  User as UserIcon,
  Shield,
  Trophy,
  Target,
  Zap,
  RefreshCw,
  ChevronRight,
  Award,
} from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "../../providers/ThemeProvider";
import { useAuth } from "../../providers/AuthProvider";
import { Button } from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Card from "../../components/ui/Card";
import ReviewCard from "../../components/ReviewCard";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";
import type { Review, User } from "../../types";
import { generateAnonymousUsername, generateMultipleUsernames } from "../../services/usernameGenerator";
import { toMillis, formatDate } from "../../utils/timestampHelpers";

const { width: screenWidth } = Dimensions.get('window');

type ProfileTab = 'reviews' | 'activity' | 'about';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  onPress?: () => void;
}

const StatCard = ({ icon, value, title, subtitle, onPress }: StatCardProps) => {
  const { colors } = useTheme();

  const baseStyle = [
    styles.statCard,
    {
      backgroundColor: colors.card,
      borderColor: colors.border,
    }
  ];

  const pressableStyle = ({ pressed }: { pressed: boolean }) => [
    styles.statCard,
    {
      backgroundColor: pressed ? colors.surfaceElevated : colors.card,
      borderColor: colors.border,
    }
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={pressableStyle}>
        <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
          {icon}
        </View>
        <Text style={styles.statValue}>
           {value}
         </Text>
         <Text style={styles.statTitle}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
            {subtitle}
          </Text>
        )}
      </Pressable>
    );
  }

  return (
    <View style={baseStyle}>
      <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>
        {value}
      </Text>
      <Text style={styles.statTitle}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

interface ActivityItemProps {
  type: 'review_given' | 'review_received' | 'room_joined' | 'profile_updated';
  title: string;
  description: string;
  timestamp: string;
  metadata?: unknown;
}

const ActivityItem = ({ type, title, description, timestamp, metadata }: ActivityItemProps) => {
  const { colors } = useTheme();
  
  const getIcon = () => {
    switch (type) {
      case 'review_given':
        return <Star size={16} color={colors.warning} strokeWidth={1.5} />;
      case 'review_received':
        return <Heart size={16} color={colors.error} strokeWidth={1.5} />;
      case 'room_joined':
        return <MessageCircle size={16} color={colors.primary} strokeWidth={1.5} />;
      case 'profile_updated':
        return <UserIcon size={16} color={colors.success} strokeWidth={1.5} />;
      default:
        return <Activity size={16} color={colors.textSecondary} strokeWidth={1.5} />;
    }
  };

  const formatTime = (timestamp: string) => {
    let date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <View style={[styles.activityItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.activityIcon, { backgroundColor: colors.surfaceElevated }]}>
        {getIcon()}
      </View>
      <View style={styles.activityContent}>
        <Text >
          {title}
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: 2 }}>
          {description}
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
          {formatTime(timestamp)}
        </Text>
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, tokens, isDark } = useTheme();
  const { user, signOut, updateUser } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  // Anonymous username management states
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameOptions, setUsernameOptions] = useState<string[]>([]);
  const [isGeneratingUsernames, setIsGeneratingUsernames] = useState(false);

  // State
  const [activeTab, setActiveTab] = useState<ProfileTab>('reviews');
  const [refreshing, setRefreshing] = useState(false);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [activities, setActivities] = useState<ActivityItemProps[]>([]);

  const fetchReviews = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);

    try {
      // Fetch reviews written by the user
      const userReviewsQuery = query(collection(db, "reviews"), where("userId", "==", user.id));
      const userReviewsSnapshot = await getDocs(userReviewsQuery);
      const userReviewsData = userReviewsSnapshot.docs.map(doc => ({ ...(doc as any).data(), id: doc.id } as Review));
      setUserReviews(userReviewsData);

      // Fetch reviews received by the user
      const receivedReviewsQuery = query(collection(db, "reviews"), where("targetId", "==", user.id));
      const receivedReviewsSnapshot = await getDocs(receivedReviewsQuery);
      const receivedReviewsData = receivedReviewsSnapshot.docs.map(doc => ({ ...(doc as any).data(), id: doc.id } as Review));
      setReceivedReviews(receivedReviewsData);

    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error("Error fetching reviews:", error);
      }
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReviews();
    // Activities will be implemented with a proper activity tracking system later
    setActivities([]);
  }, [fetchReviews]);

  const _onRefresh = useCallback(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Anonymous username management functions
  const handleUsernameEdit = useCallback(async () => {
    setIsGeneratingUsernames(true);
    try {
      const options = generateMultipleUsernames(5);
      setUsernameOptions(options);
      setIsEditingUsername(true);
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error generating usernames:', error);
      }
      Alert.alert('Error', 'Failed to generate username options. Please try again.');
    } finally {
      setIsGeneratingUsernames(false);
    }
  }, []);

  const handleUsernameUpdate = useCallback(async (newUsername: string) => {
    try {
      await updateUser({ name: newUsername });
      setIsEditingUsername(false);
      Alert.alert('Success', 'Your anonymous identity has been updated!');
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error updating username:', error);
      }
      Alert.alert('Error', 'Failed to update username. Please try again.');
    }
  }, [updateUser]);

  const regenerateUsernames = useCallback(async () => {
    setIsGeneratingUsernames(true);
    try {
      const newOptions = generateMultipleUsernames(5);
      setUsernameOptions(newOptions);
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Error regenerating usernames:', error);
      }
    } finally {
      setIsGeneratingUsernames(false);
    }
  }, []);

  const memoizedUserReviews = useMemo(() => userReviews, [userReviews]);
  const memoizedReceivedReviews = useMemo(() => receivedReviews, [receivedReviews]);
  const memoizedActivities = useMemo(() => activities, [activities]);

  const tabs = [
    { id: 'reviews' as ProfileTab, label: 'Reviews', icon: Star },
    { id: 'activity' as ProfileTab, label: 'Activity', icon: Activity },
    { id: 'about' as ProfileTab, label: 'About', icon: UserIcon },
  ];

  // Calculate stats
  const _stats = useMemo(() => {
    const givenCount = userReviews.length;
    const receivedCount = receivedReviews.length;
    const averageRating = receivedReviews.length > 0 
      ? receivedReviews.reduce((sum, review) => sum + review.rating, 0) / receivedReviews.length
      : 0;
    
    return {
      given: givenCount,
      received: receivedCount,
      rating: averageRating,
    };
  }, [userReviews, receivedReviews]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleTabPress = useCallback((tab: ProfileTab, index: number) => {
    setActiveTab(tab);
    Animated.spring(tabIndicatorAnim, {
      toValue: index,
      useNativeDriver: true,
    }).start();
  }, [tabIndicatorAnim]);

  const _handleEditProfile = useCallback(() => {
    router.push('/profile/edit');
  }, [router]);

  const handleSettings = useCallback(() => {
    router.push('/profile/privacy');
  }, [router]);

  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  const handleShare = useCallback(() => {
    if (__DEV__) {
      __DEV__ && console.log('Share profile');
    }
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'reviews': {
        const allReviews = [...userReviews, ...receivedReviews].sort(
          (a, b) => {
            const timeA = toMillis(a.timestamp);
            const timeB = toMillis(b.timestamp);
            return timeB - timeA;
          }
        );
        
        if (allReviews.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Star size={48} color={colors.textSecondary} strokeWidth={1} />
              <Text style={{ marginTop: 16, textAlign: 'center' }}>
                No Reviews Yet
              </Text>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
                Start reviewing others or encourage them to review you!
              </Text>
            </View>
          );
        }
        
        return (
          <FlashList
            data={allReviews}
            renderItem={({ item }) => (
              <ReviewCard
                review={item}
                onPress={() => router.push(`/review/${item.id}`)}
                style={{ marginBottom: 12 }}
              />
            )}
            estimatedItemSize={200}
            contentContainerStyle={styles.tabContent}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
          />
        );
      }

      case 'activity': {
        if (activities.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Activity size={48} color={colors.textSecondary} strokeWidth={1} />
              <Text style={{ marginTop: 16, textAlign: 'center' }}>
                No Activity Yet
              </Text>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
                Your recent activities will appear here.
              </Text>
            </View>
          );
        }
        
        return (
          <ScrollView
            style={styles.activityList}
            contentContainerStyle={styles.tabContent}
            showsVerticalScrollIndicator={false}
          >
            {activities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </ScrollView>
        );
      }

      case 'about':
        return (
          <ScrollView
            style={styles.aboutContent}
            contentContainerStyle={styles.tabContent}
            showsVerticalScrollIndicator={false}
          >
            <Card style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>
                Anonymous Bio
              </Text>
              <Text style={{ color: colors.text, lineHeight: 22 }}>
                {user?.bio || 'No bio available. Edit your profile to add an anonymous bio.'}
              </Text>
            </Card>

            <Card style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>
                Anonymous Profile Details
              </Text>
              <View style={styles.detailsList}>
                <View style={styles.detailItem}>
                  <Shield size={16} color={colors.success} strokeWidth={1.5} />
                  <Text style={{ marginLeft: 12, color: colors.text }}>
                    Anonymous Identity Protected
                  </Text>
                </View>
                {user?.age && (
                  <View style={styles.detailItem}>
                    <Calendar size={16} color={colors.textSecondary} strokeWidth={1.5} />
                    <Text style={{ marginLeft: 12, color: colors.text }}>
                      {user.age} years old
                    </Text>
                  </View>
                )}
                <View style={styles.detailItem}>
                  <UserIcon size={16} color={colors.textSecondary} strokeWidth={1.5} />
                  <Text style={{ marginLeft: 12, color: colors.text }}>
                    Member since {user?.createdAt ? formatDate(user.createdAt, { month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Trophy size={16} color={colors.primary} strokeWidth={1.5} />
                  <Text style={{ marginLeft: 12, color: colors.text }}>
                    Reputation Level: {Math.floor((user?.reputationScore || 0) / 100) + 1}
                  </Text>
                </View>
              </View>
            </Card>

            <Card style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>
                Privacy & Settings
              </Text>
              <View style={styles.settingsGroup}>
                <TouchableOpacity style={styles.settingItem} onPress={handleUsernameEdit}>
                  <View style={styles.settingContent}>
                    <Text style={{ color: colors.text }}>Change Anonymous Username</Text>
                    <Text style={{ color: colors.textSecondary }}>
                      Generate a new anonymous identity
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/profile/edit')}>
                  <View style={styles.settingContent}>
                    <Text style={{ color: colors.text }}>Edit Profile</Text>
                    <Text style={{ color: colors.textSecondary }}>
                      Update your anonymous profile information
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem} onPress={handleSettings}>
                  <View style={styles.settingContent}>
                    <Text style={{ color: colors.text }}>Privacy Settings</Text>
                    <Text style={{ color: colors.textSecondary }}>
                      Control your anonymous profile visibility
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
                </TouchableOpacity>
              </View>
            </Card>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <UserIcon size={48} color={colors.textSecondary} strokeWidth={1} />
          <Text style={{ marginTop: 16, textAlign: 'center' }}>
            Not Signed In
          </Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            Please sign in to view your profile.
          </Text>
          <Button
            onPress={() => router.push('/(auth)/signin')}
            style={{ marginTop: 24 }}
          >
            Sign In
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerActions}>
            <Button
              size="sm"
              onPress={handleShare}
              leftIcon={<ShareIcon size={16} color={colors.primary} strokeWidth={1.5} />}
            >
              Share
            </Button>
            <Button
              size="sm"
              onPress={handleSettings}
              leftIcon={<Settings size={16} color={colors.primary} strokeWidth={1.5} />}
            >
              Settings
            </Button>
          </View>
        </View>

        {/* Anonymous Profile Header */}
        <View style={styles.profileSection}>
          <View style={[styles.anonymousAvatar, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
            <UserIcon size={40} color={colors.primary} strokeWidth={1.5} />
          </View>

          <View style={styles.usernameContainer}>
            <TouchableOpacity
              style={styles.usernameEditContainer}
              onPress={handleUsernameEdit}
              disabled={isGeneratingUsernames}
            >
              <Text style={[styles.username, { color: colors.text }]}>
                {user?.name || 'Anonymous User'}
              </Text>
              <Edit3 size={16} color={colors.primary} strokeWidth={1.5} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>

          <View style={[styles.anonymousBadge, { backgroundColor: colors.success + '20' }]}>
            <Shield size={14} color={colors.success} strokeWidth={1.5} />
            <Text style={{ color: colors.success, marginLeft: 4, fontWeight: '500' }}>
              Anonymous User
            </Text>
          </View>

          <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
            Member since {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}
          </Text>

          {user?.bio && (
            <Text style={{ color: colors.text, textAlign: 'center', marginTop: 12, lineHeight: 20 }}>
              {user.bio}
            </Text>
          )}

          <Button
            onPress={() => router.push('/profile/edit')}
            style={styles.editButton}
            leftIcon={<Edit3 size={16} color={colors.primary} strokeWidth={1.5} />}
          >
            Edit Profile
          </Button>
        </View>

        {/* Anonymous Stats */}
        <View style={styles.statsSection}>
          <StatCard
            title="Reviews"
            value={user?.reviewCount || 0}
            icon={<Star size={20} color={colors.primary} strokeWidth={1.5} />}
          />
          <StatCard
            title="Helpful Votes"
            value={user?.helpfulVotes || 0}
            icon={<Heart size={20} color={colors.primary} strokeWidth={1.5} />}
          />
          <StatCard
            title="Reputation"
            value={user?.reputationScore || 0}
            icon={<Trophy size={20} color={colors.primary} strokeWidth={1.5} />}
          />
        </View>

        {/* Reputation System */}
        <View style={[styles.reputationContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Anonymous Reputation
          </Text>

          <View style={[styles.reputationCard, { backgroundColor: colors.background }]}>
            <View style={styles.reputationHeader}>
              <Trophy size={20} color="#FFD700" strokeWidth={1.5} />
              <Text style={[styles.reputationScore, { color: colors.text }]}>
                {user?.reputationScore || 0} points
              </Text>
            </View>

            <View style={styles.reputationProgress}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(((user?.reputationScore || 0) % 100), 100)}%`,
                      backgroundColor: colors.primary
                    }
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {100 - ((user?.reputationScore || 0) % 100)} points to next level
              </Text>
            </View>

            {user?.badges && user.badges.length > 0 && (
              <View style={styles.reputationBadges}>
                {user.badges.map((badge, index) => (
                  <View key={index} style={[styles.badge, { backgroundColor: colors.surface }]}>
                    <Award size={16} color={badge.color || colors.primary} strokeWidth={1.5} />
                    <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{badge.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
          <View style={styles.tabsWrapper}>
            {tabs.map((tab, index) => {
              let Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => handleTabPress(tab.id, index)}
                  style={styles.tab}
                >
                  <Icon
                    size={16}
                    color={isActive ? colors.primary : colors.textSecondary}
                    strokeWidth={1.5}
                  />
                  <Text
                    style={{
                      color: isActive ? colors.primary : colors.textSecondary,
                      marginLeft: 6,
                      fontWeight: isActive ? "500" : "normal"
                    }}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                backgroundColor: colors.primary,
                transform: [
                  {
                    translateX: tabIndicatorAnim.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: [0, screenWidth / 3, (screenWidth / 3) * 2],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>

        {/* Tab Content */}
        <View style={styles.tabContentContainer}>
          {renderTabContent()}
        </View>

        {/* Sign Out Button */}
        <Button
          onPress={handleSignOut}
          style={styles.signOutButton}
          leftIcon={<LogOut size={16} color={colors.error} strokeWidth={1.5} />}
        >
          Sign Out
        </Button>
      </ScrollView>

      {/* Username Edit Modal */}
      <Modal
        visible={isEditingUsername}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditingUsername(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setIsEditingUsername(false)}>
              <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose New Identity</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.usernameOptionsContainer}>
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Select a new anonymous username from the options below:
            </Text>

            {usernameOptions.map((username, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.usernameOptionItem, { backgroundColor: colors.surface }]}
                onPress={() => handleUsernameUpdate(username)}
              >
                <Text style={[styles.usernameOptionText, { color: colors.text }]}>{username}</Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.regenerateButton, { borderColor: colors.primary }]}
              onPress={regenerateUsernames}
              disabled={isGeneratingUsernames}
            >
              {isGeneratingUsernames ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <RefreshCw size={20} color={colors.primary} />
              )}
              <Text style={[styles.regenerateText, { color: colors.primary }]}>
                {isGeneratingUsernames ? 'Generating...' : 'Generate New Options'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  aboutContent: {
    flex: 1,
  },
  aboutSection: {
    marginBottom: 16,
    padding: 16,
  },
  aboutTitle: {
    marginBottom: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  activityItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingVertical: 16,
  },
  activityList: {
    flex: 1,
  },
  avatar: {
    marginBottom: 16,
  },
  container: {
    flex: 1,
  },
  detailItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  detailsList: {
    gap: 12,
  },
  editButton: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 200,
    padding: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  preferenceItem: {
    gap: 4,
  },
  preferencesList: {
    gap: 16,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  statCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    padding: 16,
  },
  statIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginBottom: 8,
    width: 40,
  },
  statTitle: {
    textAlign: 'center',
  },
  statValue: {
    marginBottom: 4,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabContent: {
    padding: 16,
  },
  tabContentContainer: {
    flex: 1,
    minHeight: 300,
  },
  tabIndicator: {
    bottom: 0,
    height: 2,
    position: 'absolute',
    width: screenWidth / 3,
  },
  tabsContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  tabsWrapper: {
    flexDirection: 'row',
  },
  username: {
    marginBottom: 4,
    textAlign: 'center',
  },
  // Anonymous profile styles
  anonymousAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
  usernameContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  usernameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anonymousBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  usernameOptionsContainer: {
    padding: 20,
  },
  usernameOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  usernameOptionText: {
    fontSize: 18,
    fontWeight: '500',
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 16,
    borderWidth: 2,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  regenerateText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  // Reputation system styles
  reputationContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  reputationCard: {
    padding: 16,
    borderRadius: 8,
  },
  reputationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reputationScore: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  reputationProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
  },
  reputationBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    marginLeft: 4,
    fontSize: 12,
  },
  // Settings styles
  settingsGroup: {
    // Settings group styles
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingContent: {
    flex: 1,
  },
  featuresList: {
    // Features list styles
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
