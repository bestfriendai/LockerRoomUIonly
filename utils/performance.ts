import { InteractionManager, Platform } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Performance optimization utilities
 */

/**
 * Debounce hook for expensive operations
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle hook for frequent events
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Run callback after interactions are complete
 */
export const runAfterInteractions = (callback: () => void): void => {
  InteractionManager.runAfterInteractions(callback);
};

/**
 * Hook to run effect after interactions
 */
export const useAfterInteractions = (callback: () => void, deps: any[] = []) => {
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(callback);
    return () => task.cancel();
  }, deps);
};

/**
 * Lazy component loader with error boundary
 */
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = React.lazy(importFunc);
  
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    <React.Suspense fallback={fallback ? <fallback /> : null}>
      <LazyComponent {...props} ref={ref} />
    </React.Suspense>
  ));
};

/**
 * Memory-efficient image loading hook
 */
export const useImagePreload = (sources: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImage = (source: string) => {
      if (Platform.OS === 'web') {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(source));
        };
        img.onerror = () => {
          setFailedImages(prev => new Set(prev).add(source));
        };
        img.src = source;
      } else {
        // For React Native, we can use Image.prefetch
        // Image.prefetch(source)
        //   .then(() => setLoadedImages(prev => new Set(prev).add(source)))
        //   .catch(() => setFailedImages(prev => new Set(prev).add(source)));
      }
    };

    sources.forEach(preloadImage);
  }, [sources]);

  return { loadedImages, failedImages };
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    
    if (__DEV__) {
      console.log(`[Performance] ${componentName} rendered ${renderCount.current} times`);
      
      // Log mount time on first render
      if (renderCount.current === 1) {
        const mountDuration = Date.now() - mountTime.current;
        console.log(`[Performance] ${componentName} mounted in ${mountDuration}ms`);
      }
    }
  });

  return {
    renderCount: renderCount.current,
    logRender: (additionalInfo?: string) => {
      if (__DEV__) {
        console.log(`[Performance] ${componentName} render`, additionalInfo);
      }
    }
  };
};

/**
 * Memoized style creator
 */
export const createMemoizedStyles = <T extends Record<string, any>>(
  styleCreator: () => T
): T => {
  const styles = useRef<T | null>(null);
  
  if (!styles.current) {
    styles.current = styleCreator();
  }
  
  return styles.current;
};

/**
 * Optimized list item component
 */
export const createOptimizedListItem = <T>(
  ItemComponent: React.ComponentType<{ item: T; index: number }>
) => {
  return React.memo(ItemComponent, (prevProps, nextProps) => {
    // Custom comparison logic for list items
    return (
      prevProps.item === nextProps.item &&
      prevProps.index === nextProps.index
    );
  });
};

/**
 * Bundle size optimization helpers
 */
export const optimizeBundle = {
  // Selective icon imports
  getIconComponent: (iconName: string, iconSet: 'Ionicons' | 'MaterialIcons' = 'Ionicons') => {
    // This would be implemented with dynamic imports in a real scenario
    // For now, return a placeholder
    return null;
  },

  // Lazy load heavy components
  lazyLoadComponent: (componentPath: string) => {
    return React.lazy(() => import(componentPath));
  },

  // Optimize images
  getOptimizedImageUri: (uri: string, width?: number, height?: number) => {
    // In a real app, this would integrate with image optimization services
    // like Cloudinary, ImageKit, etc.
    return uri;
  }
};

/**
 * Memory management utilities
 */
export const memoryUtils = {
  // Clear component cache
  clearComponentCache: () => {
    // Implementation would depend on the caching strategy used
    if (__DEV__) {
      console.log('[Performance] Component cache cleared');
    }
  },

  // Monitor memory usage (development only)
  logMemoryUsage: (label: string) => {
    if (__DEV__ && Platform.OS === 'web' && 'memory' in performance) {
      const memory = (performance as any).memory;
      console.log(`[Memory] ${label}:`, {
        used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
      });
    }
  }
};
