import React, { useState, useCallback, useMemo, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, Plus, MessageCircle, Users, Lock, Globe, Crown, Clock, MoreVertical } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import Text from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/utils/firebase";
import type { ChatRoom } from "@/types/index";

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

  const isOwner = room.createdBy === user?.id;
  const memberCount = room.memberIds?.length || 0;
  const lastMessage = room.lastMessage;
  const isPrivate = room.type === 'private';

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return `${Math.floor(diffInHours / 24)}d`;
    }
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
        }
      ]}
    >
      <View style={styles.roomHeader}>
        <View style={styles.roomInfo}>
          <View style={styles.roomTitleRow}>
            <View style={[styles.roomIcon, { backgroundColor: colors.primary }]}>
              <MessageCircle size={16} color={colors.surface} strokeWidth={1.5} />
            </View>
            <Text variant="body" weight="semibold" style={styles.roomName}>
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
            <Text
              variant="bodySmall"
              style={{ color: colors.textSecondary, marginTop: 2 }}
              numberOfLines={2}
            >
              {room.description}
            </Text>
          )}

          <View style={styles.roomMeta}>
            <View style={styles.memberCount}>
              <Users size={12} color={colors.textSecondary} strokeWidth={1.5} />
              <Text variant="caption" style={{ color: colors.textSecondary, marginLeft: 4 }}>
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </Text>
            </View>
            
            {lastMessage && (
              <View style={styles.lastMessage}>
                <Clock size={12} color={colors.textSecondary} strokeWidth={1.5} />
                <Text variant="caption" style={{ color: colors.textSecondary, marginLeft: 4 }}>
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
              <Text variant="caption" style={{ color: colors.textSecondary }} numberOfLines={1}>
                {typeof lastMessage === 'string' ? (
                  lastMessage
                ) : (
                  <>
                    <Text weight="medium">{lastMessage.senderName || 'Unknown'}: </Text>
                    {lastMessage.content}
                  </>
                )}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.roomActions}>
          {!isMember && (
            <Button
              variant="outline"
              size="sm"
              onPress={handleJoinPress}
              style={styles.joinButton}
            >
              Join
            </Button>
          )}
          {isMember && !isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onPress={handleJoinPress}
              style={styles.leaveButton}
            >
              Leave
            </Button>
          )}
          <Pressable style={styles.moreButton}>
            <MoreVertical size={16} color={colors.textSecondary} strokeWidth={1.5} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
});

export default function ChatScreen() {
  const router = useRouter();
  const { colors, tokens, isDark } = useTheme();
  const { user } = useAuth();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ChatTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  const tabs = [
    { id: 'all' as ChatTab, label: 'All Rooms', icon: Globe },
    { id: 'joined' as ChatTab, label: 'Joined', icon: MessageCircle },
    { id: 'my_rooms' as ChatTab, label: 'My Rooms', icon: Crown },
  ];

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    setRefreshing(true);
    try {
      const roomsCollection = collection(db, "chatRooms");
      const roomsSnapshot = await getDocs(roomsCollection);
      const roomsList = roomsSnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() } as ChatRoom));
      setChatRooms(roomsList);
    } catch (error) {
      console.error("Error fetching chat rooms: ", error);
      Alert.alert("Error", "Could not fetch chat rooms.");
    } finally {
      setRefreshing(false);
    }
  };

  // Filter and search rooms
  const filteredRooms = useMemo(() => {
    let rooms = chatRooms;

    // Filter by tab
    switch (activeTab) {
      case 'joined':
        rooms = rooms.filter(room => room.memberIds?.includes(user?.id || ''));
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
      return new Date(bTime).getTime() - new Date(aTime).getTime();
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
        memberIds: arrayUnion(user.id)
      });
      await fetchChatRooms();
      Alert.alert('Success', 'You have joined the room!');
    } catch (error) {
      console.error("Error joining room: ", error);
      Alert.alert('Error', 'Could not join the room. Please try again.');
    }
  }, [user?.id]);

  const handleLeaveRoom = useCallback(async (roomId: string) => {
    if (!user?.id) return;
    try {
      const roomRef = doc(db, "chatRooms", roomId);
      await updateDoc(roomRef, {
        memberIds: arrayRemove(user.id)
      });
      await fetchChatRooms();
      Alert.alert('Success', 'You have left the room.');
    } catch (error) {
      console.error("Error leaving room: ", error);
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

  const renderRoomItem = ({ item }: { item: ChatRoom }) => {
    const userId = user?.id;
    if (!userId) return null;

    const isJoined = item.memberIds?.includes(userId) || false;
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
  };

  const renderEmptyState = () => {
    let title = "No rooms found";
    let description = "Try adjusting your search or create a new room.";

    if (activeTab === 'joined') {
      title = "No joined rooms";
      description = "Join some rooms to start chatting with others.";
    } else if (activeTab === 'my_rooms') {
      title = "No rooms created";
      description = "Create your first room to start discussions.";
    } else if (searchQuery.trim()) {
      title = "No results found";
      description = `No rooms match "${searchQuery}".`;
    }

    return (
      <View style={styles.emptyState}>
        <MessageCircle size={48} color={colors.textSecondary} strokeWidth={1} />
        <Text variant="h3" weight="medium" style={{ marginTop: 16, textAlign: 'center' }}>
          {title}
        </Text>
        <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
          {description}
        </Text>
        {(activeTab === 'all' || activeTab === 'my_rooms') && (
          <Button
            onPress={handleCreateRoom}
            style={{ marginTop: 24 }}
            leftIcon={<Plus size={16} color={colors.surface} strokeWidth={1.5} />}
          >
            Create Room
          </Button>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text variant="h2" weight="bold">
            Chat Rooms
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onPress={handleCreateRoom}
            leftIcon={<Plus size={16} color={colors.primary} strokeWidth={1.5} />}
          >
            Create
          </Button>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceElevated }]}>
          <Search size={18} color={colors.textSecondary} strokeWidth={1.5} />
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

      {/* Room List */}
      {filteredRooms.length > 0 ? (
        <FlashList
          data={filteredRooms}
          renderItem={renderRoomItem}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item._id || item.id}
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
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  roomItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
  },
  roomHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roomInfo: {
    flex: 1,
    marginRight: 12,
  },
  roomTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  roomIcon: {
    alignItems: 'center',
    borderRadius: 99,
    height: 24,
    justifyContent: 'center',
    marginRight: 8,
    width: 24,
  },
  roomName: {
    flexShrink: 1,
    marginRight: 8,
  },
  roomMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  memberCount: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  lastMessage: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 16,
  },
  lastMessageContent: {
    marginTop: 8,
  },
  roomActions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  joinButton: {
    paddingHorizontal: 12,
  },
  leaveButton: {
    paddingHorizontal: 12,
  },
  moreButton: {
    marginLeft: 4,
    padding: 4,
  },
  searchBar: {
    alignItems: 'center',
    borderRadius: 99,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  tab: {
    alignItems: 'center',
    borderBottomWidth: 2,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});