import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform, TextInput, Alert, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Send, MoreVertical, Users, Settings, UserPlus, UserMinus, Flag, Smile, Paperclip, Image as ImageIcon, Camera } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import Text from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import { mockChatRooms, mockUsers, mockChatMessages } from "@/data/mockData";
import type { ChatRoom, ChatMessage, User } from "@/types";

const { width: screenWidth } = Dimensions.get('window');

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
}

const MessageBubble = ({ message, isOwn, showAvatar, showTimestamp }: MessageBubbleProps) => {
  const { colors } = useTheme();
  const sender = mockUsers.find(u => u._id === message.senderId);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <View style={[
      styles.messageContainer,
      isOwn ? styles.ownMessageContainer : styles.otherMessageContainer
    ]}>
      {!isOwn && showAvatar && (
        <Avatar
          size="sm"
          name={sender?.username || 'Unknown'}
          imageUrl={sender?.profilePicture}
          style={styles.messageAvatar}
        />
      )}
      {!isOwn && !showAvatar && (
        <View style={styles.messageAvatarSpacer} />
      )}
      
      <View style={[
        styles.messageBubble,
        {
          backgroundColor: isOwn ? colors.primary : colors.card,
          borderColor: colors.border,
        }
      ]}>
        {!isOwn && showAvatar && (
          <Text variant="caption" weight="normal" style={{
            color: colors.textSecondary,
            marginBottom: 4
          }}>
            {sender?.displayName || sender?.username || 'Unknown'}
          </Text>
        )}
        
        <Text variant="body" style={{
          color: isOwn ? colors.background : colors.text,
          lineHeight: 20
        }}>
          {message.content}
        </Text>
        
        {showTimestamp && (
          <Text variant="caption" style={{
            color: isOwn ? colors.background + '80' : colors.textSecondary,
            marginTop: 4,
            alignSelf: isOwn ? 'flex-end' : 'flex-start'
          }}>
            {formatTime(message._creationTime)}
          </Text>
        )}
      </View>
    </View>
  );
};

interface ChatHeaderProps {
  room: ChatRoom;
  onBack: () => void;
  onMoreOptions: () => void;
}

const ChatHeader = ({ room, onBack, onMoreOptions }: ChatHeaderProps) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.headerLeft}>
        <Button
          variant="ghost"
          size="sm"
          onPress={onBack}
          leftIcon={<ArrowLeft size={20} color={colors.text} strokeWidth={1.5} />}
        />
        <View style={styles.headerInfo}>
          <Text variant="body" weight="normal" numberOfLines={1}>
            {room.name}
          </Text>
          <View style={styles.headerSubInfo}>
            <Users size={12} color={colors.textSecondary} strokeWidth={1.5} />
            <Text variant="caption" style={{ color: colors.textSecondary, marginLeft: 4 }}>
              {room.memberCount} members
            </Text>
            {room.isActive && (
              <>
                <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
                <Text variant="caption" style={{ color: colors.success }}>
                  Active
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
      
      <Button
        variant="ghost"
        size="sm"
        onPress={onMoreOptions}
        leftIcon={<MoreVertical size={20} color={colors.text} strokeWidth={1.5} />}
      />
    </View>
  );
};

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttachment: () => void;
  disabled?: boolean;
}

const MessageInput = ({ value, onChangeText, onSend, onAttachment, disabled }: MessageInputProps) => {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);

  const handleSend = useCallback(() => {
    if (value.trim() && !disabled) {
      onSend();
    }
  }, [value, onSend, disabled]);

  return (
    <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Button
          variant="ghost"
          size="sm"
          onPress={onAttachment}
          leftIcon={<Paperclip size={18} color={colors.textSecondary} strokeWidth={1.5} />}
          disabled={disabled}
        />
        
        <TextInput
          ref={inputRef}
          style={[styles.textInput, { color: colors.text }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={1000}
          editable={!disabled}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        
        <Button
          variant="ghost"
          size="sm"
          onPress={handleSend}
          leftIcon={<Send size={18} color={value.trim() ? colors.primary : colors.textSecondary} strokeWidth={1.5} />}
          disabled={!value.trim() || disabled}
        />
      </View>
    </View>
  );
};

export default function ChatRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const scrollViewRef = useRef<FlashList<any>>(null);

  // State
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Find the chat room
  const room = useMemo(() => {
    return mockChatRooms.find(r => r._id === id);
  }, [id]);

  // Load messages
  useEffect(() => {
    if (room) {
      setIsLoading(true);
      // Simulate loading messages
      setTimeout(() => {
        const roomMessages = mockChatMessages.filter((m: ChatMessage) => m.chatRoomId === room._id)
          .sort((a: ChatMessage, b: ChatMessage) => new Date(a._creationTime).getTime() - new Date(b._creationTime).getTime());
        setMessages(roomMessages);
        setIsLoading(false);
        
        // Scroll to bottom after messages load
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1000);
    }
  }, [room]);

  // Handlers
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleMoreOptions = useCallback(() => {
    Alert.alert(
      'Room Options',
      'Choose an action',
      [
        { text: 'Room Info', onPress: () => console.log('Room info') },
        { text: 'Members', onPress: () => console.log('View members') },
        { text: 'Settings', onPress: () => console.log('Room settings') },
        { text: 'Leave Room', onPress: () => console.log('Leave room'), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !user || !room || isSending) return;

    const newMessage: ChatMessage = {
      _id: `msg_${Date.now()}`,
      _creationTime: new Date().toISOString(),
      chatRoomId: room._id,
      senderId: user._id || user.id,
      content: messageText.trim(),
      type: 'text',
      read: false,
    };

    setIsSending(true);
    setMessageText('');
    
    // Optimistically add message
    setMessages(prev => [...prev, newMessage]);
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Message sent:', newMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove message on error
      setMessages(prev => prev.filter(m => m._id !== newMessage._id));
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [messageText, user, room, isSending]);

  const handleAttachment = useCallback(() => {
    Alert.alert(
      'Add Attachment',
      'Choose attachment type',
      [
        { text: 'Camera', onPress: () => console.log('Open camera') },
        { text: 'Photo Library', onPress: () => console.log('Open photo library') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  // Process messages for display
  const processedMessages = useMemo(() => {
    return messages.map((message, index) => {
      const prevMessage = index > 0 ? messages[index - 1] : null;
      const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
      
      const isOwn = message.senderId === user?._id;
      const showAvatar = !isOwn && (!nextMessage || nextMessage.senderId !== message.senderId);
      const showTimestamp = !nextMessage || 
        nextMessage.senderId !== message.senderId ||
        (new Date(nextMessage._creationTime).getTime() - new Date(message._creationTime).getTime()) > 300000; // 5 minutes
      
      return {
        ...message,
        isOwn,
        showAvatar,
        showTimestamp,
      };
    });
  }, [messages, user?._id]);

  if (!room) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text variant="h3" weight="normal" style={{ textAlign: 'center' }}>
            Room Not Found
          </Text>
          <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            This chat room doesn't exist or has been deleted.
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <ChatHeader
          room={room}
          onBack={handleBack}
          onMoreOptions={handleMoreOptions}
        />

        {/* Messages */}
        <View style={styles.messagesContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center' }}>
                Loading messages...
              </Text>
            </View>
          ) : processedMessages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="h3" weight="normal" style={{ textAlign: 'center' }}>
                No Messages Yet
              </Text>
              <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
                Be the first to start the conversation!
              </Text>
            </View>
          ) : (
            <FlashList
              ref={scrollViewRef}
              data={processedMessages}
              renderItem={({ item }) => (
                <MessageBubble
                  message={item}
                  isOwn={item.isOwn}
                  showAvatar={item.showAvatar}
                  showTimestamp={item.showTimestamp}
                />
              )}
              estimatedItemSize={80}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10,
              }}
            />
          )}
        </View>

        {/* Message Input */}
        <MessageInput
          value={messageText}
          onChangeText={setMessageText}
          onSend={handleSendMessage}
          onAttachment={handleAttachment}
          disabled={isSending}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  activeDot: {
    borderRadius: 3,
    height: 6,
    marginLeft: 8,
    marginRight: 4,
    width: 6,
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  headerSubInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 2,
  },
  inputContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 44,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  keyboardContainer: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  messageAvatar: {
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  messageAvatarSpacer: {
    marginRight: 8,
    width: 40,
  },
  messageBubble: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: screenWidth * 0.75,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});