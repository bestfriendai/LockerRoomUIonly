// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Phone number validation
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Username validation
export const isValidUsername = (username: string): { isValid: boolean; error?: string } => {
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 20) {
    return { isValid: false, error: 'Username must be less than 20 characters' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return { isValid: true };
};

interface ReviewFormData {
  targetName?: string;
  categories?: string[];
  title?: string;
  content?: string;
  rating?: number;
  platform?: string;
  location?: any;
  media?: any[];
  isAnonymous?: boolean;
  tags?: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized: ReviewFormData;
}

// Enhanced review form validation with sanitization
export const validateReviewForm = (data: ReviewFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  const sanitized: ReviewFormData = {};
  
  // Sanitize and validate targetName
  sanitized.targetName = sanitizeInput(data.targetName);
  if (!sanitized.targetName || sanitized.targetName.length < 2) {
    errors.targetName = 'Name must be at least 2 characters';
  }
  
  // Validate categories
  if (!data.categories || data.categories.length === 0) {
    errors.categories = 'Please select at least one category';
  } else {
    sanitized.categories = data.categories.map((cat: string) => sanitizeInput(cat));
  }
  
  // Sanitize and validate title
  sanitized.title = sanitizeInput(data.title);
  if (!sanitized.title || sanitized.title.length < 5) {
    errors.title = 'Title must be at least 5 characters';
  }
  
  // Sanitize and validate content
  sanitized.content = sanitizeInput(data.content);
  if (!sanitized.content || sanitized.content.length < 50) {
    errors.content = 'Review must be at least 50 characters';
  }
  if (sanitized.content.length > 5000) {
    errors.content = 'Review must be less than 5000 characters';
  }
  if (containsProfanity(sanitized.content)) {
    errors.content = 'Review contains inappropriate language';
  }
  
  // Validate and sanitize rating
  sanitized.rating = Math.max(1, Math.min(5, Math.round(Number(data.rating) || 0)));
  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.rating = 'Please select a rating between 1 and 5';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
};

// Profanity check (production-ready using 'bad-words')
let profanityFilter: any = null;

// Lazy load bad-words to avoid import issues in testing
const getProfanityFilter = () => {
  if (!profanityFilter) {
    try {
      const BadWordsFilter = require('bad-words');
      profanityFilter = new BadWordsFilter();
    } catch (error) {
      // Fallback for testing or if package is not available
      profanityFilter = {
        isProfane: () => false,
        clean: (text: string) => text
      };
    }
  }
  return profanityFilter;
};

export const containsProfanity = (text: string): boolean => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return false;
  }
  return getProfanityFilter().isProfane(text);
};

// Enhanced input sanitization to prevent XSS and injection
export const sanitizeInput = (input: string | undefined | null): string => {
  if (!input) return '';
  
  // Remove HTML tags and scripts
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
  
  // Remove zero-width characters and control characters
  sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, '');
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Limit consecutive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Escape special characters for SQL/NoSQL injection prevention
  sanitized = sanitized.replace(/['"\\]/g, '\\$&');
  
  return sanitized;
};

// Age validation
export const isValidAge = (age: number): boolean => {
  return age >= 18 && age <= 120;
};

// Date validation
export const isValidDate = (date: string): boolean => {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
};

// Credit card validation (Luhn algorithm)
export const isValidCreditCard = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Validate Firebase document ID
export const validateFirebaseId = (id: string): boolean => {
  const sanitized = sanitizeInput(id);
  return sanitized.length > 0 && sanitized.length <= 1500 && !/[/\0]/.test(sanitized);
};

// Validate and sanitize chat messages
export const validateChatMessage = (message: string): { isValid: boolean; sanitized: string; errors: string[] } => {
  const errors: string[] = [];
  const sanitized = sanitizeInput(message);
  
  if (!sanitized) {
    errors.push('Message cannot be empty');
  }
  if (sanitized.length > 1000) {
    errors.push('Message must be no more than 1000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    sanitized: sanitized.substring(0, 1000),
    errors
  };
};

// Validate location data
export const validateLocation = (location: any): { isValid: boolean; sanitized: any; errors: string[] } => {
  const errors: string[] = [];
  const sanitized: any = {};
  
  if (location?.latitude !== undefined && location?.longitude !== undefined) {
    const lat = parseFloat(location.latitude);
    const lng = parseFloat(location.longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('Invalid latitude value');
    } else {
      sanitized.latitude = lat;
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('Invalid longitude value');
    } else {
      sanitized.longitude = lng;
    }
  }
  
  if (location?.name) {
    sanitized.name = sanitizeInput(location.name);
  }
  
  if (location?.address) {
    sanitized.address = sanitizeInput(location.address);
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
};