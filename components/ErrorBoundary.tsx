import React from 'react';
import { View, StyleSheet, AppState, AppStateStatus, Text } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import * as Sentry from 'sentry-expo';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  retryable?: boolean;
  showGoHome?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  errorId: string;
  errorTime: number;
}

class ErrorBoundary extends React.Component<Props, State> {
  private appStateListener?: { remove: () => void };

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      retryCount: 0,
      errorId: '',
      errorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    return { 
      hasError: true, 
      error, 
      errorId,
      errorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Send error to Sentry with additional context
    try {
      Sentry.Native.setTag('errorBoundary', 'true');
      Sentry.Native.setTag('level', this.props.level || 'component');
      Sentry.Native.setContext('errorInfo', {
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
        errorId: this.state.errorId,
      });
      Sentry.Native.captureException(error);
    } catch (sentryError) {
      console.warn('Failed to send error to Sentry:', sentryError);
    }

    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  componentDidMount() {
    // Listen for app state changes to auto-retry on app resume
    this.appStateListener = AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    this.appStateListener?.remove();
  }

  handleAppStateChange = (nextAppState: AppStateStatus) => {
    // Auto-retry when app becomes active again
    if (nextAppState === 'active' && this.state.hasError && this.state.retryCount < 3) {
      setTimeout(() => {
        this.resetError();
      }, 1000);
    }
  };

  resetError = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    this.setState({ 
      hasError: false, 
      error: null, 
      retryCount: this.state.retryCount + 1 
    });
  };

  handleGoHome = () => {
    // This would need to be implemented based on your navigation setup
    // For now, we'll just reset the error
    this.resetError();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <DefaultErrorFallback 
          error={this.state.error!} 
          resetError={this.resetError}
          showGoHome={this.props.showGoHome}
          retryable={this.props.retryable !== false}
        />
      );
    }

    return this.props.children;
  }
}

// Default fallback component
const DefaultErrorFallback: React.FC<{ 
  error: Error; 
  resetError: () => void;
  showGoHome?: boolean;
  retryable?: boolean;
}> = ({ error, resetError, showGoHome, retryable }) => {
  // Use a try-catch to handle cases where ThemeProvider is not available
  let colors;
  try {
    const theme = useTheme();
    colors = theme.colors;
  } catch {
    // Fallback colors when ThemeProvider is not available
    colors = {
      surface: '#ffffff',
      surfaceElevated: '#f8f9fa',
      errorContainer: '#ffebee',
      error: '#d32f2f',
      textSecondary: '#6c757d',
      border: '#e0e0e0',
      onPrimary: '#ffffff',
      text: '#212529'
    };
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.content, { backgroundColor: colors.surfaceElevated }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.errorContainer }]}>
          <Ionicons name="warning" size={32} color={colors.error} />
        </View>
        
        <Text style={{ textAlign: 'center', marginBottom: 8 }}>
          Something went wrong
        </Text>
        
        <Text 
          style={{ 
            color: colors.textSecondary, 
            textAlign: 'center', 
            marginBottom: 24 
          }}
        >
          We're sorry, but something unexpected happened. Please try again.
        </Text>

        {__DEV__ && (
          <View style={[styles.errorDetails, { 
            backgroundColor: colors.surface,
            borderColor: colors.border 
          }]}>
            <Text style={{ color: colors.textSecondary }}>
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 12 }}>
          {retryable && (
            <Button
              onPress={resetError}
              style={{ flex: 1 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="refresh" size={16} color={colors.onPrimary} style={{ marginRight: 8 }} />
                <Text>Try Again</Text>
              </View>
            </Button>
          )}
          
          {showGoHome && (
            <Button
              onPress={resetError}
              style={{ flex: 1 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="home" size={16} color={colors.text} style={{ marginRight: 8 }} />
                <Text>Go Home</Text>
              </View>
            </Button>
          )}
        </View>
      </View>
    </View>
  );
};

// Hook for using error boundary in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  return { error, resetError, captureError };
};

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    borderRadius: 16,
    maxWidth: 400,
    padding: 32,
    width: '100%',
  },
  errorDetails: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 16,
    width: 64,
  },
});

export default ErrorBoundary;
