import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { tokens } from '../constants/tokens';
import logger from '../utils/logger';

type Theme = 'light' | 'dark' | 'system';

type ColorRole = 
  | 'background'
  | 'surface'
  | 'surfaceHover'
  | 'surfaceDisabled'
  | 'surfaceElevated'
  | 'border'
  | 'borderSubtle'
  | 'overlay'
  | 'text'
  | 'textSecondary'
  | 'textTertiary'
  | 'textDisabled'
  | 'primary'
  | 'primaryHover'
  | 'primaryDisabled'
  | 'onPrimary'
  | 'success'
  | 'error'
  | 'warning'
  | 'white'
  | 'black'
  | 'info'
  | 'chipBg'
  | 'chipBorder'
  | 'chipText'
  | 'divider'
  | 'errorContainer'
  | 'card'
  | 'warningBg'
  | 'cardBg'
  | 'errorBg';

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  colors: Record<ColorRole, string>;
  tokens: typeof tokens;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@MockTrae:theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [isLoaded, setIsLoaded] = useState(false);
  const mountedRef = useRef(true);

  // Clean up on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Determine if dark mode should be active
  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme) && mountedRef.current) {
          setThemeState(savedTheme as Theme);
        }
      } catch (error) {
        // Failed to load theme from storage
        if (__DEV__) {
          __DEV__ && console.warn('Failed to load theme from storage:', error);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoaded(true);
        }
      }
    };

    loadTheme();
  }, []);

  // Save theme to storage when it changes
  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      if (mountedRef.current) {
        setThemeState(newTheme);
      }
    } catch (error) {
      // Failed to save theme to storage
      if (__DEV__) {
        __DEV__ && console.warn('Failed to save theme to storage:', error);
      }
      if (mountedRef.current) {
        setThemeState(newTheme); // Still update state even if storage fails
      }
    }
  };

  // Define colors based on current theme
  const colors: Record<ColorRole, string> = {
    // Background colors
    background: isDark ? Colors.uiDark.background : Colors.ui.background,
    surface: isDark ? Colors.uiDark.surface : Colors.ui.surface,
    surfaceHover: isDark ? Colors.uiDark.surfaceHover : Colors.ui.surfaceHover,
    surfaceDisabled: isDark ? Colors.uiDark.surfaceDisabled : Colors.ui.surfaceDisabled,
    surfaceElevated: isDark ? Colors.uiDark.surfaceHover : Colors.ui.surfaceHover,
    
    // Border colors
    border: isDark ? Colors.uiDark.border : Colors.ui.border,
    borderSubtle: isDark ? Colors.uiDark.borderSubtle : Colors.ui.borderSubtle,
    
    // Overlay
    overlay: isDark ? Colors.uiDark.overlay : Colors.ui.overlay,
    
    // Text colors
    text: isDark ? Colors.textDark.primary : Colors.text.primary,
    textSecondary: isDark ? Colors.textDark.secondary : Colors.text.secondary,
    textTertiary: isDark ? Colors.textDark.tertiary : Colors.text.tertiary,
    textDisabled: isDark ? Colors.textDark.disabled : Colors.text.disabled,
    
    // Primary colors
    primary: Colors.primary[500],
    primaryHover: Colors.primary[600],
    primaryDisabled: isDark ? Colors.primary[800] : Colors.primary[300],
    onPrimary: Colors.white,
    
    // Semantic colors
    success: Colors.success[500],
    error: Colors.error[500],
    warning: Colors.warning[500],
    
    // Base colors
    white: Colors.white,
    black: Colors.black,
    
    // Additional colors
    info: '#3B82F6',
    chipBg: isDark ? Colors.uiDark.surface : '#F3F4F6',
    chipBorder: isDark ? Colors.uiDark.border : '#E5E7EB',
    chipText: isDark ? Colors.textDark.secondary : '#374151',
    divider: isDark ? Colors.uiDark.border : '#E5E7EB',
    errorContainer: isDark ? '#7F1D1D' : '#FEE2E2',
    card: isDark ? Colors.uiDark.surface : Colors.ui.surface,
    warningBg: isDark ? '#78350F' : '#FEF3C7',
    cardBg: isDark ? Colors.uiDark.surface : Colors.ui.surface,
    errorBg: isDark ? '#7F1D1D' : '#FEE2E2',
  };

  const contextValue: ThemeContextType = {
    theme,
    isDark,
    setTheme,
    colors,
    tokens,
  };

  // Don't render children until theme is loaded
  if (!isLoaded) {
    return null; // or a loading spinner
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper hook for getting colors
export const useColors = () => {
  const { colors } = useTheme();
  return colors;
};

// Helper hook for checking dark mode
export const useIsDark = () => {
  const { isDark } = useTheme();
  return isDark;
};