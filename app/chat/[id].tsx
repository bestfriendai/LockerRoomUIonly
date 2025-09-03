import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import logger from '../../utils/logger';

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Send, MoreVertical, Users, Settings, UserPlus, UserMinus, Flag, Smile, Paperclip, Image as ImageIcon, Camera } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "../../providers/ThemeProvider";
import { useAuth } from "../../providers/AuthProvider";
import { Button } from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Card from "../../components/ui/Card";
import { useChat } from "../../providers/ChatProvider";
import type { ChatRoom, ChatMessage, User } from "../../types";

const { width: screenWidth } = Dimensions.get('window');

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
}

const MessageBubble = ({ message, isOwn, showAvatar, showTimestamp }: MessageBubbleProps) => {
  const { colors } = useTheme();
  const users: any[] = []; // Placeholder since users is optional in ChatContextType
  const sender = users.find((u: any) => u._id === message.senderId);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';

    // Handle Firestore Timestamp
    let date: Date;
    if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number' || typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      return '';
    }
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <View style={[
      (styles as any)?.messageContainer,
      isOwn ? styles.ownMessageContainer : styles.otherMessageContainer
    ]}>
      {!isOwn && showAvatar && (
        <Avatar
          size="sm"
          name={sender?.username || 'Unknown'}
          isAnonymous={true}
          style={(styles as any)?.messageAvatar}
        />
      )}
      {!isOwn && !showAvatar && (
        <View style={(styles as any)?.messageAvatarSpacer} />
      )}
      
      <View style={[
        (styles as any)?.messageBubble,
        {
          backgroundColor: isOwn ? colors.primary : colors.card,
          borderColor: colors.border,
        }
      ]}>
        {!isOwn && showAvatar && (
          <Text style={{
            color: colors.textSecondary,
            marginBottom: 4
          }}>
            {sender?.displayName || sender?.username || 'Unknown'}
          </Text>
        )}
        
        <Text style={{
          color: isOwn ? colors.background : colors.text,
          lineHeight: 20
        }}>
          {message.content}
        </Text>
        
        {showTimestamp && message._creationTime && (
          <Text style={{
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
          size="sm"
          onPress={onBack}
          leftIcon={<ArrowLeft size={20} color={colors.text} strokeWidth={1.5} />}
        />
        <View style={styles.headerInfo}>
          <Text numberOfLines={1}>
            {room.name}
          </Text>
          <View style={styles.headerSubInfo}>
            <Users size={12} color={colors.textSecondary} strokeWidth={1.5} />
            <Text style={{ color: colors.textSecondary, marginLeft: 4 }}>
              {room.memberCount} members
            </Text>
            {room.isActive && (
              <>
                <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
                <Text style={{ color: colors.success }}>
                  Active
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
      
      <Button
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
      // Dismiss keyboard after sending
      Keyboard.dismiss();
    }
  }, [value, onSend, disabled]);

  return (
    <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Button
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
  const { chatRooms, messages, sendMessage } = useChat();
  const isLoading = false; // Placeholder since isLoading is optional
  const scrollViewRef = useRef<FlashList<any>>(null);

  // State
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Find the chat room
  const room = useMemo(() => {
    return chatRooms.find(r => r._id === id);
  }, [chatRooms, id]);

  // Get messages for this room
  const roomMessages = useMemo(() => {
    if (!Array.isArray(messages)) return [];
    return messages.filter((m: any) => m.chatRoomId === id)
      .sort((a: any, b: any) => new Date(a._creationTime).getTime() - new Date(b._creationTime).getTime());
  }, [messages, id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (roomMessages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [roomMessages]);

  // Handlers
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleMoreOptions = useCallback(() => {
    Alert.alert(
      'Room Options',
      'Choose an action',
      [
        { text: 'Room Info', onPress: () => __DEV__ && console.log('Room info') },
        { text: 'Members', onPress: () => __DEV__ && console.log('View members') },
        { text: 'Settings', onPress: () => __DEV__ && console.log('Room settings') },
        { text: 'Leave Room', onPress: () => __DEV__ && console.log('Leave room'), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !user || !room || isSending) return;

    setIsSending(true);
    const content = messageText.trim();
    setMessageText('');

    try {
      await sendMessage(content);
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Failed to send message:', error);
      }
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setMessageText(content); // Restore message text on error
    } finally {
      setIsSending(false);
    }
  }, [messageText, user, room, isSending, sendMessage]);

  const handleAttachment = useCallback(() => {
    Alert.alert(
      'Add Attachment',
      'Choose attachment type',
      [
        { text: 'Camera', onPress: () => __DEV__ && console.log('Open camera') },
        { text: 'Photo Library', onPress: () => __DEV__ && console.log('Open photo library') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  // Process messages for display
  const processedMessages = useMemo(() => {
    return roomMessages.map((message: any, index: number) => {
      const prevMessage = index > 0 ? roomMessages[index - 1] : null;
      const nextMessage = index < roomMessages.length - 1 ? roomMessages[index + 1] : null;
      
      const isOwn = message.senderId === user?._id;
      const showAvatar = !isOwn && (!nextMessage || nextMessage.senderId !== message.senderId);
      const showTimestamp = !nextMessage ||
        nextMessage.senderId !== message.senderId ||
        (nextMessage._creationTime && message._creationTime &&
          (new Date(nextMessage._creationTime as any).getTime() - new Date(message._creationTime as any).getTime()) > 300000); // 5 minutes
      
      return {
        ...message,
        isOwn,
        showAvatar,
        showTimestamp,
      };
    });
  }, [roomMessages, user?._id]);

  if (!room) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={{ textAlign: 'center' }}>
            Room Not Found
          </Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={(styles as any)?.messagesContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                  Loading messages...
                </Text>
              </View>
            ) : processedMessages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={{ textAlign: 'center' }}>
                  No Messages Yet
                </Text>
                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
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
                contentContainerStyle={(styles as any)?.messagesList}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                maintainVisibleContentPosition={{
                  minIndexForVisible: 0,
                  autoscrollToTopThreshold: 10,
                }}
              />
            )}
          </View>
        </TouchableWithoutFeedback>

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