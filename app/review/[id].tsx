import React, { useState, useCallback, useMemo, useRef } from "react";
import { View, StyleSheet, ScrollView, Pressable, RefreshControl, Alert, Share, Dimensions, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Star, Heart, MessageCircle, Share2, Flag, MoreVertical, ThumbsUp, ThumbsDown, Eye, Calendar, MapPin, User, Camera, Play } from "lucide-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import Text from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import { mockReviews, mockUsers, mockComments, type Review, type Comment } from "@/data/mockData";

const { width: screenWidth } = Dimensions.get('window');

interface MediaItemProps {
  uri: string;
  type: 'image' | 'video';
  onPress: () => void;
}

const MediaItem = ({ uri, type, onPress }: MediaItemProps) => {
  const { colors } = useTheme();
  
  return (
    <Pressable onPress={onPress} style={styles.mediaItem}>
      <View style={[styles.mediaContainer, { backgroundColor: colors.surfaceElevated }]}>
        {/* Placeholder for media */}
        <View style={[styles.mediaPlaceholder, { backgroundColor: colors.border }]}>
          {type === 'video' ? (
            <Play size={24} color={colors.textSecondary} strokeWidth={1.5} />
          ) : (
            <Camera size={24} color={colors.textSecondary} strokeWidth={1.5} />
          )}
        </View>
      </View>
    </Pressable>
  );
};

interface CommentItemProps {
  comment: Comment;
  onReply: (comment: Comment) => void;
  onLike: (commentId: string) => void;
}

const CommentItem = ({ comment, onReply, onLike }: CommentItemProps) => {
  const { colors } = useTheme();
  const commenter = mockUsers.find(u => u._id === comment.userId);
  
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
    <View style={styles.commentItem}>
      <Avatar
        size="sm"
        name={commenter?.username || 'Anonymous'}
        src={commenter?.profilePicture}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text variant="bodySmall" weight="medium">
            {commenter?.displayName || commenter?.username || 'Anonymous'}
          </Text>
          <Text variant="caption" style={{ color: colors.textSecondary }}>
            {formatTime(comment._creationTime || comment.timestamp)}
          </Text>
        </View>
        <Text variant="body" style={{ marginTop: 4, lineHeight: 20 }}>
          {comment.content}
        </Text>
        <View style={styles.commentActions}>
          <Pressable
            onPress={() => onLike(comment._id)}
            style={styles.commentAction}
          >
            <ThumbsUp
              size={14}
              color={comment.isLiked ? colors.primary : colors.textSecondary}
              strokeWidth={1.5}
              fill={comment.isLiked ? colors.primary : 'none'}
            />
            <Text
              variant="caption"
              style={{
                color: comment.isLiked ? colors.primary : colors.textSecondary,
                marginLeft: 4
              }}
            >
              {comment.likesCount || 0}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onReply(comment)}
            style={styles.commentAction}
          >
            <MessageCircle size={14} color={colors.textSecondary} strokeWidth={1.5} />
            <Text variant="caption" style={{ color: colors.textSecondary, marginLeft: 4 }}>
              Reply
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default function ReviewDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, tokens, isDark } = useTheme();
  const { user: currentUser } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  // Find the review
  const review = useMemo(() => {
    const found = mockReviews.find(r => r._id === id);
    if (found) {
      setLikesCount(found.likesCount || 0);
      setIsLiked(found.isLiked || false);
    }
    return found;
  }, [id]);

  // Find reviewer and reviewee
  const reviewer = useMemo(() => {
    return mockUsers.find(u => u._id === review?.reviewerId);
  }, [review?.reviewerId]);

  const reviewee = useMemo(() => {
    return mockUsers.find(u => u._id === review?.revieweeId);
  }, [review?.revieweeId]);

  // Mock comments for this review
  const comments = useMemo(() => {
    return mockComments.filter((c: any) => c.reviewId === review?._id);
  }, [review?._id]);

  // Handlers
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    console.log(isLiked ? 'Unliked' : 'Liked', 'review');
  }, [isLiked]);

  const handleShare = useCallback(async () => {
    if (!review) return;
    
    try {
      await Share.share({
        message: `Check out this review: "${review.title}" - ${review.content?.substring(0, 100) || review.comment.substring(0, 100)}...`,
        url: `https://app.example.com/review/${review._id || review.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [review]);

  const handleReport = useCallback(() => {
    Alert.alert(
      'Report Review',
      'Why are you reporting this review?',
      [
        { text: 'Inappropriate content', onPress: () => console.log('Report: Inappropriate content') },
        { text: 'Spam or fake review', onPress: () => console.log('Report: Spam') },
        { text: 'Harassment', onPress: () => console.log('Report: Harassment') },
        { text: 'False information', onPress: () => console.log('Report: False info') },
        { text: 'Other', onPress: () => console.log('Report: Other') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const handleMoreOptions = useCallback(() => {
    const isOwnReview = currentUser?._id === review?.reviewerId;
    
    const options = [
      { text: 'Share Review', onPress: handleShare },
      !isOwnReview && { text: 'Report Review', onPress: handleReport, style: 'destructive' },
      isOwnReview && { text: 'Edit Review', onPress: () => console.log('Edit review') },
      isOwnReview && { text: 'Delete Review', onPress: () => console.log('Delete review'), style: 'destructive' },
      { text: 'Cancel', style: 'cancel' },
    ].filter(Boolean) as any[];

    Alert.alert('More Options', 'Choose an action', options);
  }, [currentUser, review, handleShare, handleReport]);

  const handleCommentLike = useCallback((commentId: string) => {
    console.log('Like comment:', commentId);
  }, []);

  const handleCommentReply = useCallback((comment: Comment) => {
    setReplyingTo(comment);
    console.log('Reply to comment:', comment._id);
  }, []);

  const handleMediaPress = useCallback((uri: string, type: 'image' | 'video') => {
    console.log('Open media:', uri, type);
    // Navigate to media viewer or open modal
  }, []);

  const handleUserPress = useCallback((userId: string) => {
    router.push(`/profile/${userId}`);
  }, [router]);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color={star <= rating ? colors.warning : colors.border}
            fill={star <= rating ? colors.warning : 'none'}
            strokeWidth={1.5}
          />
        ))}
      </View>
    );
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!review) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Button
            variant="ghost"
            size="sm"
            onPress={handleBack}
            leftIcon={<ArrowLeft size={20} color={colors.text} strokeWidth={1.5} />}
          >
            
          </Button>
        </View>
        <View style={styles.emptyState}>
          <Star size={48} color={colors.textSecondary} strokeWidth={1} />
          <Text variant="h3" weight="medium" style={{ marginTop: 16, textAlign: 'center' }}>
            Review Not Found
          </Text>
          <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            This review doesn't exist or has been deleted.
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
          >
            
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onPress={handleMoreOptions}
            leftIcon={<MoreVertical size={20} color={colors.text} strokeWidth={1.5} />}
          >
            
          </Button>
        </View>

        {/* Review Content */}
        <Card style={styles.reviewCard}>
          {/* Reviewer Info */}
          <Pressable
            onPress={() => handleUserPress(reviewer?._id || '')}
            style={styles.reviewerInfo}
          >
            <Avatar
              size="md"
              name={reviewer?.username || 'Anonymous'}
              src={reviewer?.profilePicture}
            />
            <View style={styles.reviewerDetails}>
              <Text variant="body" weight="medium">
                {reviewer?.displayName || reviewer?.username || 'Anonymous'}
              </Text>
              <View style={styles.reviewMeta}>
                <Calendar size={12} color={colors.textSecondary} strokeWidth={1.5} />
                <Text variant="caption" style={{ color: colors.textSecondary, marginLeft: 4 }}>
                  {formatDate(review._creationTime || review.createdAt)}
                </Text>
                {review.location && (
                  <>
                    <Text variant="caption" style={{ color: colors.textSecondary, marginHorizontal: 8 }}>•</Text>
                    <MapPin size={12} color={colors.textSecondary} strokeWidth={1.5} />
                    <Text variant="caption" style={{ color: colors.textSecondary, marginLeft: 4 }}>
                      {review.location}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </Pressable>

          {/* Review Title & Rating */}
          <View style={styles.reviewHeader}>
            <Text variant="h3" weight="bold" style={styles.reviewTitle}>
              {review.title}
            </Text>
            <View style={styles.ratingContainer}>
              {renderStars(review.rating)}
              <Text variant="body" weight="medium" style={{ marginLeft: 8 }}>
                {review.rating}.0
              </Text>
            </View>
          </View>

          {/* Reviewee Info */}
          {reviewee && (
            <Pressable
              onPress={() => handleUserPress(reviewee._id || reviewee.id)}
              style={styles.revieweeInfo}
            >
              <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                Review about
              </Text>
              <View style={styles.revieweeDetails}>
                <Avatar
                  size="sm"
                  name={reviewee.username}
                  src={reviewee.profilePicture}
                  style={{ marginRight: 8 }}
                />
                <Text variant="body" weight="medium">
                  {reviewee.displayName || reviewee.username}
                </Text>
              </View>
            </Pressable>
          )}

          {/* Categories */}
          {review.categories && review.categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              {review.categories.map((category, index) => (
                <View
                  key={index}
                  style={[styles.categoryChip, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]}
                >
                  <Text variant="caption" style={{ color: colors.primary }}>
                    {category}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Review Content */}
          <Text variant="body" style={styles.reviewContent}>
            {review.content}
          </Text>

          {/* Platform */}
          {review.platform && (
            <View style={styles.platformContainer}>
              <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                Platform: 
              </Text>
              <Text variant="bodySmall" weight="medium">
                {review.platform}
              </Text>
            </View>
          )}

          {/* Media */}
          {review.media && review.media.length > 0 && (
            <View style={styles.mediaContainer}>
              <Text variant="body" weight="medium" style={styles.mediaTitle}>
                Attachments
              </Text>
              <View style={styles.mediaGrid}>
                {review.media.map((media, index) => (
                  <MediaItem
                    key={index}
                    uri={media.url}
                    type={media.type}
                    onPress={() => handleMediaPress(media.url, media.type)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Pressable onPress={handleLike} style={styles.actionButton}>
              <Heart
                size={20}
                color={isLiked ? colors.error : colors.textSecondary}
                fill={isLiked ? colors.error : 'none'}
                strokeWidth={1.5}
              />
              <Text
                variant="bodySmall"
                style={{
                  color: isLiked ? colors.error : colors.textSecondary,
                  marginLeft: 6
                }}
              >
                {likesCount}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowComments(!showComments)}
              style={styles.actionButton}
            >
              <MessageCircle size={20} color={colors.textSecondary} strokeWidth={1.5} />
              <Text variant="bodySmall" style={{ color: colors.textSecondary, marginLeft: 6 }}>
                {comments.length}
              </Text>
            </Pressable>

            <Pressable onPress={handleShare} style={styles.actionButton}>
              <Share2 size={20} color={colors.textSecondary} strokeWidth={1.5} />
              <Text variant="bodySmall" style={{ color: colors.textSecondary, marginLeft: 6 }}>
                Share
              </Text>
            </Pressable>

            <View style={styles.viewsContainer}>
              <Eye size={16} color={colors.textSecondary} strokeWidth={1.5} />
              <Text variant="caption" style={{ color: colors.textSecondary, marginLeft: 4 }}>
                {review.viewsCount || 0} views
              </Text>
            </View>
          </View>
        </Card>

        {/* Comments Section */}
        {showComments && (
          <Card style={styles.commentsCard}>
            <Text variant="body" weight="medium" style={styles.commentsTitle}>
              Comments ({comments.length})
            </Text>
            
            {comments.length === 0 ? (
              <View style={styles.emptyComments}>
                <MessageCircle size={32} color={colors.textSecondary} strokeWidth={1} />
                <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12 }}>
                  No comments yet. Be the first to comment!
                </Text>
              </View>
            ) : (
              <View style={styles.commentsList}>
                {comments.map((comment: Comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    onReply={handleCommentReply}
                    onLike={handleCommentLike}
                  />
                ))}
              </View>
            )}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 24,
  },
  actionsContainer: {
    alignItems: 'center',
    borderTopColor: '#E5E5E5',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingTop: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  commentAction: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  commentAvatar: {
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentItem: {
    flexDirection: 'row',
  },
  commentsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  commentsList: {
    gap: 16,
  },
  commentsTitle: {
    marginBottom: 16,
  },
  container: {
    flex: 1,
  },
  emptyComments: {
    alignItems: 'center',
    padding: 32,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  mediaContainer: {
    marginBottom: 16,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaItem: {
    aspectRatio: 1,
    width: (screenWidth - 80) / 3,
  },
  mediaPlaceholder: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  mediaTitle: {
    marginBottom: 12,
  },
  platformContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  reviewCard: {
    margin: 16,
    padding: 16,
  },
  reviewContent: {
    lineHeight: 22,
    marginBottom: 16,
  },
  reviewHeader: {
    marginBottom: 16,
  },
  reviewMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  reviewTitle: {
    lineHeight: 24,
    marginBottom: 8,
  },
  revieweeDetails: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  revieweeInfo: {
    marginBottom: 16,
  },
  reviewerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  viewsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 'auto',
  },
});