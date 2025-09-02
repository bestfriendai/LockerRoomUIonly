import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { tokens } from '../../constants/tokens';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showFPS?: boolean;
  showMemory?: boolean;
  showBundleSize?: boolean;
}

interface PerformanceMetrics {
  fps: number;
  memory: {
    used: number;
    total: number;
    limit: number;
  } | null;
  renderTime: number;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = __DEV__,
  position = 'top-right',
  showFPS = true,
  showMemory = true,
  showBundleSize = false,
}) => {
  const { colors } = useTheme();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: null,
    renderTime: 0,
  });

  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  const renderStartTime = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    renderStartTime.current = Date.now();

    const updateMetrics = () => {
      const now = Date.now();
      const deltaTime = now - lastTime.current;
      
      if (deltaTime >= 1000) { // Update every second
        const fps = Math.round((frameCount.current * 1000) / deltaTime);
        frameCount.current = 0;
        lastTime.current = now;

        let memory = null;
        if (Platform.OS === 'web' && 'memory' in performance) {
          const memInfo = (performance as any).memory;
          memory = {
            used: Math.round(memInfo.usedJSHeapSize / 1048576), // MB
            total: Math.round(memInfo.totalJSHeapSize / 1048576), // MB
            limit: Math.round(memInfo.jsHeapSizeLimit / 1048576), // MB
          };
        }

        const renderTime = now - renderStartTime.current;

        setMetrics({
          fps,
          memory,
          renderTime,
        });
      }

      frameCount.current++;
      requestAnimationFrame(updateMetrics);
    };

    const animationId = requestAnimationFrame(updateMetrics);
    return () => cancelAnimationFrame(animationId);
  }, [enabled]);

  if (!enabled) return null;

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      zIndex: tokens.zIndex.tooltip,
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyle, top: 50, left: 10 };
      case 'top-right':
        return { ...baseStyle, top: 50, right: 10 };
      case 'bottom-left':
        return { ...baseStyle, bottom: 50, left: 10 };
      case 'bottom-right':
        return { ...baseStyle, bottom: 50, right: 10 };
      default:
        return { ...baseStyle, top: 50, right: 10 };
    }
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return colors.success;
    if (fps >= 30) return colors.warning;
    return colors.error;
  };

  const getMemoryColor = (used: number, total: number) => {
    const usage = used / total;
    if (usage < 0.7) return colors.success;
    if (usage < 0.9) return colors.warning;
    return colors.error;
  };

  return (
    <View style={[styles.container, getPositionStyle(), { backgroundColor: colors.surface }]}>
      {showFPS && (
        <View style={styles.metric}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>FPS</Text>
          <Text style={[styles.value, { color: getFPSColor(metrics.fps) }]}>
            {metrics.fps}
          </Text>
        </View>
      )}

      {showMemory && metrics.memory && (
        <View style={styles.metric}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Memory</Text>
          <Text style={[
            styles.value, 
            { color: getMemoryColor(metrics.memory.used, metrics.memory.total) }
          ]}>
            {metrics.memory.used}MB
          </Text>
        </View>
      )}

      <View style={styles.metric}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Render</Text>
        <Text style={[styles.value, { color: colors.textPrimary }]}>
          {metrics.renderTime}ms
        </Text>
      </View>

      {showBundleSize && (
        <View style={styles.metric}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Bundle</Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>
            ~7.8MB
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.sm,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 80,
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  label: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.medium as any,
    fontFamily: 'Inter',
  },
  value: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.bold as any,
    fontFamily: 'Inter',
    marginLeft: tokens.spacing.sm,
  },
});
