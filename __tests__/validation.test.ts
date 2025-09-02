import { containsProfanity } from '../utils/validation';

describe('containsProfanity', () => {
  it('should return false for clean text', () => {
    expect(containsProfanity('This is a nice message')).toBe(false);
  });

  it('should return true for profane text', () => {
    expect(containsProfanity('This is a shitty message')).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(containsProfanity('')).toBe(false);
  });

  it('should return false for null input', () => {
    // @ts-expect-error: Testing null input handling for containsProfanity
    expect(containsProfanity(null)).toBe(false);
  });

  it('should return false for undefined input', () => {
    // @ts-expect-error: Testing undefined input handling for containsProfanity
    expect(containsProfanity(undefined)).toBe(false);
  });
});
