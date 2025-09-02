import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';

class AnalyticsService {
  private userId: string | null = null;
  private sessionId: string;
  private events: any[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadUserId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private async loadUserId(): Promise<void> {
    try {
      const id = await AsyncStorage.getItem('@analytics_user_id');
      this.userId = id;
    } catch (error) {
      __DEV__ && console.error('Error loading user ID:', error);
    }
  }

  // Identify user
  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    this.userId = userId;
    try {
      await AsyncStorage.setItem('@analytics_user_id', userId);
      
      if (__DEV__) {
        __DEV__ && console.log('Analytics: User identified', { userId, traits });
      }
      
      // In production, send to analytics service
      this.trackEvent('user_identified', { ...traits });
    } catch (error) {
      __DEV__ && console.error('Error identifying user:', error);
    }
  }

  // Track event
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    const event = {
      name: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: new Date().toISOString(),
      },
    };

    this.events.push(event);

    if (__DEV__) {
      __DEV__ && console.log('Analytics Event:', event);
    }

    // In production, send to analytics service (e.g., Firebase Analytics, Mixpanel, etc.)
    this.sendEvent(event);
  }

  // Track screen view
  trackScreenView(screenName: string, properties?: Record<string, any>): void {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  // Track user action
  trackAction(action: string, category: string, label?: string, value?: number): void {
    this.trackEvent('user_action', {
      action,
      category,
      label,
      value,
    });
  }

  // Track timing
  trackTiming(category: string, variable: string, time: number, label?: string): void {
    this.trackEvent('timing', {
      category,
      variable,
      time,
      label,
    });
  }

  // Track error
  trackError(error: Error | string, fatal: boolean = false): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.trackEvent('error', {
      error_message: errorMessage,
      error_stack: errorStack,
      fatal,
    });
  }

  // Track purchase
  trackPurchase(productId: string, amount: number, currency: string = 'USD'): void {
    this.trackEvent('purchase', {
      product_id: productId,
      amount,
      currency,
    });
  }

  // Track search
  trackSearch(query: string, results: number): void {
    this.trackEvent('search', {
      query,
      results_count: results,
    });
  }

  // Track share
  trackShare(contentType: string, contentId: string, method: string): void {
    this.trackEvent('share', {
      content_type: contentType,
      content_id: contentId,
      method,
    });
  }

  // Track signup
  trackSignup(method: string): void {
    this.trackEvent('sign_up', { method });
  }

  // Track login
  trackLogin(method: string): void {
    this.trackEvent('login', { method });
  }

  // Track logout
  trackLogout(): void {
    this.trackEvent('logout', {});
  }

  // Set user property
  setUserProperty(name: string, value: any): void {
    if (__DEV__) {
      __DEV__ && console.log('Analytics: User property set', { name, value });
    }
    
    // In production, send to analytics service
  }

  // Reset analytics (on logout)
  reset(): void {
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.events = [];
    AsyncStorage.removeItem('@analytics_user_id').catch(console.error);
  }

  // Send event to analytics service (implement based on your analytics provider)
  private async sendEvent(event: any): Promise<void> {
    // In production, implement sending to your analytics service
    // For example, Firebase Analytics, Mixpanel, Amplitude, etc.
    
    // Example implementation:
    // try {
    //   await fetch('https://your-analytics-endpoint.com/events', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(event),
    //   });
    // } catch (error) {
    //   __DEV__ && console.error('Error sending analytics event:', error);
    // }
  }

  // Flush events (send all pending events)
  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    // In production, batch send events to analytics service
    if (__DEV__) {
      __DEV__ && console.log('Analytics: Flushing events', eventsToSend);
    }
  }
}

export const analyticsService = new AnalyticsService();