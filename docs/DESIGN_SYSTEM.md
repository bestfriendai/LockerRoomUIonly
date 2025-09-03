# LockerRoom Talk Design System

## Overview

This design system provides a comprehensive set of components, utilities, and guidelines for building consistent, accessible, and modern user interfaces in the LockerRoom Talk app.

## Color System

### Primary Colors
```typescript
import { Colors } from '../constants/colors';

// Main brand color - accessible pink with 4.5:1 contrast ratio
Colors.primary[500] // #E91E63 (replaces harsh #FF006B)
Colors.primary[600] // #C2185B
Colors.primary[700] // #AD1457
```

### Neutral Colors
```typescript
// Enhanced neutral palette (softer than pure black)
Colors.neutral[50]  // #FAFAFA
Colors.neutral[900] // #171717
Colors.neutral[950] // #0A0A0A (softer than pure black)
```

### Semantic Colors
```typescript
Colors.success[500] // #22C55E (Green for positive actions)
Colors.error[500]   // #EF4444 (Red for warnings/errors)
Colors.warning[500] // #F59E0B (Orange for warnings)
```

### Gradients
```typescript
Colors.gradients.primary // 'linear-gradient(135deg, #E91E63 0%, #FF5AA3 100%)'
Colors.gradients.card    // 'linear-gradient(145deg, rgba(233,30,99,0.05) 0%, rgba(255,90,163,0.02) 100%)'
```

## Typography

### Font Families
- **iOS**: SF Pro Display
- **Android**: Roboto
- **Fallback**: System font

### Font Scale
```typescript
import { textStyles } from '../utils/typography';

// Headings
textStyles.h1 // 36px, bold, tight line height
textStyles.h2 // 30px, semibold, tight line height
textStyles.h3 // 24px, semibold, normal line height

// Body text
textStyles.body      // 16px, regular, relaxed line height
textStyles.bodyLarge // 18px, regular, relaxed line height
textStyles.bodySmall // 14px, regular, normal line height

// Interactive elements
textStyles.button      // 16px, semibold, tight line height
textStyles.buttonLarge // 18px, semibold, tight line height

// Labels and captions
textStyles.label   // 14px, medium, wide letter spacing
textStyles.caption // 14px, regular, 70% opacity
```

## Spacing System

### Base Unit: 4px
```typescript
import { spacing } from '../utils/spacing';

spacing.xs   // 4px
spacing.sm   // 8px
spacing.md   // 16px
spacing.lg   // 24px
spacing.xl   // 32px
spacing['2xl'] // 48px
spacing['3xl'] // 64px
spacing['4xl'] // 96px
```

### Border Radius
```typescript
import { borderRadius } from '../utils/spacing';

borderRadius.sm   // 4px
borderRadius.md   // 8px
borderRadius.lg   // 12px
borderRadius.xl   // 16px
borderRadius.full // 9999px (circular)
```

### Shadows
```typescript
import { shadows } from '../utils/spacing';

shadows.sm // Subtle shadow for cards
shadows.md // Standard shadow for elevated elements
shadows.lg // Prominent shadow for modals/overlays
```

## Components

### ModernButton

Modern button component with multiple variants and micro-interactions.

```typescript
import { ModernButton } from '../components/ui/ModernButton';

// Variants
<ModernButton variant="gradient">Primary Action</ModernButton>
<ModernButton variant="glass">Glass Effect</ModernButton>
<ModernButton variant="neumorphic">Neumorphic Style</ModernButton>
<ModernButton variant="outline">Outlined</ModernButton>
<ModernButton variant="ghost">Ghost Button</ModernButton>

// Sizes
<ModernButton size="sm">Small</ModernButton>
<ModernButton size="md">Medium (default)</ModernButton>
<ModernButton size="lg">Large</ModernButton>
<ModernButton size="xl">Extra Large</ModernButton>

// With icons
<ModernButton 
  icon={<Ionicons name="add" size={20} />}
  rightIcon={<Ionicons name="arrow-forward" size={20} />}
>
  Button with Icons
</ModernButton>

// States
<ModernButton loading={true}>Loading...</ModernButton>
<ModernButton disabled={true}>Disabled</ModernButton>
```

### ModernCard

Enhanced card component with multiple visual styles.

```typescript
import { ModernCard } from '../components/ui/ModernCard';

// Variants
<ModernCard variant="elevated">Elevated Card</ModernCard>
<ModernCard variant="glass">Glass Card</ModernCard>
<ModernCard variant="gradient">Gradient Card</ModernCard>
<ModernCard variant="neumorphic">Neumorphic Card</ModernCard>
<ModernCard variant="outline">Outlined Card</ModernCard>

// Interactive cards
<ModernCard onPress={() => console.log('Pressed')}>
  Pressable Card
</ModernCard>

// Custom styling
<ModernCard 
  padding="xl"
  borderRadius="2xl"
  shadow="lg"
>
  Custom Card
</ModernCard>
```

### FloatingLabelInput

Advanced input component with animated floating labels.

```typescript
import { FloatingLabelInput } from '../components/ui/FloatingLabelInput';

// Basic usage
<FloatingLabelInput
  label="Email Address"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
/>

// With validation
<FloatingLabelInput
  label="Password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  error={passwordError}
  required
/>

// Variants
<FloatingLabelInput variant="filled" />
<FloatingLabelInput variant="outlined" />
<FloatingLabelInput variant="default" />

// With icons
<FloatingLabelInput
  leftIcon={<Ionicons name="mail" size={20} />}
  rightIcon={<Ionicons name="eye" size={20} />}
/>
```

### EmptyState

Contextual empty state components for better user experience.

```typescript
import { EmptyState } from '../components/ui/EmptyState';

// Different types
<EmptyState 
  type="no-reviews"
  onAction={() => router.push('/create')}
/>

<EmptyState 
  type="no-connection"
  onAction={() => retryConnection()}
/>

// Custom content
<EmptyState
  title="Custom Title"
  description="Custom description"
  actionText="Custom Action"
  onAction={customAction}
/>
```

### LoadingStates

Comprehensive loading state components.

```typescript
import { 
  LoadingSkeleton,
  CardLoadingSkeleton,
  MasonryLoadingSkeleton,
  ShimmerLoading 
} from '../components/ui/LoadingStates';

// Basic skeleton
<LoadingSkeleton width="100%" height={20} />

// Card skeleton
<CardLoadingSkeleton />

// Masonry grid skeleton
<MasonryLoadingSkeleton columns={2} itemCount={6} />

// Shimmer effect
<ShimmerLoading isLoading={loading}>
  <YourContent />
</ShimmerLoading>
```

## Animation System

### Basic Animations
```typescript
import { 
  createSpringAnimation,
  createFadeInAnimation,
  createScaleAnimation 
} from '../utils/animations';

// Spring animation
const scaleAnim = useRef(new Animated.Value(1)).current;
createSpringAnimation(scaleAnim, 0.95).start();

// Fade in with delay
createFadeInAnimation(fadeAnim, 300, 100).start();

// Scale animation
createScaleAnimation(scaleAnim, 0.98, 150).start();
```

### Animation Presets
```typescript
import { animationPresets } from '../utils/animations';

// Button press animation
animationPresets.buttonPress // { scale: 0.95, duration: 100 }

// Card hover animation
animationPresets.cardHover // { scale: 1.02, duration: 200 }

// Modal entrance
animationPresets.modalEntrance // { duration: 300 }
```

## Best Practices

### Accessibility
- Always provide `accessibilityLabel` for interactive elements
- Ensure minimum touch target size of 44px
- Use semantic colors (success, error, warning)
- Maintain 4.5:1 contrast ratio for text

### Performance
- Use `useNativeDriver: true` for animations when possible
- Implement proper `keyExtractor` for lists
- Use `React.memo` for expensive components
- Leverage `InteractionManager` for smooth transitions

### Consistency
- Use design tokens instead of hardcoded values
- Follow the spacing scale (4px base unit)
- Use predefined text styles
- Stick to the color palette

## Usage Examples

### Complete Screen Example
```typescript
import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModernCard, ModernButton, FloatingLabelInput } from '../components/ui';
import { useTheme } from '../providers/ThemeProvider';
import { spacing } from '../utils/spacing';

const ExampleScreen = () => {
  const { colors } = useTheme();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ padding: spacing.lg }}>
        <ModernCard variant="gradient" style={{ marginBottom: spacing.lg }}>
          <FloatingLabelInput
            label="Your Name"
            variant="outlined"
            style={{ marginBottom: spacing.md }}
          />
          <ModernButton variant="gradient" fullWidth>
            Submit
          </ModernButton>
        </ModernCard>
      </ScrollView>
    </SafeAreaView>
  );
};
```

This design system ensures consistency, accessibility, and modern aesthetics across the entire LockerRoom Talk application.
