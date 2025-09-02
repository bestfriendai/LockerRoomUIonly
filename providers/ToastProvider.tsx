import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Toast, ToastType } from '../components/ui/Toast';

interface ToastConfig {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  position?: 'top' | 'bottom';
}

interface ToastContextType {
  showToast: (config: Omit<ToastConfig, 'id'>) => void;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 3 
}) => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const showToast = useCallback((config: Omit<ToastConfig, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastConfig = {
      ...config,
      id,
    };

    setToasts(prevToasts => {
      const updatedToasts = [newToast, ...prevToasts];
      // Limit the number of toasts
      return updatedToasts.slice(0, maxToasts);
    });
  }, [maxToasts]);

  const hideToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    hideToast,
    hideAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          visible={true}
          onHide={() => hideToast(toast.id)}
          duration={toast.duration}
          position={toast.position}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience hooks for different toast types
export const useToastHelpers = () => {
  const { showToast } = useToast();

  return {
    showSuccess: (title: string, message?: string, duration?: number) =>
      showToast({ type: 'success', title, message, duration }),
    
    showError: (title: string, message?: string, duration?: number) =>
      showToast({ type: 'error', title, message, duration }),
    
    showWarning: (title: string, message?: string, duration?: number) =>
      showToast({ type: 'warning', title, message, duration }),
    
    showInfo: (title: string, message?: string, duration?: number) =>
      showToast({ type: 'info', title, message, duration }),
  };
};
