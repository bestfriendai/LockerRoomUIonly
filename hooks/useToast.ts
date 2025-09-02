import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import logger from '../utils/logger';

interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
}

export const useToast = () => {
  const show = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', options?: ToastOptions) => {
    // For now, use Alert as a simple toast implementation
    // In production, use a proper toast library like react-native-toast-message
    if (Platform.OS === 'web') {
      // Web implementation could use a different approach
      __DEV__ && console.log(`[${type.toUpperCase()}]: ${message}`);
    } else {
      const title = type === 'success' ? 'Success' : 
                   type === 'error' ? 'Error' : 
                   type === 'warning' ? 'Warning' : 'Info';
      
      Alert.alert(title, message);
    }
  }, []);

  const success = useCallback((message: string, options?: ToastOptions) => {
    show(message, 'success', options);
  }, [show]);

  const error = useCallback((message: string, options?: ToastOptions) => {
    show(message, 'error', options);
  }, [show]);

  const info = useCallback((message: string, options?: ToastOptions) => {
    show(message, 'info', options);
  }, [show]);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    show(message, 'warning', options);
  }, [show]);

  return {
    show,
    success,
    error,
    info,
    warning,
  };
};