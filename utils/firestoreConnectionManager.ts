import { 
  onSnapshot, 
  Query, 
  QuerySnapshot, 
  Unsubscribe, 
  FirestoreError,
  DocumentData,
  getDocs
} from 'firebase/firestore';
import { networkManager } from './networkStatus';
import type { NetInfoState } from '@react-native-community/netinfo';
import { firestorePollingFallback } from './firestorePollingFallback';

export interface ConnectionState {
  isConnected: boolean;
  isReconnecting?: boolean;
  isOffline: boolean;
  isSlowConnection: boolean;
  lastError?: FirestoreError | null;
  reconnectAttempts?: number;
  networkStatus: 'online' | 'offline' | 'slow';
  lastPing?: number;
  error?: string | null;
}

interface ListenerConfig {
  query: any;
  onNext: (snapshot: unknown) => void;
  onError?: (error: FirestoreError) => void;
  maxRetries?: number;
  retryDelay?: number;
}

interface ActiveListener {
  id: string;
  query: Query<DocumentData>;
  onNext: (snapshot: QuerySnapshot<DocumentData>) => void;
  onError?: (error: FirestoreError) => void;
  maxRetries?: number;
  retryDelay?: number;
  unsubscribe: Unsubscribe | (() => void) | null;
  retryCount: number;
  isActive: boolean;
  lastError: FirestoreError | null;
  fallbackToPolling?: boolean;
  pollingInterval?: ReturnType<typeof setTimeout>;
  isPolling: boolean;
  isUsingPollingFallback: boolean;
  consecutiveNetworkErrors: number;
  hasReceivedData?: boolean;
  connectionTimeout?: ReturnType<typeof setTimeout>;
}

export class FirestoreConnectionManager {
  private static instance: FirestoreConnectionManager;
  private connectionState: ConnectionState = {
    isConnected: true,
    isReconnecting: false,
    isOffline: false,
    isSlowConnection: false,
    lastError: null,
    reconnectAttempts: 0,
    networkStatus: networkManager.isConnected() ? 'online' : 'offline'
  };

  private activeListeners: Map<string, ActiveListener> = new Map();
  private connectionStateCallbacks: Set<(state: ConnectionState) => void> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private baseRetryDelay = 1000;
  private maxRetryDelay = 30000;
  private pollingInterval = 30000;
  private networkStatusUnsubscribe?: () => void;
  private connectionPool = new Map<string, any>();
  private maxConcurrentConnections = 5;
  private connectionAttempts = 0;
  private lastSuccessfulConnection = 0;
  private backoffMultiplier = 1.5;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastDataReceived: number = Date.now();
  private healthCheckTimeout = 15000;
  private consecutiveNetworkErrors: number = 0;
  private maxConsecutiveErrors: number = 3;
  private isPollingFallbackActive: boolean = false;
  
  // Connection pooling properties
  private maxConnections: number = 5;
  private connectionTimeout: number = 30000;
  private connectionCleanupInterval: NodeJS.Timeout | null = null;
  private circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private circuitBreakerTimeout = 60000; // 1 minute
  private maxFailures = 5;
  private adaptivePollingInterval = 5000; // Start with 5 seconds
  private maxPollingInterval = 60000; // Max 1 minute
  private networkQuality: 'good' | 'poor' | 'offline' = 'good';
  private consecutiveAbortedRequests = 0;

  constructor() {
    this.initializeNetworkStatusListener();
    this.lastSuccessfulConnection = Date.now();
    
    // Start in polling mode to avoid ERR_ABORTED errors
    this.circuitBreakerState = 'OPEN';
    this.networkQuality = 'poor';
    
    // Use NetInfo for network status instead of window events
    this.setupNetworkStatusListener();
    
    Promise.resolve().then(() => {
      if (typeof this.startHealthCheck === 'function') {
        this.startHealthCheck();
      } else {
        if (__DEV__) {
          console.error('[FirestoreConnectionManager] startHealthCheck method not found');
        }
      }
    });
    
    this.initializeConnectionPooling();
    
    if (__DEV__) {
      console.log('[FirestoreConnectionManager] Starting in polling mode to avoid ERR_ABORTED errors');
    }
    
    // Schedule a transition attempt to real-time after 45 seconds
    setTimeout(() => {
      this.attemptTransitionToRealtime();
    }, 45000);
  }
  
  /**
   * Attempt to transition from polling back to real-time listeners
   */
  private attemptTransitionToRealtime(): void {
    if (this.consecutiveAbortedRequests === 0 && this.consecutiveNetworkErrors === 0) {
      if (__DEV__) {
        console.log('[FirestoreConnectionManager] Attempting transition back to real-time listeners');
      }
      this.circuitBreakerState = 'HALF_OPEN';
      this.networkQuality = 'good';
      
      // Try to switch one listener back to real-time as a test
      const firstListener = Array.from(this.activeListeners.values())[0];
      if (firstListener && firstListener.isUsingPollingFallback) {
        this.switchListenerBackToRealtime(firstListener);
      }
    } else {
      if (__DEV__) {
        console.log('[FirestoreConnectionManager] Still have network errors, staying in polling mode');
      }
      // Try again in another 30 seconds
      setTimeout(() => {
        this.attemptTransitionToRealtime();
      }, 30000);
    }
  }

  /**
   * Switch a listener back from polling to real-time
   */
  private switchListenerBackToRealtime(listener: ActiveListener): void {
    if (!listener.isUsingPollingFallback) return;
    
    if (__DEV__) {
      console.log(`[FirestoreConnectionManager] Switching listener ${listener.id} back to real-time`);
    }
    
    // Stop polling
    firestorePollingFallback.stopPolling(listener.id);
    
    // Reset listener state
    listener.isUsingPollingFallback = false;
    listener.isPolling = false;
    listener.retryCount = 0;
    listener.consecutiveNetworkErrors = 0;
    
    // Start real-time listener
    this.startListener(listener);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): FirestoreConnectionManager {
    if (!FirestoreConnectionManager.instance) {
      FirestoreConnectionManager.instance = new FirestoreConnectionManager();
    }
    return FirestoreConnectionManager.instance;
  }

  /**
   * Initialize connection pooling system
   */
  private initializeConnectionPooling(): void {
    this.connectionCleanupInterval = setInterval(() => {
      this.cleanupStaleConnections();
    }, 60000);
    
    if (__DEV__) {
    
      console.log('[FirestoreConnectionManager] Connection pooling initialized');
    
    }
  }

  /**
   * Setup network error detection for ERR_ABORTED and other network issues
   */
  private setupNetworkStatusListener(): void {
    if (__DEV__) {
      console.log('[FirestoreConnectionManager] Setting up network status listener');
    }

    // Use networkManager instead of window events for React Native compatibility
    const listener = (state: NetInfoState) => {
      if (state.isConnected) {
        this.handleNetworkOnline();
      } else {
        this.handleNetworkOffline();
      }
    };

    networkManager.addListener(listener);

    // Store cleanup function
    this.networkStatusUnsubscribe = () => {
      networkManager.removeListener(listener);
    };
  }

  private setupNetworkErrorDetection(): void {
    if (__DEV__) {
      console.log('[FirestoreConnectionManager] Setting up network error detection');
    }

    // React Native doesn't have window.addEventListener, so we'll handle errors differently
    // Network errors will be caught in the Firestore operations themselves

    // React Native doesn't have window.fetch to override
    // Network errors will be handled in individual Firestore operations
    
    // Reset counter and improve network quality on successful operations
    setInterval(() => {
      if (this.lastDataReceived && Date.now() - this.lastDataReceived < 30000) {
        if (this.consecutiveAbortedRequests > 0) {
          if (__DEV__) {
            console.log('[FirestoreConnectionManager] Resetting consecutive aborted requests counter');
          }
          this.consecutiveAbortedRequests = 0;
        }
        this.updateNetworkQuality('good');
      } else if (Date.now() - (this.lastDataReceived || 0) > 120000) {
        this.updateNetworkQuality('offline');
      }
    }, 30000);
  }

  /**
   * Subscribe to a Firestore query with enhanced error handling and connection pooling
   */
  subscribe(
    listenerId: string,
    query: any,
    onNext: (snapshot: unknown) => void,
    onError?: (error: FirestoreError) => void,
    options: { maxRetries?: number; retryDelay?: number } = {}
  ): () => void {
    // Check circuit breaker state
    if (this.circuitBreakerState === 'OPEN') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure < this.circuitBreakerTimeout) {
        if (__DEV__) {
          console.warn('[FirestoreConnectionManager] Circuit breaker is OPEN, using polling fallback');
        }
        return this.createPollingSubscription(query, onNext, onError);
      } else {
        this.circuitBreakerState = 'HALF_OPEN';
        if (__DEV__) {
          console.log('[FirestoreConnectionManager] Circuit breaker moving to HALF_OPEN state');
        }
      }
    }
    
    if (__DEV__) {
    
      console.log(`[FirestoreConnectionManager] Creating subscription for listener: ${listenerId}`);
    
    }
    
    const listener: ActiveListener = {
      id: listenerId,
      query,
      onNext,
      onError,
      maxRetries: options.maxRetries || 5,
      retryDelay: options.retryDelay || this.baseRetryDelay,
      unsubscribe: null,
      retryCount: 0,
      isActive: true,
      lastError: null,
      fallbackToPolling: false,
      isPolling: false,
      isUsingPollingFallback: false,
      consecutiveNetworkErrors: 0,
      hasReceivedData: false
    };
    
    this.activeListeners.set(listenerId, listener);
    this.startListener(listener);
    
    return () => {
      this.unsubscribe(listenerId);
    };
  }

  /**
   * Start a listener with error handling
   */
  private startListener(listener: ActiveListener): void {
    if (!listener.isActive) return;
    
    // Always start with polling for the first 30 seconds or if we have any network issues
    const timeSinceStart = Date.now() - this.lastSuccessfulConnection;
    if (this.consecutiveAbortedRequests > 0 || this.circuitBreakerState === 'OPEN' || timeSinceStart < 30000) {
      if (__DEV__) {
        console.log(`[FirestoreConnectionManager] Starting listener ${listener.id} with polling (errors: ${this.consecutiveAbortedRequests}, circuit: ${this.circuitBreakerState}, time: ${timeSinceStart}ms)`);
      }
      this.switchToPollingFallback(listener.id);
      return;
    }
    
    try {
      // Set a timeout for the initial connection attempt
      const connectionTimeout = setTimeout(() => {
        if (__DEV__) {
          console.warn(`[FirestoreConnectionManager] Connection timeout for listener ${listener.id}, switching to polling`);
        }
        this.switchToPollingFallback(listener.id);
      }, 10000); // 10 second timeout
      
      listener.connectionTimeout = connectionTimeout;
      
      listener.unsubscribe = onSnapshot(
        listener.query,
        (snapshot) => {
          // Clear connection timeout on successful connection
          if (listener.connectionTimeout) {
            clearTimeout(listener.connectionTimeout);
            listener.connectionTimeout = undefined;
          }
          
          this.updateLastDataReceived();
          this.consecutiveNetworkErrors = 0;
          listener.consecutiveNetworkErrors = 0;
          listener.hasReceivedData = true;
          this.recordSuccess(); // Record successful operation for circuit breaker
          listener.onNext(snapshot);
        },
        (error) => {
          // Clear connection timeout on error
          if (listener.connectionTimeout) {
            clearTimeout(listener.connectionTimeout);
            listener.connectionTimeout = undefined;
          }
          this.handleListenerError(error, listener);
        }
      );
      
      if (__DEV__) {
        console.log(`[FirestoreConnectionManager] Real-time listener started: ${listener.id}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`[FirestoreConnectionManager] Failed to start listener ${listener.id}:`, error);
      }
      this.handleListenerError(error as FirestoreError, listener);
    }
  }

  /**
   * Handle listener errors with aggressive retry strategies
   */
  private handleListenerError(error: FirestoreError, listener: ActiveListener): void {
    if (__DEV__) {
      console.error(`[FirestoreConnectionManager] Listener error for ${listener.id}:`, error);
    }
    
    listener.lastError = error;
    listener.consecutiveNetworkErrors++;
    this.consecutiveNetworkErrors++;
    
    // Update circuit breaker
    this.recordFailure();
    
    const isNetworkAborted = this.isNetworkAborted(error);
    const isNetworkError = this.isNetworkError(error);
    const isTransientError = this.isTransientError(error);
    
    // Check for network-related errors - be more aggressive
    if (isNetworkAborted || isNetworkError) {
      this.consecutiveAbortedRequests++;
      this.updateNetworkQuality('poor');
      
      console.warn(`[FirestoreConnectionManager] Network error detected (${this.consecutiveAbortedRequests} consecutive). Circuit breaker state: ${this.circuitBreakerState}`);
      
      // Immediately switch to polling on any network error
      this.circuitBreakerState = 'OPEN';
      this.lastFailureTime = Date.now();
      if (__DEV__) {
        console.warn('[FirestoreConnectionManager] Circuit breaker OPENED due to network errors. Immediately switching all listeners to polling.');
      }
      this.switchAllListenersToPolling();
      return;
    }
    
    if (this.circuitBreakerState === 'OPEN') {
      if (__DEV__) {
        console.warn(`[FirestoreConnectionManager] Circuit breaker open for listener ${listener.id}, switching to polling`);
      }
      this.switchToPollingFallback(listener.id);
      return;
    }
    
    if (listener.retryCount < (listener.maxRetries || 8)) {
      listener.retryCount++;
      
      const delay = isTransientError 
        ? this.scheduleAggressiveRetry(listener.retryCount)
        : this.scheduleStandardRetry(listener.retryCount);
      
      setTimeout(() => {
        if (listener.isActive) {
          this.startListener(listener);
        }
      }, delay);
    } else {
      if (__DEV__) {
        console.error(`[FirestoreConnectionManager] Max retries exceeded for listener ${listener.id}`);
      }
      if (listener.onError) {
        listener.onError(error);
      }
    }
  }

  /**
   * Switch all listeners to polling fallback
   */
  private switchAllListenersToPolling(): void {
    if (__DEV__) {
      console.warn('[FirestoreConnectionManager] Switching ALL listeners to polling fallback due to persistent network errors');
    }
    
    for (const [listenerId] of this.activeListeners) {
      this.switchToPollingFallback(listenerId);
    }
  }

  private switchToPolling(): void {
    if (__DEV__) {
      console.log('[FirestoreConnectionManager] Switching to polling mode');
    }
    // Implementation would depend on how listeners are managed
    // This is a placeholder for the polling switch logic
  }

  /**
   * Switch a specific listener to polling fallback
   */
  private switchToPollingFallback(listenerId: string): void {
    const listener = this.activeListeners.get(listenerId);
    if (!listener || listener.isUsingPollingFallback) return;
    
    if (__DEV__) {
      console.log(`[FirestoreConnectionManager] Switching listener ${listenerId} to polling fallback`);
    }
    
    // Clear any existing connection timeout
    if (listener.connectionTimeout) {
      clearTimeout(listener.connectionTimeout);
      listener.connectionTimeout = undefined;
    }
    
    if (listener.unsubscribe) {
      try {
        listener.unsubscribe();
      } catch (error) {
        if (__DEV__) {
          console.warn(`[FirestoreConnectionManager] Error unsubscribing listener ${listenerId}:`, error);
        }
      }
      listener.unsubscribe = null;
    }
    
    listener.isUsingPollingFallback = true;
    listener.isPolling = true;
    
    // Use adaptive polling interval based on network quality - more aggressive
    const pollingInterval = this.networkQuality === 'good' ? 1500 : 
                           this.networkQuality === 'poor' ? 3000 : 8000;
    
    firestorePollingFallback.startPolling(
      listenerId,
      listener.query,
      listener.onNext,
      listener.onError || ((error: FirestoreError) => console.error('Polling error:', error)),
      pollingInterval,
      () => this.updateLastDataReceived() // Callback when data is received
    );
  }

  /**
   * Network error classification methods
   */
  private isNetworkAborted(error: unknown): boolean {
    const errorObj = error as any;
    const message = errorObj?.message || errorObj?.code || '';
    return message.includes('ERR_ABORTED') || message.includes('aborted');
  }

  private isNetworkError(error: unknown): boolean {
    const errorObj = error as any;
    const networkCodes = ['unavailable', 'deadline-exceeded', 'resource-exhausted'];
    return networkCodes.includes(errorObj?.code) || 
           errorObj?.message?.includes('network') ||
           errorObj?.message?.includes('timeout');
  }

  private isTransientError(error: unknown): boolean {
    const errorObj = error as any;
    const transientCodes = ['deadline-exceeded', 'resource-exhausted', 'internal'];
    return transientCodes.includes(errorObj?.code);
  }

  /**
   * Retry scheduling methods
   */
  private scheduleAggressiveRetry(retryCount: number): number {
    return Math.min(500 * Math.pow(1.5, retryCount), 5000);
  }

  private scheduleStandardRetry(retryCount: number): number {
    return Math.min(1000 * Math.pow(2, retryCount), 30000);
  }

  /**
   * Health check system
   */
  private startHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 5000);
    
    if (__DEV__) {
    
      console.log('[FirestoreConnectionManager] Health check system started');
    
    }
  }

  private performHealthCheck(): void {
    const now = Date.now();
    const timeSinceLastData = now - this.lastDataReceived;
    const hasRealtimeListeners = Array.from(this.activeListeners.values())
      .some(listener => listener.isActive && !listener.isUsingPollingFallback);
    
    if (this.connectionState.isConnected && hasRealtimeListeners && timeSinceLastData > this.healthCheckTimeout) {
      if (__DEV__) {
        console.warn('[FirestoreConnectionManager] Health check failed - no data received, switching to polling');
      }
      this.switchAllListenersToPolling();
    } else {
      if (__DEV__) {
        console.debug('[FirestoreConnectionManager] Health check passed');
      }
    }
  }

  private updateLastDataReceived(): void {
    this.lastDataReceived = Date.now();
  }

  /**
   * Connection pooling methods
   */
  private cleanupStaleConnections(): void {
    const now = Date.now();
    const staleConnections: string[] = [];
    
    for (const [key, connection] of this.connectionPool.entries()) {
      if (!this.isConnectionValid(connection)) {
        staleConnections.push(key);
      }
    }
    
    staleConnections.forEach(key => {
      const connection = this.connectionPool.get(key);
      if (connection?.connection?.unsubscribe) {
        connection.connection.unsubscribe();
      }
      this.connectionPool.delete(key);
    });
    
    if (staleConnections.length > 0) {
      if (__DEV__) {
        console.log(`[FirestoreConnectionManager] Cleaned up ${staleConnections.length} stale connections`);
      }
    }
  }

  private isConnectionValid(connectionInfo: unknown): boolean {
    const now = Date.now();
    const connInfo = connectionInfo as any;
    const age = now - connInfo.created;
    const timeSinceLastUse = now - connInfo.lastUsed;
    
    return age < this.connectionTimeout && timeSinceLastUse < this.connectionTimeout;
  }

  /**
   * Network status management
   */
  private initializeNetworkStatusListener(): void {
    networkManager.addListener((networkState: NetInfoState) => {
      const wasOffline = this.connectionState.isOffline;
      const isNowOffline = !networkState.isConnected;
      
      this.updateConnectionState({
        isOffline: isNowOffline,
        isSlowConnection: false, // NetInfo doesn't provide slow connection info
        networkStatus: networkState.isConnected ? 'online' : 'offline',
        isConnected: networkState.isConnected && this.connectionState.isConnected
      });

      if (wasOffline && !isNowOffline) {
        if (__DEV__) {
          console.log('Network back online, reconnecting Firestore listeners...');
        }
        this.reconnectAllListeners();
        
        setTimeout(() => {
          this.attemptRealtimeReconnection();
        }, 2000);
      }
    });
    
    setInterval(() => {
      if (this.connectionState.isConnected) {
        this.attemptRealtimeReconnection();
      }
    }, 30000);
    
    this.networkStatusUnsubscribe = () => {
      // Cleanup handled by networkManager
    };
  }

  private updateConnectionState(updates: Partial<ConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...updates };
    this.connectionStateCallbacks.forEach(callback => {
      try {
        callback(this.connectionState);
      } catch (error) {
        if (__DEV__) {
          console.error('Error in connection state callback:', error);
        }
      }
    });
  }

  private handleNetworkOnline(): void {
    if (__DEV__) {
      console.log('Network back online, reconnecting Firestore listeners...');
    }
    this.updateConnectionState({ isConnected: true, isReconnecting: true });
    this.reconnectAllListeners();
  }

  private handleNetworkOffline(): void {
    if (__DEV__) {
      console.log('Network offline, Firestore listeners will retry when connection is restored');
    }
    this.updateConnectionState({ isConnected: false, isReconnecting: false });
  }

  private reconnectAllListeners(): void {
    if (this.connectionState.isOffline) return;
    
    for (const listener of this.activeListeners.values()) {
      if (listener.isActive) {
        listener.retryCount = 0;
        if (listener.unsubscribe) {
          listener.unsubscribe();
          listener.unsubscribe = null;
        }
        this.startListener(listener);
      }
    }
  }

  private attemptRealtimeReconnection(): void {
    if (__DEV__) {
      console.log('Attempting to reconnect polling listeners to real-time...');
    }
    
    for (const [listenerId, listener] of this.activeListeners) {
      if (listener.isUsingPollingFallback && listener.isActive) {
        if (__DEV__) {
          console.log(`Attempting to switch ${listenerId} back to real-time`);
        }
        
        firestorePollingFallback.stopPolling(listenerId);
        
        listener.isUsingPollingFallback = false;
        listener.isPolling = false;
        listener.retryCount = 0;
        listener.consecutiveNetworkErrors = 0;
        
        this.startListener(listener);
      }
    }
  }

  /**
   * Public API methods
   */
  unsubscribe(listenerId: string): void {
    const listener = this.activeListeners.get(listenerId);
    if (listener) {
      listener.isActive = false;
      if (listener.unsubscribe) {
        listener.unsubscribe();
      }
      if (listener.isUsingPollingFallback) {
        firestorePollingFallback.stopPolling(listenerId);
      }
      this.activeListeners.delete(listenerId);
      if (__DEV__) {
        console.log(`[FirestoreConnectionManager] Unsubscribed listener: ${listenerId}`);
      }
    }
  }

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  onConnectionStateChange(callback: (state: ConnectionState) => void): () => void {
    this.connectionStateCallbacks.add(callback);
    return () => {
      this.connectionStateCallbacks.delete(callback);
    };
  }

  reconnectAll(): void {
    if (__DEV__) {
      console.log('Force reconnecting all Firestore listeners...');
    }
    this.updateConnectionState({ isReconnecting: true, reconnectAttempts: 0 });

    for (const listener of this.activeListeners.values()) {
      if (listener.fallbackToPolling) {
        if (listener.pollingInterval) {
          clearInterval(listener.pollingInterval);
          listener.pollingInterval = undefined;
        }
        listener.fallbackToPolling = false;
        listener.retryCount = 0;
        if (__DEV__) {
          console.log(`Attempting to restore real-time listener for ${listener.id}`);
        }
      }
      listener.retryCount = 0;
      this.startListener(listener);
    }
  }

  getStats(): {
    totalListeners: number;
    activeListeners: number;
    reconnectingListeners: number;
    connectionState: ConnectionState;
  } {
    const activeListenersList = Array.from(this.activeListeners.values()).filter(l => l.isActive);
    const reconnectingListeners = activeListenersList.filter(l => l.retryCount > 0);

    return {
      totalListeners: this.activeListeners.size,
      activeListeners: activeListenersList.length,
      reconnectingListeners: reconnectingListeners.length,
      connectionState: this.getConnectionState()
    };
  }

  /**
   * Circuit breaker methods
   */
  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.maxFailures) {
      this.circuitBreakerState = 'OPEN';
      if (__DEV__) {
        console.warn('[FirestoreConnectionManager] Circuit breaker opened due to excessive failures');
      }
    }
  }
  
  private recordSuccess(): void {
     this.failureCount = 0;
     if (this.circuitBreakerState === 'HALF_OPEN') {
       this.circuitBreakerState = 'CLOSED';
       if (__DEV__) {
         console.log('[FirestoreConnectionManager] Circuit breaker closed after successful operation');
       }
     }
     this.updateNetworkQuality('good');
   }
   
   /**
    * Update network quality and adjust polling intervals accordingly
    */
   private updateNetworkQuality(quality: 'good' | 'poor' | 'offline'): void {
     if (this.networkQuality !== quality) {
       if (__DEV__) {
         console.log(`[FirestoreConnectionManager] Network quality changed from ${this.networkQuality} to ${quality}`);
       }
       this.networkQuality = quality;
       
       // Adjust polling intervals based on network quality
       switch (quality) {
         case 'good':
           this.adaptivePollingInterval = 5000; // 5 seconds
           break;
         case 'poor':
           this.adaptivePollingInterval = Math.min(this.adaptivePollingInterval * 1.5, 30000); // Increase up to 30s
           break;
         case 'offline':
           this.adaptivePollingInterval = this.maxPollingInterval; // 1 minute
           break;
       }
       
       if (__DEV__) {
       
         console.log(`[FirestoreConnectionManager] Adaptive polling interval set to ${this.adaptivePollingInterval}ms`);
       
       }
     }
   }
  
  private createPollingSubscription<T>(
    query: any,
    callback: (data: unknown) => void,
    errorCallback?: (error: FirestoreError) => void
  ): () => void {
    const listenerId = Math.random().toString(36).substr(2, 9);
    
    firestorePollingFallback.startPolling(
      listenerId,
      query,
      callback,
      errorCallback || ((error: FirestoreError) => console.error('Polling error:', error))
    );
    
    return () => {
      firestorePollingFallback.stopPolling(listenerId);
    };
  }

  destroy(): void {
    this.activeListeners.forEach((listener) => {
      if (listener.unsubscribe) {
        try {
          listener.unsubscribe();
        } catch (error) {
          if (__DEV__) {
            console.warn('Error unsubscribing during destroy:', error);
          }
        }
      }
      if (listener.pollingInterval) {
        clearInterval(listener.pollingInterval);
      }
    });
    this.activeListeners.clear();
    
    firestorePollingFallback.stopAllPolling();
    
    if (this.networkStatusUnsubscribe) {
      this.networkStatusUnsubscribe();
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    if (this.connectionCleanupInterval) {
      clearInterval(this.connectionCleanupInterval);
    }
    
    this.connectionStateCallbacks.clear();
  }
}

// Create singleton instance
export const firestoreConnectionManager = new FirestoreConnectionManager();

// Export helper functions for easier usage
export const subscribeToFirestore = (
  listenerId: string,
  query: any,
  onNext: (snapshot: unknown) => void,
  onError?: (error: FirestoreError) => void,
  options?: { maxRetries?: number; retryDelay?: number }
) => {
  return firestoreConnectionManager.subscribe(listenerId, query, onNext, onError, options);
};

export const getFirestoreConnectionState = () => {
  return firestoreConnectionManager.getConnectionState();
};

export const onFirestoreConnectionStateChange = (callback: (state: ConnectionState) => void) => {
  return firestoreConnectionManager.onConnectionStateChange(callback);
};