# UI Components Library

This document provides an overview of the utility components created and enhanced for the MockTrae app, following the design system patterns established in ModernButton.

## 🎯 Design System Integration

All components follow the established design system:

- **Design Tokens**: Uses `tokens.ts` for consistent spacing, typography, and colors
- **Shadow System**: Leverages `SHADOWS` and `BORDER_RADIUS` from `shadows.ts`
- **Theme Integration**: Full support for light/dark themes via `ThemeProvider`
- **Typography**: Uses `createTypographyStyles()` for consistent text styling
- **Haptic Feedback**: Implements tactile feedback for better user experience

## 📱 Component Overview

### 1. LoadingSkeletons (Enhanced)

**Location**: `components/ui/LoadingSkeletons.tsx`

Enhanced the existing skeleton loader with modern shimmer effects and design tokens:

```tsx
import { LoadingSkeletons, Skeleton } from '@/components/ui';

// Basic skeleton
<Skeleton width={100} height={20} borderRadius={BORDER_RADIUS.sm} />

// Pre-built skeletons
<ReviewCardSkeleton />
<MasonryReviewSkeleton />
<ChatRoomSkeleton />
<ProfileSkeleton />
```

**Features**:
- ✨ LinearGradient shimmer effect
- 🎨 Design token integration
- 📱 Multiple pre-built variants
- 🌓 Theme-aware colors
- ⚡ Optimized performance

### 2. EnhancedEmptyState

**Location**: `components/ui/EnhancedEmptyState.tsx`

A comprehensive empty state component with multiple illustration styles:

```tsx
import { EnhancedEmptyState, SearchEmptyState, NetworkEmptyState } from '@/components/ui';

// Basic usage
<EnhancedEmptyState
  title="No results found"
  message="Try adjusting your search"
  onAction={() => clearFilters()}
  actionText="Clear filters"
/>

// Preset variants
<SearchEmptyState onAction={handleClearSearch} />
<NetworkEmptyState onAction={retryConnection} />
<ReviewsEmptyState onAction={navigateToReviewForm} />
```

**Features**:
- 🎨 4 illustration styles: gradient, glass, neumorphic, minimal
- 📏 3 sizes: sm, md, lg
- 🎬 Smooth animations with Moti
- 🎯 Preset variants for common use cases
- 🔘 Primary and secondary action buttons
- ♿ Full accessibility support

**Variants Available**:
- `SearchEmptyState` - For search results
- `NetworkEmptyState` - For connectivity issues  
- `FilterEmptyState` - For filtered results
- `ReviewsEmptyState` - For empty review lists
- `ChatsEmptyState` - For empty chat lists

### 3. LocationSelector

**Location**: `components/ui/LocationSelector.tsx`

A sophisticated location selection component with multiple display modes:

```tsx
import { LocationSelector } from '@/components/ui';

// Modal variant
<LocationSelector
  visible={showLocationPicker}
  onLocationSelect={handleLocationSelect}
  onClose={() => setShowLocationPicker(false)}
  enableCurrentLocation={true}
/>

// Inline variant
<LocationSelector
  variant="inline"
  onLocationSelect={handleLocationSelect}
  placeholder="Search locations..."
/>

// Dropdown variant
<LocationSelector
  variant="dropdown"
  selectedLocation={currentLocation}
  onLocationSelect={handleLocationSelect}
/>
```

**Features**:
- 📍 Current location detection with permissions
- 🔍 Search functionality (mock implementation)
- 📱 3 display variants: modal, inline, dropdown
- 📏 3 sizes: sm, md, lg
- 🌟 Popular locations support
- 🕒 Recent locations history
- 🎨 Blur overlay and glass effects
- ♿ Full accessibility support

**LocationData Interface**:
```tsx
interface LocationData {
  id: string;
  name: string;
  fullName?: string;
  city: string;
  state?: string;
  country: string;
  coordinates?: { latitude: number; longitude: number };
  type?: 'city' | 'neighborhood' | 'landmark' | 'current';
}
```

### 4. MasonryReviewCard

**Location**: `components/ui/MasonryReviewCard.tsx`

A modern review card component designed for masonry/staggered grid layouts:

```tsx
import { MasonryReviewCard } from '@/components/ui';

<MasonryReviewCard
  data={reviewData}
  onPress={handleReviewPress}
  onLike={handleLike}
  onAuthorPress={handleAuthorPress}
  variant="standard"
  showAuthor={true}
  showTags={true}
  showStats={true}
/>
```

**Features**:
- 🖼️ Image support with loading states
- ⭐ Star rating display
- 👤 Author information with verification badges
- 🏷️ Tag system with color coding
- 📱 Platform badges (Tinder, Bumble, Hinge)
- ❤️ Like functionality with animations
- 📍 Location display
- 🎨 Glass overlay effects
- 📏 3 variants: compact, standard, expanded

**MasonryReviewData Interface**:
```tsx
interface MasonryReviewData {
  id: string;
  title: string;
  content: string;
  rating: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  images?: string[];
  tags?: string[];
  likes: number;
  isLiked?: boolean;
  location?: string;
  createdAt: string;
  platform?: 'tinder' | 'bumble' | 'hinge' | 'other';
}
```

## 🎨 Design Patterns

### Consistent Visual Language

All components follow these patterns:

1. **Haptic Feedback**: All interactive elements provide tactile feedback
2. **Animation**: Smooth transitions using native drivers
3. **Glass Effects**: Subtle blur overlays for premium feel
4. **Shadow System**: Consistent elevation using the shadow system
5. **Border Radius**: Consistent corner radius using design tokens
6. **Color System**: Full theme support with semantic color roles

### Accessibility Features

- Screen reader support with proper labels and hints
- Keyboard navigation support
- High contrast compatibility
- Touch target sizing (minimum 44px)
- Focus indicators

### Performance Optimizations

- Native driver animations
- Optimized re-renders
- Efficient list rendering
- Image loading optimization
- Memory management

## 📂 File Structure

```
components/ui/
├── ModernButton.tsx          # Reference implementation
├── LoadingSkeletons.tsx      # Enhanced skeleton loaders
├── EmptyState.tsx           # Original empty state (preserved)
├── EnhancedEmptyState.tsx   # New enhanced version
├── LocationSelector.tsx     # Location selection component
├── MasonryReviewCard.tsx    # Review card for grids
├── Button.tsx              # Original button (preserved)
├── index.ts                # Barrel exports
└── README.md               # This documentation
```

## 🚀 Usage Examples

### Complete Search Screen

```tsx
import { 
  LoadingSkeletons, 
  SearchEmptyState, 
  LocationSelector 
} from '@/components/ui';

const SearchScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  if (isLoading) {
    return <LoadingSkeletons variant="review-card" count={5} />;
  }

  if (results.length === 0) {
    return (
      <SearchEmptyState
        onAction={() => setShowLocationPicker(true)}
        actionText="Change location"
        secondaryActionText="Clear filters"
        onSecondaryAction={clearFilters}
      />
    );
  }

  return (
    <>
      {/* Results */}
      <LocationSelector
        visible={showLocationPicker}
        onLocationSelect={handleLocationSelect}
        onClose={() => setShowLocationPicker(false)}
      />
    </>
  );
};
```

### Masonry Grid Layout

```tsx
import { MasonryReviewCard } from '@/components/ui';

const DiscoverFeed = () => {
  return (
    <View style={styles.masonryContainer}>
      {reviews.map((review, index) => (
        <MasonryReviewCard
          key={review.id}
          data={review}
          onPress={navigateToReview}
          onLike={handleLike}
          variant="standard"
          style={styles.masonryItem}
        />
      ))}
    </View>
  );
};
```

## 🔧 Customization

All components support extensive customization through props:

- **Styling**: Custom styles via `style` prop
- **Theming**: Automatic adaptation to theme changes
- **Sizing**: Multiple size variants (sm, md, lg)
- **Behavior**: Configurable interactions and callbacks
- **Animation**: Toggleable animations for performance

## 🎯 Next Steps

1. **Integration**: Import and use these components in your screens
2. **Testing**: Add unit tests for each component
3. **Documentation**: Update your app's component documentation
4. **Feedback**: Gather user feedback and iterate on designs
5. **Performance**: Monitor and optimize component performance

## 📝 Notes

- All components are TypeScript-first with full type safety
- Components are optimized for both iOS and Android
- Web compatibility maintained where applicable
- Follow React Native best practices
- Consistent with Expo SDK 53+ requirements