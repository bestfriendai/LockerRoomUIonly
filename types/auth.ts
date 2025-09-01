/**
 * Authentication Types and Interfaces
 * Comprehensive TypeScript definitions for authentication flows
 */

// Base error interface
export interface AuthError {
  code?: string;
  message: string;
  details?: string;
}

// Validation result interface
export interface ValidationResult<T = any> {
  isValid: boolean;
  data: T;
  errors: string[];
}

// Form validation interfaces
export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  agreeTerms?: boolean;
  ageVerified?: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  email: string;
  resetCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileSetupFormData {
  name: string;
  age: number;
  bio: string;
  profileComplete?: boolean;
  isAnonymous?: boolean;
}

// Location interfaces
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface LocationData {
  coords: LocationCoordinates;
  timestamp: number;
}

export interface LocationAddress {
  city?: string | null;
  country?: string | null;
  district?: string | null;
  isoCountryCode?: string | null;
  name?: string | null;
  postalCode?: string | null;
  region?: string | null;
  street?: string | null;
  streetNumber?: string | null;
  subregion?: string | null;
  timezone?: string | null;
}

// Component state interfaces
export interface AuthFormState {
  isLoading: boolean;
  error: string;
  success?: string;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  gradient?: readonly [string, string];
}

// Firebase Auth error codes
export type FirebaseAuthErrorCode =
  | 'auth/email-already-in-use'
  | 'auth/invalid-email'
  | 'auth/weak-password'
  | 'auth/operation-not-allowed'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/too-many-requests'
  | 'auth/network-request-failed'
  | 'auth/internal-error'
  | 'auth/invalid-credential';

// Auth hook return types
export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: Partial<User> & { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  demoLogin: () => Promise<void>;
}

// Input sanitization types
export interface SanitizationOptions {
  maxLength?: number;
  allowHtml?: boolean;
  stripWhitespace?: boolean;
}

export interface FieldSchema {
  type: 'email' | 'username' | 'text' | 'review' | 'search' | 'location';
  required: boolean;
  options?: SanitizationOptions;
}

export interface ValidationSchema {
  [key: string]: FieldSchema;
}

// Rate limiting
export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  keyPrefix: string;
}

// Component prop interfaces
export interface AuthScreenProps {
  navigation?: any;
  route?: any;
}

export interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: any;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// Theme-related interfaces for auth screens
export interface AuthThemeColors {
  background: string;
  surface: string;
  primary: string;
  onPrimary: string;
  text: string;
  textSecondary: string;
  error: string;
  errorBg: string;
  success: string;
  successBg: string;
  divider: string;
  chipBg: string;
  cardBg: string;
}

// Animation interfaces
export interface AnimationConfig {
  duration: number;
  useNativeDriver: boolean;
  delay?: number;
}

// Accessibility interfaces
export interface AccessibilityProps {
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'text' | 'textbox' | 'link' | 'header' | 'none';
  accessible?: boolean;
}

// Form validation error types
export interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  age?: string;
  bio?: string;
  resetCode?: string;
  general?: string;
}

// Success/Error alert interfaces
export interface AlertConfig {
  title: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

// User interface definition
export interface User {
  id: string;
  email: string;
  name?: string;
  age?: number;
  bio?: string;
  location?: string;
  profileComplete?: boolean;
  isAnonymous?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
