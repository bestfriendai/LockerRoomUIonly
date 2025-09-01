import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/**
 * Hook to monitor network connectivity status
 * @returns Network state information including connectivity and internet reachability
 */
export function useNetwork() {
  const [state, setState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((networkState) => {
      setState(networkState);
    });

    // Fetch initial state
    NetInfo.fetch().then((networkState) => {
      setState(networkState);
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, []);

  const isConnected = state?.isConnected ?? false;
  const isInternetReachable = state?.isInternetReachable ?? null;
  const type = state?.type ?? 'unknown';

  return {
    state,
    isConnected,
    isInternetReachable,
    type,
  };
}

/**
 * Singleton network manager for non-hook contexts
 */
class NetworkManager {
  private static instance: NetworkManager;
  private currentState: NetInfoState | null = null;
  private listeners: Set<(state: NetInfoState) => void> = new Set();
  private unsubscribe: (() => void) | null = null;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private initialize() {
    // Subscribe to network state updates
    this.unsubscribe = NetInfo.addEventListener((state) => {
      this.currentState = state;
      this.notifyListeners(state);
    });

    // Fetch initial state
    NetInfo.fetch().then((state) => {
      this.currentState = state;
      this.notifyListeners(state);
    });
  }

  private notifyListeners(state: NetInfoState) {
    this.listeners.forEach((listener) => listener(state));
  }

  public addListener(listener: (state: NetInfoState) => void) {
    this.listeners.add(listener);
    // Immediately notify with current state if available
    if (this.currentState) {
      listener(this.currentState);
    }
  }

  public removeListener(listener: (state: NetInfoState) => void) {
    this.listeners.delete(listener);
  }

  public getCurrentState(): NetInfoState | null {
    return this.currentState;
  }

  public isConnected(): boolean {
    return this.currentState?.isConnected ?? false;
  }

  public isInternetReachable(): boolean | null {
    return this.currentState?.isInternetReachable ?? null;
  }

  public cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
  }
}

export const networkManager = NetworkManager.getInstance();