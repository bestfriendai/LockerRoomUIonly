/**
 * Input Sanitization Utilities for MockTrae Anonymous Dating Review Platform
 * Provides comprehensive input validation and sanitization for security
 */

// Basic HTML entity encoding
const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Sanitize HTML content by encoding special characters
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeHtml = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/[&<>"'/]/g, (char) => htmlEntities[char]);
};

/**
 * Sanitize text input by removing/encoding dangerous characters
 * @param {string} input - The input string to sanitize
 * @param {object} options - Sanitization options
 * @returns {string} - Sanitized string
 */
export const sanitizeText = (input, options = {}) => {
  if (typeof input !== 'string') return '';
  
  const {
    maxLength = 1000,
    allowNewlines = true,
    allowSpecialChars = true,
    trim = true,
  } = options;
  
  let sanitized = input;

  // Trim whitespace if requested
  if (trim) {
    sanitized = sanitized.trim();
  }

  // Remove null bytes and other control characters (via code points)
  sanitized = Array.from(sanitized)
    .filter((ch) => {
      const code = ch.codePointAt(0) || 0;
      // Exclude C0 controls and DEL
      return !((code >= 0x00 && code <= 0x1F) || code === 0x7F);
    })
    .join('');
  
  // Handle newlines
  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]/g, ' ');
  }
  
  // Remove potentially dangerous patterns
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

/**
 * Sanitize email input
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  
  // Basic email sanitization
  let sanitized = email.toLowerCase().trim();

  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>"'&]/g, '');
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
};

/**
 * Sanitize username input for anonymous usernames
 * @param {string} username - Username to sanitize
 * @returns {string} - Sanitized username
 */
export const sanitizeUsername = (username) => {
  if (typeof username !== 'string') return '';
  
  let sanitized = username.trim();

  // Remove dangerous characters and keep only alphanumeric and safe special chars
  sanitized = sanitized.replace(/[^a-zA-Z0-9_-]/g, '');

  // Ensure minimum and maximum length
  if (sanitized.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }

  if (sanitized.length > 30) {
    sanitized = sanitized.substring(0, 30);
  }
  
  return sanitized;
};

/**
 * Sanitize review content
 * @param {string} content - Review content to sanitize
 * @returns {string} - Sanitized content
 */
export const sanitizeReviewContent = (content) => {
  if (typeof content !== 'string') return '';
  
  return sanitizeText(content, {
    maxLength: 5000,
    allowNewlines: true,
    allowSpecialChars: true,
    trim: true,
  });
};

/**
 * Sanitize search query
 * @param {string} query - Search query to sanitize
 * @returns {string} - Sanitized query
 */
export const sanitizeSearchQuery = (query) => {
  if (typeof query !== 'string') return '';
  
  return sanitizeText(query, {
    maxLength: 200,
    allowNewlines: false,
    allowSpecialChars: false,
    trim: true,
  });
};

/**
 * Sanitize location name
 * @param {string} location - Location name to sanitize
 * @returns {string} - Sanitized location
 */
export const sanitizeLocation = (location) => {
  if (typeof location !== 'string') return '';
  
  return sanitizeText(location, {
    maxLength: 100,
    allowNewlines: false,
    allowSpecialChars: true,
    trim: true,
  });
};

/**
 * Validate and sanitize form data
 * @param {object} formData - Form data object
 * @param {object} schema - Validation schema
 * @returns {object} - Sanitized form data
 */
export const sanitizeFormData = (formData, schema) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(formData)) {
    const fieldSchema = schema[key];
    
    if (!fieldSchema) {
      continue; // Skip unknown fields
    }
    
    try {
      switch (fieldSchema.type) {
        case 'email':
          sanitized[key] = sanitizeEmail(value);
          break;
        case 'username':
          sanitized[key] = sanitizeUsername(value);
          break;
        case 'text':
          sanitized[key] = sanitizeText(value, fieldSchema.options);
          break;
        case 'review':
          sanitized[key] = sanitizeReviewContent(value);
          break;
        case 'search':
          sanitized[key] = sanitizeSearchQuery(value);
          break;
        case 'location':
          sanitized[key] = sanitizeLocation(value);
          break;
        default:
          sanitized[key] = sanitizeText(value);
      }
    } catch (error) {
      throw new Error(`Validation error for field ${key}: ${error.message}`);
    }
  }
  
  return sanitized;
};

/**
 * Rate limiting helper
 * @param {string} key - Unique key for rate limiting
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - Whether request is allowed
 */
export const checkRateLimit = (key, maxRequests = 10, windowMs = 60000) => {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Get existing requests from storage (in a real app, use Redis or similar)
  const storageKey = `rateLimit_${key}`;
  const existingRequests = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
  // Filter out old requests
  const recentRequests = existingRequests.filter(timestamp => timestamp > windowStart);
  
  // Check if limit exceeded
  if (recentRequests.length >= maxRequests) {
    return false;
  }
  
  // Add current request
  recentRequests.push(now);
  localStorage.setItem(storageKey, JSON.stringify(recentRequests));
  
  return true;
};

/**
 * Comprehensive input validation for anonymous app
 * @param {object} data - Data to validate
 * @param {string} type - Type of validation (signup, review, search, etc.)
 * @returns {{isValid: boolean, data: object, errors: string[]}} - Validation result
 */
export const validateInput = (data, type) => {
  const schemas = {
    signup: {
      email: { type: 'email', required: true },
      password: { type: 'text', required: true, options: { maxLength: 128 } },
    },
    review: {
      content: { type: 'review', required: true },
      targetName: { type: 'text', required: true, options: { maxLength: 100 } },
      category: { type: 'text', required: true, options: { maxLength: 50 } },
      location: { type: 'location', required: false },
    },
    search: {
      query: { type: 'search', required: true },
      category: { type: 'text', required: false, options: { maxLength: 50 } },
      location: { type: 'location', required: false },
    },
    profile: {
      name: { type: 'username', required: true },
      bio: { type: 'text', required: false, options: { maxLength: 500 } },
    },
  };
  
  const schema = schemas[type];
  if (!schema) {
    throw new Error(`Unknown validation type: ${type}`);
  }
  
  // Check required fields
  for (const [field, config] of Object.entries(schema)) {
    if (config.required && (!data[field] || data[field].trim() === '')) {
      // Use more user-friendly field names
      const friendlyNames = {
        email: 'Email',
        password: 'Password',
        name: 'Username',
        content: 'Review content',
        targetName: 'Person name',
        category: 'Category',
        query: 'Search query',
        bio: 'Bio'
      };
      const friendlyName = friendlyNames[field] || field;
      throw new Error(`${friendlyName} is required`);
    }
  }
  
  // Sanitize data
  const sanitizedData = sanitizeFormData(data, schema);
  
  return {
    isValid: true,
    data: sanitizedData,
    errors: [],
  };
};

export default {
  sanitizeHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizeUsername,
  sanitizeReviewContent,
  sanitizeSearchQuery,
  sanitizeLocation,
  sanitizeFormData,
  checkRateLimit,
  validateInput,
};
