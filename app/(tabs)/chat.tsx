import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
  RefreshControl,
  Text,
} from 'react-native';

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, Plus, MessageCircle, Users, Lock, Globe, Crown, Clock, MoreVertical } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "../../providers/ThemeProvider";
import { useAuth } from "../../providers/AuthProvider";
import { ModernButton } from "../../components/ui/ModernButton";
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, query, where } from "firebase/firestore";
import { db } from "../../utils/firebase";
import type { ChatRoom } from "../../types/index";
import { toMillis, formatRelativeTime } from "../../utils/timestampHelpers";
import { createTypographyStyles } from "../../styles/typography";
import { EmptyState } from "../../components/EmptyState";
import { ChatRoomSkeleton } from "../../components/ui/LoadingSkeletons";
import { SHADOWS, BORDER_RADIUS } from "../../constants/shadows";

type ChatTab = 'all' | 'my_rooms' | 'joined';

interface ChatRoomItemProps {
  room: ChatRoom;
  onPress: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  isJoined: boolean;
  isMember: boolean;
}

const ChatRoomItem = React.memo(({ room, onPress, onJoin, onLeave, isJoined, isMember }: ChatRoomItemProps) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const typography = createTypographyStyles(colors);

  const isOwner = room.createdBy === user?.id;
  const memberCount = room.participants?.length || room.memberIds?.length || 0;
  const lastMessage = room.lastMessage;
  const isPrivate = room.type === 'private';

  const formatTime = (timestamp: unknown) => {
    if (!timestamp) return '';
    return formatRelativeTime(timestamp);
  };

  const handleJoinPress = () => {
    if (isJoined && onLeave) {
      Alert.alert(
        'Leave Room',
        'Are you sure you want to leave this room?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: onLeave }
        ]
      );
    } else if (onJoin) {
      onJoin();
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.roomItem,
        {
          backgroundColor: pressed ? colors.surfaceElevated : colors.card,
          borderColor: colors.border,
        },
        SHADOWS.sm
      ]}
    >
      <View style={styles.roomHeader}>
        <View style={styles.roomInfo}>
          <View style={styles.roomTitleRow}>
            <View style={[styles.roomIcon, { backgroundColor: colors.primary }]}>
              <MessageCircle size={16} color={colors.surface} strokeWidth={1.5} />
            </View>
            <Text style={typography.h2}>
              {room.name}
            </Text>
            {isPrivate && (
              <Lock size={14} color={colors.textSecondary} strokeWidth={1.5} />
            )}
            {isOwner && (
              <Crown size={14} color={colors.warning} strokeWidth={1.5} />
            )}
          </View>
          
          {room.description && (
            <Text style={[typography.body, { marginTop: 2 }]}
              numberOfLines={2}
            >
              {room.description}
            </Text>
          )}

          <View style={styles.roomMeta}>
            <View style={styles.memberCount}>
              <Users size={12} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={[typography.caption, { marginLeft: 4 }]}>
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </Text>
            </View>
            
            {lastMessage && (
              <View style={styles.lastMessage}>
                <Clock size={12} color={colors.textSecondary} strokeWidth={1.5} />
                <Text style={[typography.caption, { marginLeft: 4 }]}>
                  {typeof lastMessage === 'string'
                    ? formatTime(room.lastMessageTime)
                    : formatTime(lastMessage.timestamp)
                  }
                </Text>
              </View>
            )}
          </View>

          {lastMessage && (
            <View style={styles.lastMessageContent}>
              <Text style={typography.body} numberOfLines={1}>
                {typeof lastMessage === 'string' ? (
                  lastMessage
                ) : (
                  <>
                    <Text style={typography.body}>{lastMessage.senderName || 'Unknown'}: </Text>
                    {lastMessage.content}
                  </>
                )}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.roomActions}>
          {!isMember && (
            <ModernButton
              variant="gradient"
              size="sm"
              onPress={handleJoinPress}
              style={styles.joinButton}
            >
              Join
            </ModernButton>
          )}
          {isMember && !isOwner && (
            <ModernButton
              variant="outline"
              size="sm"
              onPress={handleJoinPress}
              style={styles.leaveButton}
              textStyle={{ color: colors.error }}
            >
              Leave
            </ModernButton>
          )}
          <Pressable style={[styles.moreButton, { backgroundColor: colors.surface }, SHADOWS.sm]}>
            <MoreVertical size={16} color={colors.textSecondary} strokeWidth={1.5} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
});

ChatRoomItem.displayName = 'ChatRoomItem';

export default function ChatScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const typography = createTypographyStyles(colors);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ChatTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  const tabs = [
    { id: 'all' as ChatTab, label: 'All Rooms', icon: Globe },
    { id: 'joined' as ChatTab, label: 'Joined', icon: MessageCircle },
    { id: 'my_rooms' as ChatTab, label: 'My Rooms', icon: Crown },
  ];

  useEffect(() => {
    fetchChatRooms();
  }, [user?.id]);

  const fetchChatRooms = async () => {
    setRefreshing(true);
    try {
      // Check if user is authenticated before making Firestore query
      if (!user?.id) {
        if (__DEV__) {
          __DEV__ && console.log("User not authenticated, skipping chat rooms fetch");
        }
        setChatRooms([]);
        return;
      }

      if (__DEV__) {
        __DEV__ && console.log("Fetching chat rooms for user:", user.id);
      }

      const roomsCollection = collection(db, "chatRooms");
      
      // First, try to get all public rooms to see if there's any data
      if (__DEV__) {
        __DEV__ && console.log("Querying for public rooms...");
      }
      
      const publicQuery = query(
        roomsCollection,
        where("isPublic", "==", true)
      );
      
      const publicSnapshot = await getDocs(publicQuery);
      
      if (__DEV__) {
        __DEV__ && console.log(`Found ${publicSnapshot.size} public rooms`);
      }
      
      // Query for rooms where user is a participant
      if (__DEV__) {
        __DEV__ && console.log("Querying for participant rooms...");
      }
      
      const participantQuery = query(
        roomsCollection,
        where("participants", "array-contains", user.id)
      );
      
      const participantSnapshot = await getDocs(participantQuery);
      
      if (__DEV__) {
        __DEV__ && console.log(`Found ${participantSnapshot.size} participant rooms`);
      }
      
      // Combine results and remove duplicates
      const participantRooms = participantSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        _id: doc.id, 
        ...doc.data() 
      } as ChatRoom));
      const publicRooms = publicSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        _id: doc.id, 
        ...doc.data() 
      } as ChatRoom));
      
      // Remove duplicates by room ID
      const allRooms = [...participantRooms];
      publicRooms.forEach(room => {
        if (!allRooms.find(existingRoom => existingRoom._id === room._id)) {
          allRooms.push(room);
        }
      });
      
      if (__DEV__) {
        __DEV__ && console.log(`Total rooms after deduplication: ${allRooms.length}`);
      }
      
      setChatRooms(allRooms);
      
      // If no rooms found, let's create some test data
      if (allRooms.length === 0) {
        if (__DEV__) {
          __DEV__ && console.log("No chat rooms found. Consider creating test data.");
        }
      }
      
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error("Error fetching chat rooms: ", error);
        const errorObj = error as any;
        __DEV__ && console.error("Error details:", {
          name: errorObj?.name,
          message: errorObj?.message,
          code: errorObj?.code,
          stack: errorObj?.stack
        });
      }
      Alert.alert("Error", "Could not fetch chat rooms. Please check your connection and try again.");
    } finally {
      setRefreshing(false);
      setIsInitialLoading(false);
    }
  };

  // Filter and search rooms
  const filteredRooms = useMemo(() => {
    let rooms = chatRooms;

    // Filter by tab
    switch (activeTab) {
      case 'joined':
        rooms = rooms.filter(room => 
          room.participants?.includes(user?.id || '') || 
          room.memberIds?.includes(user?.id || '')
        );
        break;
      case 'my_rooms':
        rooms = rooms.filter(room => room.createdBy === user?.id);
        break;
      case 'all':
      default:
        // Show all rooms
        break;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      rooms = rooms.filter(room =>
        room.name?.toLowerCase().includes(query) ||
        room.description?.toLowerCase().includes(query)
      );
    }

    // Sort by last activity
    return rooms.sort((a, b) => {
      const aTime = (typeof a.lastMessage === 'object' && a.lastMessage?.timestamp) || a.lastMessageTime || a._creationTime;
      const bTime = (typeof b.lastMessage === 'object' && b.lastMessage?.timestamp) || b.lastMessageTime || b._creationTime;
      return toMillis(bTime) - toMillis(aTime);
    });
  }, [activeTab, searchQuery, chatRooms, user?.id]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    await fetchChatRooms();
  }, []);

  const handleRoomPress = useCallback((room: ChatRoom) => {
    router.push(`/chat/${room._id}`);
  }, [router]);

  const handleJoinRoom = useCallback(async (roomId: string) => {
    if (!user?.id) return;
    try {
      const roomRef = doc(db, "chatRooms", roomId);
      await updateDoc(roomRef, {
        participants: arrayUnion(user.id)
      });
      await fetchChatRooms();
      Alert.alert('Success', 'You have joined the room!');
    } catch (error) {
      __DEV__ && console.error('Error joining room:', error);
      Alert.alert('Error', 'Failed to join room');
      
      // Log error details for debugging
      const errorObj = error as any;
      __DEV__ && console.log('Join room error details:', {
        roomId,
        userId: user?.id,
        name: errorObj?.name,
        message: errorObj?.message,
        code: errorObj?.code,
        stack: errorObj?.stack
      });
    }
  }, [user?.id]);

  const handleLeaveRoom = useCallback(async (roomId: string) => {
    if (!user?.id) return;
    try {
      const roomRef = doc(db, "chatRooms", roomId);
      await updateDoc(roomRef, {
        participants: arrayRemove(user.id)
      });
      await fetchChatRooms();
      Alert.alert('Success', 'You have left the room.');
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error("Error leaving room: ", error);
      }
      Alert.alert('Error', 'Could not leave the room. Please try again.');
    }
  }, [user?.id]);

  const handleCreateRoom = useCallback(() => {
    Alert.alert(
      'Create Room',
      'Room creation feature coming soon!',
      [{ text: 'OK' }]
    );
  }, []);

  const renderRoomItem = useCallback(({ item }: { item: ChatRoom }) => {
    const userId = user?.id;
    if (!userId) return null;

    const isJoined = item.participants?.includes(userId) || item.memberIds?.includes(userId) || false;
    const isOwner = item.createdBy === userId;
    const isMember = isJoined || isOwner;

    return (
      <ChatRoomItem
        room={item}
        onPress={() => handleRoomPress(item)}
        onJoin={() => handleJoinRoom(item._id || item.id)}
        onLeave={() => handleLeaveRoom(item._id || item.id)}
        isJoined={isJoined}
        isMember={isMember}
      />
    );
  }, [user?.id, handleRoomPress, handleJoinRoom, handleLeaveRoom]);

  const keyExtractor = useCallback((item: ChatRoom) => item._id || item.id, []);

  const getItemType = useCallback((item: ChatRoom) => {
    // Group by room type for better recycling
    return item.type || 'default';
  }, []);

  const renderEmptyState = () => {
    // Determine the type of empty state based on context
    if (searchQuery.trim()) {
      return (
        <EmptyState 
          type="no-search-results"
          onClearFilters={() => setSearchQuery('')}
        />
      );
    }
    
    // For joined and my_rooms tabs, show no-matches type
    if (activeTab === 'joined' || activeTab === 'my_rooms') {
      return (
        <EmptyState
          type="no-matches"
        />
      );
    }
    
    // Default to no-reviews type for all rooms
    return (
      <EmptyState
        type="no-reviews"
        onCreateReview={handleCreateRoom}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modern Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }, SHADOWS.sm]}>
        <View style={styles.headerTop}>
          <Text style={typography.h1}>
            Chat Rooms
          </Text>
          <ModernButton
            variant="gradient"
            size="sm"
            onPress={handleCreateRoom}
            icon={<Plus size={18} color={colors.white} strokeWidth={1.5} />}
          >
            Create
          </ModernButton>
        </View>

        {/* Enhanced Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceElevated }, SHADOWS.sm]}>
          <Search size={20} color={colors.textSecondary} strokeWidth={1.5} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search rooms..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                isActive && { borderBottomColor: colors.primary }
              ]}
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
                  fontWeight: isActive ? "500" : "400",
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Room List */}
      {isInitialLoading ? (
        <View style={styles.listContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <ChatRoomSkeleton key={i} />
          ))}
        </View>
      ) : filteredRooms.length > 0 ? (
        <FlashList
          data={filteredRooms}
          renderItem={renderRoomItem}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          keyExtractor={keyExtractor}
          getItemType={getItemType}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  roomItem: {
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  roomHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roomInfo: {
    flex: 1,
    marginRight: 16,
  },
  roomTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  roomIcon: {
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
    height: 28,
    justifyContent: 'center',
    marginRight: 12,
    width: 28,
  },
  roomMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },
  memberCount: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  lastMessage: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 20,
  },
  lastMessageContent: {
    marginTop: 12,
  },
  roomActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  joinButton: {
    paddingHorizontal: 16,
  },
  leaveButton: {
    paddingHorizontal: 16,
  },
  moreButton: {
    padding: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  searchBar: {
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  tab: {
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
  },
});