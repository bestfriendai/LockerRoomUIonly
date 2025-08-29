import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, TextInput, Pressable, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, Plus, MessageCircle, Users, Lock, Globe, Crown, Clock, MoreVertical } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import Text from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import { mockChatRooms, mockUsers } from "@/data/mockData";
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

  const isOwner = room.createdBy === user?._id;
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
                  {formatTime(lastMessage.timestamp)}
                </Text>
              </View>
            )}
          </View>

          {lastMessage && (
            <View style={styles.lastMessageContent}>
              <Text variant="caption" style={{ color: colors.textSecondary }} numberOfLines={1}>
                <Text weight="medium">{lastMessage.senderName}: </Text>
                {lastMessage.content}
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
  const [joinedRooms, setJoinedRooms] = useState<Set<string>>(new Set([
    'room1', 'room2', 'room3' // Mock joined rooms
  ]));

  const tabs = [
    { id: 'all' as ChatTab, label: 'All Rooms', icon: Globe },
    { id: 'joined' as ChatTab, label: 'Joined', icon: MessageCircle },
    { id: 'my_rooms' as ChatTab, label: 'My Rooms', icon: Crown },
  ];

  // Filter and search rooms
  const filteredRooms = useMemo(() => {
    let rooms = mockChatRooms;

    // Filter by tab
    switch (activeTab) {
      case 'joined':
        rooms = rooms.filter(room => joinedRooms.has(room._id));
        break;
      case 'my_rooms':
        rooms = rooms.filter(room => room.createdBy === user?._id);
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
        room.name.toLowerCase().includes(query) ||
        room.description?.toLowerCase().includes(query)
      );
    }

    // Sort by last activity
    return rooms.sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || a._creationTime;
      const bTime = b.lastMessage?.timestamp || b._creationTime;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [activeTab, searchQuery, joinedRooms, user?._id]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleRoomPress = useCallback((room: ChatRoom) => {
    router.push(`/chat/${room._id}`);
  }, [router]);

  const handleJoinRoom = useCallback((roomId: string) => {
    setJoinedRooms(prev => new Set([...prev, roomId]));
    // Simulate API call
    Alert.alert('Success', 'You have joined the room!');
  }, []);

  const handleLeaveRoom = useCallback((roomId: string) => {
    setJoinedRooms(prev => {
      const newSet = new Set(prev);
      newSet.delete(roomId);
      return newSet;
    });
    // Simulate API call
    Alert.alert('Success', 'You have left the room.');
  }, []);

  const handleCreateRoom = useCallback(() => {
    Alert.alert(
      'Create Room',
      'Room creation feature coming soon!',
      [{ text: 'OK' }]
    );
  }, []);

  const renderRoomItem = ({ item }: { item: ChatRoom }) => {
    const isJoined = joinedRooms.has(item._id);
    const isMember = isJoined || item.createdBy === user?._id;

    return (
      <ChatRoomItem
        room={item}
        onPress={() => handleRoomPress(item)}
        onJoin={() => handleJoinRoom(item._id)}
        onLeave={() => handleLeaveRoom(item._id)}
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
          keyExtractor={(item) => item._id}
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
  joinButton: {
    paddingHorizontal: 16,
  },
  lastMessage: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  lastMessageContent: {
    marginTop: 4,
  },
  leaveButton: {
    paddingHorizontal: 16,
  },
  listContainer: {
    padding: 16,
  },
  memberCount: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  moreButton: {
    padding: 4,
  },
  roomActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  roomHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  roomIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    marginRight: 8,
    width: 24,
  },
  roomInfo: {
    flex: 1,
  },
  roomItem: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    overflow: 'hidden',
  },
  roomMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  roomName: {
    flex: 1,
    marginRight: 8,
  },
  roomTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  searchBar: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  tab: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabsContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
});