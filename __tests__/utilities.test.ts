import { toDate } from '../utils/timestampHelpers';
import { formatNumber, formatRelativeDate } from '../utils/format';
import { containsProfanity } from '../utils/validation';

// Mock Firebase timestamp for testing
const mockTimestamp = {
  seconds: Math.floor(Date.now() / 1000),
  nanoseconds: 0,
  toDate: () => new Date(),
};

describe('Timestamp Helpers', () => {
  describe('toDate', () => {
    it('should handle Date objects', () => {
      const testDate = new Date();
      const result = toDate(testDate);
      expect(result).toBeInstanceOf(Date);
      expect(result).toBe(testDate);
    });

    it('should handle Firestore Timestamp objects', () => {
      const result = toDate(mockTimestamp);
      expect(result).toBeInstanceOf(Date);
    });

    it('should handle number timestamps', () => {
      const timestamp = Date.now();
      const result = toDate(timestamp);
      expect(result).toBeInstanceOf(Date);
    });

    it('should handle null/undefined gracefully', () => {
      expect(toDate(null)).toBeNull();
      expect(toDate(undefined)).toBeNull();
    });

    it('should handle plain object with seconds', () => {
      const plainTimestamp = { seconds: Math.floor(Date.now() / 1000) };
      const result = toDate(plainTimestamp);
      expect(result).toBeInstanceOf(Date);
    });
  });
});

describe('Format Utils', () => {
  describe('formatNumber', () => {
    it('should format large numbers with suffixes', () => {
      expect(formatNumber(1000)).toMatch(/1(\.\d)?K/);
      expect(formatNumber(1000000)).toMatch(/1(\.\d)?M/);
      expect(formatNumber(1000000000)).toMatch(/1(\.\d)?B/);
    });

    it('should handle small numbers', () => {
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      const result = formatNumber(-1000);
      expect(result).toContain('-');
      expect(result).toContain('K');
    });
  });

  describe('formatRelativeDate', () => {
    it('should format recent dates', () => {
      const now = new Date();
      const result = formatRelativeDate(now);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle string dates', () => {
      const dateString = '2025-09-03T10:00:00Z';
      const result = formatRelativeDate(dateString);
      expect(typeof result).toBe('string');
    });
  });
});

describe('Validation Utils', () => {
  describe('containsProfanity', () => {
    it('should return false for clean text', () => {
      expect(containsProfanity('This is a clean message')).toBe(false);
    });

    it('should return true for profane text', () => {
      expect(containsProfanity('This contains shit')).toBe(true);
    });

    it('should handle empty strings', () => {
      expect(containsProfanity('')).toBe(false);
    });

    it('should handle null/undefined', () => {
      expect(containsProfanity(null as any)).toBe(false);
      expect(containsProfanity(undefined as any)).toBe(false);
    });
  });
});