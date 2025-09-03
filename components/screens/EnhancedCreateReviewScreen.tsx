import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import our enhanced components
import { ModernButton } from '../ui/ModernButton';
import { ModernCard } from '../ui/ModernCard';
import { FloatingLabelInput } from '../ui/FloatingLabelInput';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, borderRadius } from '../../utils/spacing';
import { textStyles } from '../../utils/typography';
import { createSpringAnimation, createFadeInAnimation } from '../../utils/animations';

interface FormData {
  title: string;
  content: string;
  category: string;
  rating: number;
  isAnonymous: boolean;
  location: string;
  tags: string[];
}

interface EnhancedCreateReviewScreenProps {
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

const STEPS = [
  { id: 'basics', title: 'Basics', description: 'Tell us about your experience' },
  { id: 'details', title: 'Details', description: 'Share the specifics' },
  { id: 'rating', title: 'Rating', description: 'Rate your experience' },
  { id: 'privacy', title: 'Privacy', description: 'Choose your settings' },
];

const CATEGORIES = [
  { id: 'dating-apps', label: 'Dating Apps', icon: 'phone-portrait-outline' },
  { id: 'restaurants', label: 'Restaurants', icon: 'restaurant-outline' },
  { id: 'activities', label: 'Activities', icon: 'fitness-outline' },
  { id: 'venues', label: 'Venues', icon: 'location-outline' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

const ProgressIndicator: React.FC<{
  currentStep: number;
  totalSteps: number;
}> = ({ currentStep, totalSteps }) => {
  const { colors } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep / (totalSteps - 1),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={[textStyles.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
        Step {currentStep + 1} of {totalSteps}
      </Text>
    </View>
  );
};

const StepHeader: React.FC<{
  step: typeof STEPS[0];
  index: number;
}> = ({ step, index }) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      createFadeInAnimation(fadeAnim, 400),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step.id]);

  return (
    <Animated.View
      style={[
        styles.stepHeader,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={[textStyles.h2, { color: colors.text }]}>
        {step.title}
      </Text>
      <Text style={[textStyles.body, { color: colors.textSecondary }]}>
        {step.description}
      </Text>
    </Animated.View>
  );
};

const CategorySelector: React.FC<{
  selectedCategory: string;
  onSelect: (category: string) => void;
}> = ({ selectedCategory, onSelect }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.categoryGrid}>
      {CATEGORIES.map((category, index) => (
        <Animated.View
          key={category.id}
          style={{
            opacity: new Animated.Value(0),
          }}
        >
          <ModernCard
            variant={selectedCategory === category.id ? 'gradient' : 'elevated'}
            onPress={() => onSelect(category.id)}
            style={[
              styles.categoryCard,
              selectedCategory === category.id && {
                borderColor: colors.primary,
                borderWidth: 2,
              },
            ]}
          >
            <View style={styles.categoryContent}>
              <Ionicons
                name={category.icon as any}
                size={32}
                color={selectedCategory === category.id ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  textStyles.label,
                  {
                    color: selectedCategory === category.id ? colors.primary : colors.text,
                    marginTop: spacing.sm,
                  },
                ]}
              >
                {category.label}
              </Text>
            </View>
          </ModernCard>
        </Animated.View>
      ))}
    </View>
  );
};

const RatingSelector: React.FC<{
  rating: number;
  onSelect: (rating: number) => void;
}> = ({ rating, onSelect }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.ratingContainer}>
      <Text style={[textStyles.h3, { textAlign: 'center', marginBottom: spacing.lg }]}>
        How would you rate this experience?
      </Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <ModernButton
            key={star}
            variant="ghost"
            onPress={() => onSelect(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={40}
              color={star <= rating ? colors.warning : colors.textSecondary}
            />
          </ModernButton>
        ))}
      </View>
      <Text style={[textStyles.body, { textAlign: 'center', marginTop: spacing.lg }]}>
        {rating === 0 ? 'Tap to rate' : `${rating} star${rating !== 1 ? 's' : ''}`}
      </Text>
    </View>
  );
};

export const EnhancedCreateReviewScreen: React.FC<EnhancedCreateReviewScreenProps> = ({
  onSubmit,
  onCancel,
}) => {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    category: '',
    rating: 0,
    isAnonymous: true,
    location: '',
    tags: [],
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {};

    switch (step) {
      case 0: // Basics
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.category) newErrors.category = 'Category is required';
        break;
      case 1: // Details
        if (!formData.content.trim()) newErrors.content = 'Content is required';
        if (formData.content.length < 10) newErrors.content = 'Content must be at least 10 characters';
        break;
      case 2: // Rating
        if (formData.rating === 0) newErrors.rating = 'Rating is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basics
        return (
          <View style={styles.stepContent}>
            <FloatingLabelInput
              label="Review Title"
              value={formData.title}
              onChangeText={(title) => setFormData({ ...formData, title })}
              error={errors.title}
              placeholder="Give your review a catchy title"
              required
            />
            
            <Text style={[textStyles.label, { marginTop: spacing.lg, marginBottom: spacing.md }]}>
              Category
            </Text>
            <CategorySelector
              selectedCategory={formData.category}
              onSelect={(category) => setFormData({ ...formData, category })}
            />
            {errors.category && (
              <Text style={[textStyles.caption, { color: colors.error, marginTop: spacing.xs }]}>
                {errors.category}
              </Text>
            )}
          </View>
        );

      case 1: // Details
        return (
          <View style={styles.stepContent}>
            <FloatingLabelInput
              label="Your Experience"
              value={formData.content}
              onChangeText={(content) => setFormData({ ...formData, content })}
              error={errors.content}
              placeholder="Share your detailed experience..."
              multiline
              numberOfLines={6}
              required
            />
            
            <FloatingLabelInput
              label="Location (Optional)"
              value={formData.location}
              onChangeText={(location) => setFormData({ ...formData, location })}
              placeholder="Where did this happen?"
              style={{ marginTop: spacing.lg }}
            />
          </View>
        );

      case 2: // Rating
        return (
          <View style={styles.stepContent}>
            <RatingSelector
              rating={formData.rating}
              onSelect={(rating) => setFormData({ ...formData, rating })}
            />
            {errors.rating && (
              <Text style={[textStyles.caption, { color: colors.error, textAlign: 'center' }]}>
                {errors.rating}
              </Text>
            )}
          </View>
        );

      case 3: // Privacy
        return (
          <View style={styles.stepContent}>
            <ModernCard variant="elevated" style={styles.privacyCard}>
              <View style={styles.privacyOption}>
                <View>
                  <Text style={[textStyles.h4, { marginBottom: spacing.xs }]}>
                    Anonymous Review
                  </Text>
                  <Text style={[textStyles.body, { color: colors.textSecondary }]}>
                    Your identity will be kept private
                  </Text>
                </View>
                <ModernButton
                  variant={formData.isAnonymous ? 'gradient' : 'outline'}
                  size="sm"
                  onPress={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
                >
                  {formData.isAnonymous ? 'Anonymous' : 'Public'}
                </ModernButton>
              </View>
            </ModernCard>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.background, colors.surface]}
          style={styles.header}
        >
          <ProgressIndicator currentStep={currentStep} totalSteps={STEPS.length} />
          <StepHeader step={STEPS[currentStep]} index={currentStep} />
        </LinearGradient>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStepContent()}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.surface }]}>
          <View style={styles.footerButtons}>
            {currentStep > 0 && (
              <ModernButton
                variant="ghost"
                onPress={handleBack}
                style={styles.backButton}
              >
                Back
              </ModernButton>
            )}
            
            <ModernButton
              variant="gradient"
              onPress={handleNext}
              loading={isSubmitting}
              style={styles.nextButton}
            >
              {currentStep === STEPS.length - 1 ? 'Submit Review' : 'Next'}
            </ModernButton>
          </View>
          
          <ModernButton
            variant="ghost"
            onPress={onCancel}
            style={styles.cancelButton}
          >
            Cancel
          </ModernButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  stepHeader: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  stepContent: {
    paddingVertical: spacing.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    marginBottom: spacing.md,
  },
  categoryContent: {
    alignItems: 'center',
    padding: spacing.md,
  },
  ratingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    marginHorizontal: spacing.xs,
  },
  privacyCard: {
    padding: spacing.lg,
  },
  privacyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backButton: {
    flex: 1,
    marginRight: spacing.md,
  },
  nextButton: {
    flex: 2,
  },
  cancelButton: {
    alignSelf: 'center',
  },
});

export default EnhancedCreateReviewScreen;
