// Moderation service for content checking
class ModerationService {
  private bannedWords: string[] = [
    // Add actual banned words in production
    // This is just a placeholder list
    'spam',
    'abuse',
  ];

  private suspiciousPatterns = {
    urls: /https?:\/\/[^\s]+/gi,
    emails: /[^\s]+@[^\s]+\.[^\s]+/gi,
    phoneNumbers: /(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}/gi,
    socialHandles: /@[a-zA-Z0-9_]+/gi,
  };

  // Check content for violations
  async checkContent(content: string): Promise<{
    approved: boolean;
    requiresManualReview: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    let requiresManualReview = false;

    // Check for banned words
    const lowercaseContent = content.toLowerCase();
    for (const word of this.bannedWords) {
      if (lowercaseContent.includes(word.toLowerCase())) {
        reasons.push(`Contains banned word: ${word}`);
      }
    }

    // Check for suspicious patterns
    if (this.suspiciousPatterns.urls.test(content)) {
      reasons.push('Contains URLs');
      requiresManualReview = true;
    }

    if (this.suspiciousPatterns.emails.test(content)) {
      reasons.push('Contains email addresses');
      requiresManualReview = true;
    }

    if (this.suspiciousPatterns.phoneNumbers.test(content)) {
      reasons.push('Contains phone numbers');
      requiresManualReview = true;
    }

    // Check for excessive caps (shouting)
    const capsRatio = this.getCapsRatio(content);
    if (capsRatio > 0.5 && content.length > 20) {
      reasons.push('Excessive use of capital letters');
    }

    // Check for spam patterns
    if (this.isSpamPattern(content)) {
      reasons.push('Potential spam content');
      requiresManualReview = true;
    }

    // Check content length
    if (content.length < 10) {
      reasons.push('Content too short');
    }

    if (content.length > 5000) {
      reasons.push('Content too long');
    }

    return {
      approved: reasons.length === 0,
      requiresManualReview,
      reasons,
    };
  }

  // Extract tags from content
  extractTags(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
      'they', 'them', 'their', 'what', 'which', 'who', 'when', 'where', 'why',
      'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
      'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
      'too', 'very', 'just',
    ]);

    const tags = words
      .filter(word => word.length > 3 && !commonWords.has(word))
      .filter((word, index, self) => self.indexOf(word) === index) // Remove duplicates
      .slice(0, 10); // Limit to 10 tags

    return tags;
  }

  // Check if content is appropriate for age
  isAgeAppropriate(content: string): boolean {
    // Basic implementation - enhance with actual content analysis
    const inappropriatePatterns: string[] = [
      // Add patterns for age-inappropriate content
    ];

    for (const pattern of inappropriatePatterns) {
      if (new RegExp(pattern, 'gi').test(content)) {
        return false;
      }
    }

    return true;
  }

  // Sanitize content
  sanitizeContent(content: string): string {
    // Remove HTML tags
    let sanitized = content.replace(/<[^>]*>/g, '');
    
    // Remove script tags and content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove style tags and content
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove dangerous attributes
    sanitized = sanitized.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*'[^']*'/gi, '');
    
    // Trim excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    
    return sanitized;
  }

  // Calculate sentiment score (basic implementation)
  getSentimentScore(content: string): number {
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'love', 'like', 'best', 'perfect', 'beautiful', 'awesome',
    ];
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate',
      'dislike', 'ugly', 'disgusting', 'poor', 'disappointing',
    ];
    
    const lowercaseContent = content.toLowerCase();
    let score = 0;
    
    for (const word of positiveWords) {
      if (lowercaseContent.includes(word)) {
        score += 1;
      }
    }
    
    for (const word of negativeWords) {
      if (lowercaseContent.includes(word)) {
        score -= 1;
      }
    }
    
    // Normalize score between -1 and 1
    const maxScore = Math.max(positiveWords.length, negativeWords.length);
    return Math.max(-1, Math.min(1, score / maxScore));
  }

  // Private helper methods
  private getCapsRatio(text: string): number {
    const letters = text.replace(/[^a-zA-Z]/g, '');
    if (letters.length === 0) return 0;
    
    const caps = letters.replace(/[^A-Z]/g, '');
    return caps.length / letters.length;
  }

  private isSpamPattern(content: string): boolean {
    // Check for repetitive patterns
    const words = content.toLowerCase().split(/\s+/);
    const wordCount: Record<string, number> = {};
    
    for (const word of words) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
    
    // If any word appears more than 5 times, might be spam
    for (const count of Object.values(wordCount)) {
      if (count > 5) return true;
    }
    
    // Check for excessive punctuation
    const punctuationCount = (content.match(/[!?]{2,}/g) || []).length;
    if (punctuationCount > 3) return true;
    
    // Check for all caps sentences
    const sentences = content.split(/[.!?]+/);
    const allCapsSentences = sentences.filter(s => 
      s.trim().length > 10 && s === s.toUpperCase()
    );
    if (allCapsSentences.length > 2) return true;
    
    return false;
  }

  // Check if user should be flagged for manual review
  shouldFlagUser(reviewCount: number, reportCount: number): boolean {
    // Flag if user has high report to review ratio
    if (reviewCount > 0 && reportCount / reviewCount > 0.3) {
      return true;
    }
    
    // Flag if user has many reports
    if (reportCount > 5) {
      return true;
    }
    
    return false;
  }

  // Generate content warning labels
  getContentWarnings(content: string): string[] {
    const warnings: string[] = [];
    
    // Check for potentially sensitive topics
    const sensitiveTopics = {
      'violence': ['fight', 'hit', 'punch', 'assault'],
      'explicit': ['sex', 'nude', 'explicit'],
      'substance': ['drug', 'alcohol', 'drunk'],
    };
    
    const lowercaseContent = content.toLowerCase();
    
    for (const [warning, keywords] of Object.entries(sensitiveTopics)) {
      for (const keyword of keywords) {
        if (lowercaseContent.includes(keyword)) {
          warnings.push(warning);
          break;
        }
      }
    }
    
    return warnings;
  }
}

export const moderationService = new ModerationService();