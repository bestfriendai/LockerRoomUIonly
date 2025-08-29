import React, { useState, useCallback, useMemo, useRef } from "react";
import { View, StyleSheet, ScrollView, Pressable, RefreshControl, Animated, Dimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Star, Activity, User, MessageCircle, Heart, Eye, Calendar, MapPin, Flag, Share, MoreVertical, UserPlus, UserMinus } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import Text from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import { ReviewCard } from "@/components/ReviewCard";
import { mockReviews, mockUsers } from "@/data/mockData";
import type { Review, User as UserType } from "@/types";

const { width: screenWidth } = Dimensions.get('window');

type ProfileTab = 'reviews' | 'activity' | 'about';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  onPress?: () => void;
}

const StatCard = ({ title, value, subtitle, icon, onPress }: StatCardProps) => {
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
        <Text variant="h3" weight="normal" style={styles.statValue}>
          {value}
        </Text>
        <Text variant="bodySmall" weight="normal" style={styles.statTitle}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" style={{ color: colors.textSecondary, textAlign: 'center' }}>
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
      <Text variant="h3" weight="normal" style={styles.statValue}>
        {value}
      </Text>
      <Text variant="bodySmall" weight="normal" style={styles.statTitle}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="caption" style={{ color: colors.textSecondary, textAlign: 'center' }}>
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
  metadata?: any;
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
        return <User size={16} color={colors.success} strokeWidth={1.5} />;
      default:
        return <Activity size={16} color={colors.textSecondary} strokeWidth={1.5} />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
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
        <Text variant="body" weight="normal">
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
          {description}
        </Text>
        <Text variant="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>
          {formatTime(timestamp)}
        </Text>
      </View>
    </View>
  );
};

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, tokens, isDark } = useTheme();
  const { user: currentUser } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  // State
  const [activeTab, setActiveTab] = useState<ProfileTab>('reviews');
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Find the user
  const user = useMemo(() => {
    return mockUsers.find(u => u._id === id);
  }, [id]);

  // Mock data
  const userReviews = useMemo(() => {
    return mockReviews.filter(review => review.reviewerId === user?._id);
  }, [user?._id]);

  const receivedReviews = useMemo(() => {
    return mockReviews.filter(review => review.revieweeId === user?._id);
  }, [user?._id]);

  const mockActivities: ActivityItemProps[] = [
    {
      type: 'review_given',
      title: 'Reviewed Sarah Johnson',
      description: 'Left a 5-star review for great communication',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      type: 'review_received',
      title: 'Received review from Mike Chen',
      description: 'Got a 4-star review for professional behavior',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      type: 'room_joined',
      title: 'Joined "Dating Tips & Advice"',
      description: 'Started participating in community discussions',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      type: 'profile_updated',
      title: 'Updated profile information',
      description: 'Added new bio and profile picture',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const tabs = [
    { id: 'reviews' as ProfileTab, label: 'Reviews', icon: Star },
    { id: 'activity' as ProfileTab, label: 'Activity', icon: Activity },
    { id: 'about' as ProfileTab, label: 'About', icon: User },
  ];

  // Calculate stats
  const stats = useMemo(() => {
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
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

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

  const handleMessage = useCallback(() => {
    if (!user) return;
    // Navigate to create a new chat or existing chat
    router.push(`/chat/new?userId=${user._id}`);
  }, [router, user]);

  const handleFollow = useCallback(() => {
    setIsFollowing(!isFollowing);
    // Simulate API call
    console.log(isFollowing ? 'Unfollowed' : 'Followed', user?.username);
  }, [isFollowing, user]);

  const handleShare = useCallback(() => {
    // Implement share functionality
    console.log('Share profile', user?.username);
  }, [user]);

  const handleReport = useCallback(() => {
    Alert.alert(
      'Report User',
      'Why are you reporting this user?',
      [
        { text: 'Inappropriate content', onPress: () => console.log('Report: Inappropriate content') },
        { text: 'Spam or fake account', onPress: () => console.log('Report: Spam') },
        { text: 'Harassment', onPress: () => console.log('Report: Harassment') },
        { text: 'Other', onPress: () => console.log('Report: Other') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const handleMoreOptions = useCallback(() => {
    Alert.alert(
      'More Options',
      'Choose an action',
      [
        { text: 'Share Profile', onPress: handleShare },
        { text: 'Report User', onPress: handleReport, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [handleShare, handleReport]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'reviews':
        const allReviews = [...userReviews, ...receivedReviews].sort(
          (a, b) => new Date(b._creationTime || b.createdAt).getTime() - new Date(a._creationTime || a.createdAt).getTime()
        );
        
        if (allReviews.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Star size={48} color={colors.textSecondary} strokeWidth={1} />
              <Text variant="h3" weight="medium" style={{ marginTop: 16, textAlign: 'center' }}>
                No Reviews Yet
              </Text>
              <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
                This user hasn't given or received any reviews yet.
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
                onPress={() => router.push(`/review/${item._id}`)}
              />
            )}
            estimatedItemSize={200}
            contentContainerStyle={styles.tabContent}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item._id || item.id}
          />
        );

      case 'activity':
        if (mockActivities.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Activity size={48} color={colors.textSecondary} strokeWidth={1} />
              <Text variant="h3" weight="medium" style={{ marginTop: 16, textAlign: 'center' }}>
                No Activity Yet
              </Text>
              <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
                This user's recent activities will appear here.
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
            {mockActivities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </ScrollView>
        );

      case 'about':
        return (
          <ScrollView
            style={styles.aboutContent}
            contentContainerStyle={styles.tabContent}
            showsVerticalScrollIndicator={false}
          >
            <Card style={styles.aboutSection}>
              <Text variant="body" weight="medium" style={styles.aboutTitle}>
                Bio
              </Text>
              <Text variant="body" style={{ color: colors.text, lineHeight: 22 }}>
                {user?.bio || 'No bio available.'}
              </Text>
            </Card>

            <Card style={styles.aboutSection}>
              <Text variant="body" weight="medium" style={styles.aboutTitle}>
                Details
              </Text>
              <View style={styles.detailsList}>
                {user?.age && (
                  <View style={styles.detailItem}>
                    <Calendar size={16} color={colors.textSecondary} strokeWidth={1.5} />
                    <Text variant="body" style={{ marginLeft: 12 }}>
                      {user.age} years old
                    </Text>
                  </View>
                )}
                {user?.location && (
                  <View style={styles.detailItem}>
                    <MapPin size={16} color={colors.textSecondary} strokeWidth={1.5} />
                    <Text variant="body" style={{ marginLeft: 12 }}>
                      {user.location}
                    </Text>
                  </View>
                )}
                <View style={styles.detailItem}>
                  <User size={16} color={colors.textSecondary} strokeWidth={1.5} />
                  <Text variant="body" style={{ marginLeft: 12 }}>
                    Member since {new Date(user?._creationTime || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            </Card>

            {user?.datingPreferences && (
              <Card style={styles.aboutSection}>
                <Text variant="body" weight="medium" style={styles.aboutTitle}>
                  Preferences
                </Text>
                <View style={styles.preferencesList}>
                  {user.datingPreferences.ageRange && (
                    <View style={styles.preferenceItem}>
                      <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                        Age Range
                      </Text>
                      <Text variant="body">
                        {user.datingPreferences.ageRange.min} - {user.datingPreferences.ageRange.max} years
                      </Text>
                    </View>
                  )}
                  {user.datingPreferences.gender && (
                    <View style={styles.preferenceItem}>
                      <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                        Looking for
                      </Text>
                      <Text variant="body" style={{ textTransform: 'capitalize' }}>
                        {user.datingPreferences.gender}
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            )}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Button
            variant="ghost"
            size="sm"
            onPress={handleBack}
            leftIcon={<ArrowLeft size={20} color={colors.text} strokeWidth={1.5} />}
          />
        </View>
        <View style={styles.emptyState}>
          <User size={48} color={colors.textSecondary} strokeWidth={1} />
          <Text variant="h3" weight="medium" style={{ marginTop: 16, textAlign: 'center' }}>
            User Not Found
          </Text>
          <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            This user doesn't exist or has been deleted.
          </Text>
          <Button
            onPress={handleBack}
            style={{ marginTop: 24 }}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnProfile = currentUser?._id === user._id;

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
          <Button
            variant="ghost"
            size="sm"
            onPress={handleBack}
            leftIcon={<ArrowLeft size={20} color={colors.text} strokeWidth={1.5} />}
          />
          <Button
            variant="ghost"
            size="sm"
            onPress={handleMoreOptions}
            leftIcon={<MoreVertical size={20} color={colors.text} strokeWidth={1.5} />}
          />
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Avatar
            size="xl"
            name={user.username}
            src={user.profilePicture}
            style={styles.avatar}
          />
          <Text variant="h2" weight="bold" style={styles.username}>
            {user.displayName || user.username}
          </Text>
          {user.displayName && (
            <Text variant="body" style={{ color: colors.textSecondary }}>
              @{user.username}
            </Text>
          )}
          {user.bio && (
            <Text variant="body" style={{ color: colors.text, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
              {user.bio}
            </Text>
          )}
          
          {!isOwnProfile && (
            <View style={styles.actionButtons}>
              <Button
                variant="primary"
                onPress={handleMessage}
                style={styles.actionButton}
                leftIcon={<MessageCircle size={16} color={colors.background} strokeWidth={1.5} />}
              >
                Message
              </Button>
              <Button
                variant={isFollowing ? "outline" : "secondary"}
                onPress={handleFollow}
                style={styles.actionButton}
                leftIcon={
                  isFollowing 
                    ? <UserMinus size={16} color={colors.primary} strokeWidth={1.5} />
                    : <UserPlus size={16} color={colors.text} strokeWidth={1.5} />
                }
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <StatCard
            title="Reviews Given"
            value={stats.given}
            icon={<Star size={20} color={colors.primary} strokeWidth={1.5} />}
          />
          <StatCard
            title="Reviews Received"
            value={stats.received}
            icon={<Heart size={20} color={colors.error} strokeWidth={1.5} />}
          />
          <StatCard
            title="Average Rating"
            value={stats.rating > 0 ? stats.rating.toFixed(1) : '0.0'}
            subtitle="★"
            icon={<Star size={20} color={colors.warning} strokeWidth={1.5} />}
          />
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
          <View style={styles.tabsWrapper}>
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
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
                    variant="bodySmall"
                    weight={isActive ? "medium" : "normal"}
                    style={{
                      color: isActive ? colors.primary : colors.textSecondary,
                      marginLeft: 6
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
      </ScrollView>
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
  actionButton: {
    flex: 1,
    paddingHorizontal: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 200,
    padding: 32,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
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
});