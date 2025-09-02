/**
 * UI Error Boundary Component
 * Catches and handles errors in UI components gracefully
 * 
 * @example
 * <UIErrorBoundary>
 *   <YourComponent />
 * </UIErrorBoundary>
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/utils/colors';
import { typography, textStyles } from '@/utils/typography';
import { spacing, borderRadius, shadows } from '@/utils/spacing';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetOnNavigate?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Error boundary component to catch and handle UI errors
 * Provides fallback UI and error reporting capabilities
 */
export class UIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service
    console.error('UI Error Boundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to external error tracking service (e.g., Sentry, Bugsnag)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
  };

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when navigation changes (if enabled)
    if (this.props.resetOnNavigate && this.props.children !== prevProps.children) {
      if (this.state.hasError) {
        this.handleReset();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.errorContainer}>
              {/* Error Icon */}
              <View style={styles.iconContainer}>
                <Ionicons 
                  name="warning-outline" 
                  size={64} 
                  color={colors.error.main} 
                />
              </View>

              {/* Error Message */}
              <Text style={styles.title}>Oops! Something went wrong</Text>
              <Text style={styles.subtitle}>
                We're sorry, but something unexpected happened. Please try again.
              </Text>

              {/* Error Details (if enabled) */}
              {this.props.showDetails && this.state.error && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>Error Details:</Text>
                  <View style={styles.codeBlock}>
                    <Text style={styles.errorMessage}>
                      {this.state.error.toString()}
                    </Text>
                  </View>
                  
                  {this.state.errorInfo && (
                    <ScrollView style={styles.stackTrace} horizontal>
                      <Text style={styles.stackText}>
                        {this.state.errorInfo.componentStack}
                      </Text>
                    </ScrollView>
                  )}
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={this.handleReset}
                  accessibilityRole="button"
                  accessibilityLabel="Try again"
                  accessibilityHint="Tap to reload the component"
                >
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>

                {this.state.errorCount > 2 && (
                  <TouchableOpacity 
                    style={styles.secondaryButton}
                    onPress={() => {
                      // Navigate to home or safe screen
                      console.log('Navigate to home');
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Go to home"
                    accessibilityHint="Tap to return to the home screen"
                  >
                    <Ionicons 
                      name="home-outline" 
                      size={20} 
                      color={colors.primary[500]} 
                    />
                    <Text style={styles.secondaryButtonText}>Go to Home</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Error count indicator */}
              {this.state.errorCount > 1 && (
                <Text style={styles.errorCount}>
                  Error occurred {this.state.errorCount} times
                </Text>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[950],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239,68,68,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...textStyles.h2,
    color: colors.neutral[50],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.neutral[400],
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.neutral[900],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[800],
  },
  detailsTitle: {
    ...textStyles.label,
    color: colors.neutral[300],
    marginBottom: spacing.sm,
  },
  codeBlock: {
    padding: spacing.sm,
    backgroundColor: colors.neutral[950],
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...textStyles.bodySmall,
    color: colors.error.light,
    fontFamily: typography.fontFamily.mono,
  },
  stackTrace: {
    maxHeight: 150,
    padding: spacing.sm,
    backgroundColor: colors.neutral[950],
    borderRadius: borderRadius.md,
  },
  stackText: {
    ...textStyles.caption,
    color: colors.neutral[500],
    fontFamily: typography.fontFamily.mono,
  },
  actions: {
    flexDirection: 'column',
    gap: spacing.md,
    width: '100%',
    maxWidth: 300,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  buttonText: {
    ...textStyles.button,
    color: 'white',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  secondaryButtonText: {
    ...textStyles.button,
    color: colors.primary[500],
  },
  errorCount: {
    ...textStyles.caption,
    color: colors.neutral[500],
    marginTop: spacing.md,
  },
});

export default UIErrorBoundary;