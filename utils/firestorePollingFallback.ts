import { 
  Query, 
  QuerySnapshot, 
  getDocs, 
  FirestoreError,
  DocumentData
} from 'firebase/firestore';

/**
 * Polling-based Firestore listener as fallback for net::ERR_ABORTED errors
 * This bypasses Firebase's real-time Listen channels entirely
 */
export class FirestorePollingFallback {
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private lastSnapshots: Map<string, QuerySnapshot<DocumentData>> = new Map();
  private isActive: Map<string, boolean> = new Map();

  /**
   * Start polling a Firestore query
   */
  startPolling(
    listenerId: string,
    query: Query<DocumentData>,
    onNext: (snapshot: QuerySnapshot<DocumentData>) => void,
    onError: (error: FirestoreError) => void,
    intervalMs: number = 2000,
    onDataReceived?: () => void
  ): () => void {
    if (__DEV__) {
      console.log(`Starting polling fallback for listener: ${listenerId}`);
    }
    
    this.isActive.set(listenerId, true);
    
    const pollFunction = async () => {
      if (!this.isActive.get(listenerId)) return;
      
      try {
        const snapshot = await getDocs(query);
        const lastSnapshot = this.lastSnapshots.get(listenerId);
        
        // Check if data has changed by comparing document count and last doc timestamp
        let hasChanged = false;
        
        if (!lastSnapshot || lastSnapshot.size !== snapshot.size) {
          hasChanged = true;
        } else {
          // Compare document IDs and modification times
          const currentDocs = snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
          const lastDocs = lastSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
          
          hasChanged = JSON.stringify(currentDocs) !== JSON.stringify(lastDocs);
        }
        
        if (hasChanged) {
          this.lastSnapshots.set(listenerId, snapshot);
          onDataReceived?.();
          onNext(snapshot);
        }
      } catch (error) {
        if (__DEV__) {
          console.error(`Polling error for ${listenerId}:`, error);
        }
        onError(error as FirestoreError);
      }
    };
    
    // Initial fetch
    pollFunction();
    
    // Set up polling interval
    const interval = setInterval(pollFunction, intervalMs);
    this.pollingIntervals.set(listenerId, interval);
    
    // Return unsubscribe function
    return () => {
      this.stopPolling(listenerId);
    };
  }
  
  /**
   * Stop polling for a specific listener
   */
  stopPolling(listenerId: string): void {
    if (__DEV__) {
      console.log(`Stopping polling fallback for listener: ${listenerId}`);
    }
    
    this.isActive.set(listenerId, false);
    
    const interval = this.pollingIntervals.get(listenerId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(listenerId);
    }
    
    this.lastSnapshots.delete(listenerId);
    this.isActive.delete(listenerId);
  }
  
  /**
   * Stop all polling
   */
  stopAllPolling(): void {
    if (__DEV__) {
      console.log('Stopping all polling fallbacks');
    }
    
    for (const listenerId of this.pollingIntervals.keys()) {
      this.stopPolling(listenerId);
    }
  }
  
  /**
   * Get active polling listeners
   */
  getActiveListeners(): string[] {
    return Array.from(this.pollingIntervals.keys());
  }
  
  /**
   * Check if a listener is actively polling
   */
  isPolling(listenerId: string): boolean {
    return this.pollingIntervals.has(listenerId) && this.isActive.get(listenerId) === true;
  }
}

// Singleton instance
export const firestorePollingFallback = new FirestorePollingFallback();