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
    intervalMs: number = 3000,
    onDataReceived?: () => void
  ): () => void {
    if (__DEV__) {
      console.log(`[FirestorePollingFallback] Starting polling for listener: ${listenerId} with ${intervalMs}ms interval`);
    }
    
    this.isActive.set(listenerId, true);
    
    const pollFunction = async () => {
      if (!this.isActive.get(listenerId)) return;
      
      try {
        const snapshot = await getDocs(query);
        const lastSnapshot = this.lastSnapshots.get(listenerId);
        
        // Always call onNext for the first fetch
        if (!lastSnapshot) {
          this.lastSnapshots.set(listenerId, snapshot);
          onDataReceived?.();
          onNext(snapshot);
          if (__DEV__) {
            console.log(`[FirestorePollingFallback] Initial data loaded for ${listenerId}: ${snapshot.size} documents`);
          }
          return;
        }
        
        // Check if data has changed by comparing document count and content
        let hasChanged = false;
        
        if (lastSnapshot.size !== snapshot.size) {
          hasChanged = true;
        } else {
          // More efficient comparison - check document IDs first, then data
          const currentDocIds = snapshot.docs.map(doc => doc.id).sort();
          const lastDocIds = lastSnapshot.docs.map(doc => doc.id).sort();
          
          if (JSON.stringify(currentDocIds) !== JSON.stringify(lastDocIds)) {
            hasChanged = true;
          } else {
            // If IDs are the same, check if any document data changed
            for (let i = 0; i < snapshot.docs.length; i++) {
              const currentDoc = snapshot.docs[i];
              const lastDoc = lastSnapshot.docs.find(doc => doc.id === currentDoc.id);
              
              if (!lastDoc || JSON.stringify(currentDoc.data()) !== JSON.stringify(lastDoc.data())) {
                hasChanged = true;
                break;
              }
            }
          }
        }
        
        if (hasChanged) {
          this.lastSnapshots.set(listenerId, snapshot);
          onDataReceived?.();
          onNext(snapshot);
          if (__DEV__) {
            console.log(`[FirestorePollingFallback] Data changed for ${listenerId}: ${snapshot.size} documents`);
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.error(`[FirestorePollingFallback] Polling error for ${listenerId}:`, error);
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
      console.log(`[FirestorePollingFallback] Stopping polling for listener: ${listenerId}`);
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
      console.log('[FirestorePollingFallback] Stopping all polling fallbacks');
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