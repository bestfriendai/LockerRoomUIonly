/**
 * Anonymous Username Generator Service for LockerRoom Talk App
 * Generates unique, anonymous usernames for dating review platform
 */

import { uniqueNamesGenerator, adjectives, colors, animals, names } from 'unique-names-generator';
import logger from '../utils/logger';

// Anonymous-themed adjectives for dating app
const anonymousAdjectives = [
  'mysterious', 'anonymous', 'hidden', 'secret', 'phantom', 'shadow', 'silent', 
  'whispered', 'veiled', 'masked', 'enigmatic', 'cryptic', 'covert', 'discreet',
  'incognito', 'stealthy', 'elusive', 'obscure', 'unknown', 'nameless', 'cloaked',
  'concealed', 'private', 'confidential', 'undercover', 'invisible', 'ghostly'
];

// Dating and romance themed terms
const datingTerms = [
  'dater', 'reviewer', 'matcher', 'seeker', 'explorer', 'wanderer', 'dreamer',
  'romantic', 'charmer', 'flirt', 'admirer', 'lover', 'heart', 'soul', 'spirit',
  'cupid', 'angel', 'star', 'moon', 'sun', 'flame', 'spark', 'gem', 'pearl',
  'rose', 'lily', 'iris', 'sage', 'phoenix', 'raven', 'dove', 'butterfly'
];

// Mystical and fantasy elements
const mysticalTerms = [
  'wizard', 'mage', 'oracle', 'mystic', 'sage', 'prophet', 'seer', 'witch',
  'fairy', 'elf', 'dragon', 'unicorn', 'phoenix', 'griffin', 'sphinx', 'titan',
  'knight', 'guardian', 'sentinel', 'keeper', 'watcher', 'hunter', 'ranger'
];

// Positive personality traits
const personalityTraits = [
  'kind', 'gentle', 'wise', 'brave', 'bold', 'clever', 'witty', 'charming',
  'graceful', 'elegant', 'noble', 'loyal', 'honest', 'sincere', 'genuine',
  'passionate', 'vibrant', 'radiant', 'brilliant', 'luminous', 'serene'
];

/**
 * Generate a single anonymous username
 * @param {Object} options - Configuration options
 * @returns {string} Generated username
 */
export const generateAnonymousUsername = (options = {}) => {
  const {
    style = 'capital',
    separator = '',
    length = 3,
    theme = 'dating'
  } = options;

  let dictionaries;
  
  switch (theme) {
    case 'mystical':
      dictionaries = [anonymousAdjectives, colors, mysticalTerms];
      break;
    case 'personality':
      dictionaries = [personalityTraits, colors, datingTerms];
      break;
    case 'nature':
      dictionaries = [anonymousAdjectives, colors, animals];
      break;
    case 'dating':
    default:
      dictionaries = [anonymousAdjectives, colors, datingTerms];
      break;
  }

  const config = {
    dictionaries,
    separator,
    style,
    length,
  };
  
  return uniqueNamesGenerator(config);
};

/**
 * Generate multiple username options
 * @param {number} count - Number of usernames to generate
 * @param {Object} options - Configuration options
 * @returns {Array<string>} Array of generated usernames
 */
export const generateMultipleUsernames = (count = 5, options = {}) => {
  const usernames = new Set(); // Use Set to avoid duplicates
  const themes = ['dating', 'mystical', 'personality', 'nature'];
  
  while (usernames.size < count) {
    // Rotate through different themes for variety
    const theme = themes[usernames.size % themes.length];
    const username = generateAnonymousUsername({ ...options, theme });
    usernames.add(username);
  }
  
  return Array.from(usernames);
};

/**
 * Generate username with specific characteristics
 * @param {Object} preferences - User preferences
 * @returns {string} Generated username
 */
export const generateCustomUsername = (preferences = {}) => {
  const {
    mood = 'neutral', // happy, mysterious, romantic, adventurous
    length = 'medium', // short, medium, long
    includeNumbers = false,
    style = 'capital'
  } = preferences;

  let dictionaries;
  let wordLength;

  // Set word length based on preference
  switch (length) {
    case 'short':
      wordLength = 2;
      break;
    case 'long':
      wordLength = 4;
      break;
    case 'medium':
    default:
      wordLength = 3;
      break;
  }

  // Select dictionaries based on mood
  switch (mood) {
    case 'happy':
      dictionaries = [personalityTraits, colors, datingTerms];
      break;
    case 'mysterious':
      dictionaries = [anonymousAdjectives, colors, mysticalTerms];
      break;
    case 'romantic':
      dictionaries = [personalityTraits, colors, datingTerms];
      break;
    case 'adventurous':
      dictionaries = [anonymousAdjectives, colors, animals];
      break;
    default:
      dictionaries = [anonymousAdjectives, colors, datingTerms];
      break;
  }

  const config = {
    dictionaries,
    separator: '',
    style,
    length: wordLength,
  };
  
  let username = uniqueNamesGenerator(config);

  // Add random numbers if requested
  if (includeNumbers) {
    const randomNum = Math.floor(Math.random() * 999) + 1;
    username += randomNum;
  }
  
  return username;
};

/**
 * Validate username availability (placeholder for future implementation)
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} Whether username is available
 */
export const checkUsernameAvailability = async (username) => {
  // TODO: Implement actual database check
  // For now, just check basic criteria
  if (!username || username.length < 3 || username.length > 30) {
    return false;
  }
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demo purposes, randomly return availability
  return Math.random() > 0.3; // 70% chance of being available
};

/**
 * Get username suggestions based on existing username
 * @param {string} baseUsername - Base username to modify
 * @returns {Array<string>} Array of similar usernames
 */
export const getUsernameSuggestions = (baseUsername) => {
  if (!baseUsername) {
    return generateMultipleUsernames(5);
  }
  
  const suggestions = [];
  
  // Add variations with numbers
  for (let i = 1; i <= 3; i++) {
    suggestions.push(`${baseUsername}${Math.floor(Math.random() * 999) + 1}`);
  }
  
  // Add completely new suggestions
  const newSuggestions = generateMultipleUsernames(2);
  suggestions.push(...newSuggestions);
  
  return suggestions;
};

/**
 * Advanced AI-powered username generation (requires OpenAI API)
 * @param {Object} preferences - User preferences and context
 * @returns {Promise<string>} AI-generated username
 */
export const generateAIUsername = async (preferences = {}) => {
  const {
    style = 'mysterious',
    theme = 'dating',
    personality = 'friendly',
    interests = []
  } = preferences;
  
  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    if (__DEV__) {
      __DEV__ && console.warn('OpenAI API key not found, falling back to standard generation');
    }
    return generateAnonymousUsername({ theme });
  }
  
  try {
    const prompt = `Generate a creative, anonymous username for a dating review app user. 
    Style: ${style}
    Theme: ${theme}
    Personality: ${personality}
    Interests: ${interests.join(', ')}
    
    Requirements:
    - Must be anonymous and not reveal personal information
    - Should be memorable and unique
    - 3-20 characters long
    - Suitable for a dating review platform
    - Should sound ${style} and ${personality}
    
    Return only the username, no explanation.`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a creative username generator for anonymous dating app users. Generate unique, memorable usernames that maintain anonymity.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 20,
        temperature: 0.8,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiUsername = data.choices[0]?.message?.content?.trim();
    
    if (aiUsername && aiUsername.length >= 3 && aiUsername.length <= 30) {
      return aiUsername;
    } else {
      throw new Error('Invalid AI-generated username');
    }
  } catch (error) {
    if (__DEV__) {
      __DEV__ && console.error('AI username generation failed:', error);
    }
    // Fallback to standard generation
    return generateAnonymousUsername({ theme });
  }
};

/**
 * Get username statistics and insights
 * @param {string} username - Username to analyze
 * @returns {Object} Username analysis
 */
export const analyzeUsername = (username) => {
  if (!username) {
    return { isValid: false, errors: ['Username is required'] };
  }
  
  const analysis = {
    isValid: true,
    length: username.length,
    hasNumbers: /\d/.test(username),
    hasSpecialChars: /[^a-zA-Z0-9]/.test(username),
    anonymityScore: 0,
    memorabilityScore: 0,
    errors: [],
    suggestions: []
  };
  
  // Validate length
  if (username.length < 3) {
    analysis.isValid = false;
    analysis.errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 30) {
    analysis.isValid = false;
    analysis.errors.push('Username must be no more than 30 characters long');
  }
  
  // Check for invalid characters
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    analysis.isValid = false;
    analysis.errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  // Calculate anonymity score (higher is more anonymous)
  const anonymousWords = [...anonymousAdjectives, ...mysticalTerms];
  const hasAnonymousWords = anonymousWords.some(word => 
    username.toLowerCase().includes(word.toLowerCase())
  );
  
  analysis.anonymityScore = hasAnonymousWords ? 8 : 5;
  if (analysis.hasNumbers) analysis.anonymityScore += 1;
  if (username.length > 10) analysis.anonymityScore += 1;
  
  // Calculate memorability score (balance between unique and memorable)
  analysis.memorabilityScore = Math.min(10, username.length);
  if (hasAnonymousWords) analysis.memorabilityScore += 2;
  if (!analysis.hasSpecialChars) analysis.memorabilityScore += 1;
  
  return analysis;
};

export default {
  generateAnonymousUsername,
  generateMultipleUsernames,
  generateCustomUsername,
  checkUsernameAvailability,
  getUsernameSuggestions,
  generateAIUsername,
  analyzeUsername,
};
