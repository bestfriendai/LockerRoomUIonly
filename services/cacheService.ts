import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private readonly CACHE_PREFIX = '@cache_';
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  // Get cached data
  async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.getCacheKey(key);
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) {
        return null;
      }
      
      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Check if cache has expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        await this.remove(key);
        return null;
      }
      
      return entry.data;
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Cache get error:', error);
      }
      return null;
    }
  }

  // Set cache data
  async set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Cache set error:', error);
      }
    }
  }

  // Remove cached data
  async remove(key: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key);
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Cache remove error:', error);
      }
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Cache clear error:', error);
      }
    }
  }

  // Clear expired cache entries
  async clearExpired(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          try {
            const entry: CacheEntry<any> = JSON.parse(cached);
            if (Date.now() - entry.timestamp > entry.ttl) {
              await AsyncStorage.removeItem(key);
            }
          } catch {
            // Remove invalid cache entries
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Cache clear expired error:', error);
      }
    }
  }

  // Get cache size
  async getSize(): Promise<{ count: number; bytes: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      let totalBytes = 0;
      
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalBytes += new Blob([value]).size;
        }
      }
      
      return {
        count: cacheKeys.length,
        bytes: totalBytes,
      };
    } catch (error) {
      if (__DEV__) {
        __DEV__ && console.error('Cache get size error:', error);
      }
      return { count: 0, bytes: 0 };
    }
  }

  // Check if cache exists
  async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  // Get or set cache
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Fetch new data
    const data = await fetcher();
    
    // Cache the data
    await this.set(key, data, ttl);
    
    return data;
  }

  // Batch get
  async getBatch<T>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();
    
    for (const key of keys) {
      const data = await this.get<T>(key);
      results.set(key, data);
    }
    
    return results;
  }

  // Batch set
  async setBatch<T>(entries: Array<{ key: string; data: T; ttl?: number }>): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.data, entry.ttl);
    }
  }

  // Get cache key
  private getCacheKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }
}

export const cacheService = new CacheService();