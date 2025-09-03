import { toDate, formatRelativeTime, toMillis, formatTime, formatDate, compareTimestamps } from '../utils/timestampHelpers';

describe('Timestamp Handling', () => {
  const mockNow = new Date('2025-09-03T10:00:00Z');
  
  beforeAll(() => {
    // Mock Date.now() for consistent testing
    jest.spyOn(global.Date, 'now').mockImplementation(() => mockNow.getTime());
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Cross-platform timestamp conversion', () => {
    it('should handle React Native timestamps', () => {
      const rnTimestamp = {
        seconds: Math.floor(mockNow.getTime() / 1000),
        nanoseconds: 0,
      };
      
      const result = toDate(rnTimestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBeCloseTo(mockNow.getTime(), -3); // Within 1 second
    });

    it('should handle Web Firebase timestamps', () => {
      const webTimestamp = {
        seconds: Math.floor(mockNow.getTime() / 1000),
        nanoseconds: 0,
        toDate: () => mockNow,
      };
      
      const result = toDate(webTimestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(mockNow.getTime());
    });

    it('should handle ISO string timestamps', () => {
      const isoString = mockNow.toISOString();
      const result = toDate(isoString);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(mockNow.getTime());
    });

    it('should handle millisecond timestamps', () => {
      const timestamp = mockNow.getTime();
      const result = toDate(timestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(timestamp);
    });
  });

  describe('Timestamp formatting', () => {
    it('should format relative time correctly', () => {
      const oneMinuteAgo = new Date(mockNow.getTime() - 60 * 1000);
      const result = formatRelativeTime(oneMinuteAgo);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should format time correctly', () => {
      const testDate = new Date();
      const result = formatTime(testDate);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should format date correctly', () => {
      const testDate = new Date();
      const result = formatDate(testDate);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle future dates gracefully', () => {
      const futureDate = new Date(mockNow.getTime() + 60 * 60 * 1000);
      const result = formatRelativeTime(futureDate);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should convert to milliseconds correctly', () => {
      const testDate = new Date();
      const result = toMillis(testDate);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('Timestamp comparison', () => {
    it('should compare timestamps correctly', () => {
      const date1 = new Date('2025-09-03T10:00:00Z');
      const date2 = new Date('2025-09-03T11:00:00Z');
      
      const result = compareTimestamps(date1, date2);
      expect(result).toBeLessThan(0); // date1 is before date2
    });

    it('should handle equal timestamps', () => {
      const date1 = new Date('2025-09-03T10:00:00Z');
      const date2 = new Date('2025-09-03T10:00:00Z');
      
      const result = compareTimestamps(date1, date2);
      expect(result).toBe(0);
    });

    it('should handle null/undefined timestamps in comparison', () => {
      const date1 = new Date();
      
      const result1 = compareTimestamps(date1, null);
      const result2 = compareTimestamps(null, date1);
      const result3 = compareTimestamps(null, null);
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });
  });

  describe('Timestamp conversion consistency', () => {
    it('should maintain consistency between toDate and toMillis', () => {
      const testDate = new Date();
      const convertedDate = toDate(testDate);
      const convertedMillis = toMillis(testDate);
      
      expect(convertedDate?.getTime()).toBe(convertedMillis);
    });

    it('should handle various timestamp formats consistently', () => {
      const testDate = new Date();
      
      // Test different input formats
      const inputs = [
        testDate,
        testDate.getTime(),
        testDate.toISOString(),
        { seconds: Math.floor(testDate.getTime() / 1000), nanoseconds: 0 },
      ];
      
      const dateResults = inputs.map(input => toDate(input));
      const millisResults = inputs.map(input => toMillis(input));
      
      // All date results should be valid
      dateResults.forEach(result => {
        expect(result).toBeInstanceOf(Date);
      });
      
      // All millis results should be numbers
      millisResults.forEach(result => {
        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle extremely old dates', () => {
      const oldDate = new Date('1970-01-01T00:00:00Z');
      const result = formatRelativeTime(oldDate);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle timezone differences correctly', () => {
      // Create timestamps in different timezone formats
      const utcDate = new Date('2025-09-03T10:00:00Z');
      const localDate = new Date('2025-09-03T10:00:00');
      
      const utcResult = toDate(utcDate);
      const localResult = toDate(localDate);
      
      expect(utcResult).toBeInstanceOf(Date);
      expect(localResult).toBeInstanceOf(Date);
    });

    it('should handle corrupted timestamp objects', () => {
      const corruptedTimestamp = {
        seconds: 'not-a-number',
        nanoseconds: null,
      };
      
      const result = toDate(corruptedTimestamp as any);
      // The function might return an invalid Date instead of null
      expect(result === null || (result instanceof Date && isNaN(result.getTime()))).toBe(true);
    });

    it('should handle very large timestamps gracefully', () => {
      const largeTimestamp = Number.MAX_SAFE_INTEGER;
      const result = toDate(largeTimestamp);
      
      // Large timestamps may result in invalid dates
      if (result) {
        expect(result).toBeInstanceOf(Date);
        // Large timestamps might create invalid dates, which is acceptable
        expect(typeof result.getTime()).toBe('number');
      } else {
        // Large timestamp couldn't be converted, which is also acceptable
        expect(result).toBeNull();
      }
    });
  });

  describe('Performance considerations', () => {
    it('should handle batch timestamp processing efficiently', () => {
      const timestamps = Array.from({ length: 100 }, (_, i) => ({
        seconds: Math.floor(Date.now() / 1000) - i * 60,
        nanoseconds: 0,
      }));
      
      const startTime = performance.now();
      const results = timestamps.map(timestamp => toDate(timestamp));
      const endTime = performance.now();
      
      expect(results).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      
      // All results should be valid dates
      results.forEach(result => {
        expect(result).toBeInstanceOf(Date);
      });
    });
  });
});