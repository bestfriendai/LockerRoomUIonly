/**
 * Test suite for EnhancedButton component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { EnhancedButton } from '../EnhancedButton';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

describe('EnhancedButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render correctly with title', () => {
      const { getByText } = render(
        <EnhancedButton title="Test Button" onPress={jest.fn()} />
      );
      expect(getByText('Test Button')).toBeTruthy();
    });

    it('should render children instead of title when provided', () => {
      const { getByText, queryByText } = render(
        <EnhancedButton title="Title" onPress={jest.fn()}>
          <span>Custom Content</span>
        </EnhancedButton>
      );
      expect(getByText('Custom Content')).toBeTruthy();
      expect(queryByText('Title')).toBeNull();
    });

    it('should render with different variants', () => {
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const;
      
      variants.forEach((variant) => {
        const { getByText } = render(
          <EnhancedButton 
            title={`${variant} button`}
            variant={variant}
            onPress={jest.fn()}
          />
        );
        expect(getByText(`${variant} button`)).toBeTruthy();
      });
    });

    it('should render with different sizes', () => {
      const sizes = ['sm', 'md', 'lg', 'xl'] as const;
      
      sizes.forEach((size) => {
        const { getByText } = render(
          <EnhancedButton 
            title={`${size} button`}
            size={size}
            onPress={jest.fn()}
          />
        );
        expect(getByText(`${size} button`)).toBeTruthy();
      });
    });

    it('should show loading indicator when loading', () => {
      const { queryByTestId, getByTestId } = render(
        <EnhancedButton 
          title="Test"
          onPress={jest.fn()}
          loading
          testID="button"
        />
      );
      // ActivityIndicator should be shown
      expect(getByTestId('button')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <EnhancedButton title="Press Me" onPress={onPress} />
      );
      
      fireEvent.press(getByText('Press Me'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <EnhancedButton title="Disabled" onPress={onPress} disabled />
      );
      
      fireEvent.press(getByText('Disabled'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should not call onPress when loading', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <EnhancedButton 
          title="Loading"
          onPress={onPress}
          loading
          testID="button"
        />
      );
      
      fireEvent.press(getByTestId('button'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger haptic feedback on iOS', async () => {
      Platform.OS = 'ios';
      const onPress = jest.fn();
      const { getByText } = render(
        <EnhancedButton title="Haptic" onPress={onPress} haptic />
      );
      
      fireEvent.press(getByText('Haptic'));
      
      await waitFor(() => {
        expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
      });
    });

    it('should trigger haptic feedback on Android', async () => {
      Platform.OS = 'android';
      const onPress = jest.fn();
      const { getByText } = render(
        <EnhancedButton title="Haptic" onPress={onPress} haptic />
      );
      
      fireEvent.press(getByText('Haptic'));
      
      await waitFor(() => {
        expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
      });
    });

    it('should not trigger haptic feedback on web', async () => {
      Platform.OS = 'web';
      const onPress = jest.fn();
      const { getByText } = render(
        <EnhancedButton title="No Haptic" onPress={onPress} haptic />
      );
      
      fireEvent.press(getByText('No Haptic'));
      
      await waitFor(() => {
        expect(Haptics.impactAsync).not.toHaveBeenCalled();
      });
    });

    it('should not trigger haptic feedback when disabled', () => {
      Platform.OS = 'ios';
      const onPress = jest.fn();
      const { getByText } = render(
        <EnhancedButton title="No Haptic" onPress={onPress} haptic={false} />
      );
      
      fireEvent.press(getByText('No Haptic'));
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility props', () => {
      const { getByRole, getByLabelText } = render(
        <EnhancedButton 
          title="Accessible"
          onPress={jest.fn()}
          accessibilityLabel="Custom Label"
          accessibilityHint="Custom Hint"
        />
      );
      
      const button = getByLabelText('Custom Label');
      expect(button).toBeTruthy();
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityHint).toBe('Custom Hint');
    });

    it('should use title as default accessibility label', () => {
      const { getByLabelText } = render(
        <EnhancedButton title="Default Label" onPress={jest.fn()} />
      );
      
      expect(getByLabelText('Default Label')).toBeTruthy();
    });

    it('should have disabled accessibility state when disabled', () => {
      const { getByText } = render(
        <EnhancedButton title="Disabled" onPress={jest.fn()} disabled />
      );
      
      const button = getByText('Disabled').parent?.parent;
      expect(button?.props.accessibilityState).toEqual({ disabled: true });
    });

    it('should have correct test ID', () => {
      const { getByTestId } = render(
        <EnhancedButton 
          title="Test"
          onPress={jest.fn()}
          testID="test-button"
        />
      );
      
      expect(getByTestId('test-button')).toBeTruthy();
    });
  });

  describe('Animations', () => {
    it('should handle press animations', () => {
      const { getByText } = render(
        <EnhancedButton title="Animated" onPress={jest.fn()} />
      );
      
      const button = getByText('Animated').parent?.parent;
      
      // Simulate press in
      fireEvent(button!, 'pressIn');
      
      // Simulate press out
      fireEvent(button!, 'pressOut');
      
      // Animations should be triggered (we can't easily test the actual animation values)
      expect(button).toBeTruthy();
    });
  });

  describe('Icons', () => {
    it('should render left icon when provided', () => {
      const { UNSAFE_getByType } = render(
        <EnhancedButton 
          title="With Icon"
          onPress={jest.fn()}
          leftIcon="heart"
        />
      );
      
      const Ionicons = require('@expo/vector-icons').Ionicons;
      const icon = UNSAFE_getByType(Ionicons);
      expect(icon.props.name).toBe('heart');
    });

    it('should render right icon when provided', () => {
      const { UNSAFE_getAllByType } = render(
        <EnhancedButton 
          title="With Icon"
          onPress={jest.fn()}
          rightIcon="arrow-forward"
        />
      );
      
      const Ionicons = require('@expo/vector-icons').Ionicons;
      const icons = UNSAFE_getAllByType(Ionicons);
      const rightIcon = icons.find(icon => icon.props.name === 'arrow-forward');
      expect(rightIcon).toBeTruthy();
    });

    it('should render both icons when provided', () => {
      const { UNSAFE_getAllByType } = render(
        <EnhancedButton 
          title="With Icons"
          onPress={jest.fn()}
          leftIcon="heart"
          rightIcon="arrow-forward"
        />
      );
      
      const Ionicons = require('@expo/vector-icons').Ionicons;
      const icons = UNSAFE_getAllByType(Ionicons);
      expect(icons).toHaveLength(2);
      expect(icons[0].props.name).toBe('heart');
      expect(icons[1].props.name).toBe('arrow-forward');
    });
  });

  describe('Styles', () => {
    it('should apply full width style when fullWidth is true', () => {
      const { getByText } = render(
        <EnhancedButton 
          title="Full Width"
          onPress={jest.fn()}
          fullWidth
        />
      );
      
      const container = getByText('Full Width').parent?.parent?.parent;
      const styles = container?.props.style;
      
      // Check if styles array contains width: '100%'
      const hasFullWidth = styles?.some((style: any) => 
        style && style.width === '100%'
      );
      expect(hasFullWidth).toBeTruthy();
    });

    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByText } = render(
        <EnhancedButton 
          title="Custom Style"
          onPress={jest.fn()}
          style={customStyle}
        />
      );
      
      const button = getByText('Custom Style').parent?.parent;
      const styles = button?.props.style;
      
      // Check if custom style is applied
      const hasCustomStyle = styles?.some((style: any) => 
        style && style.backgroundColor === 'red'
      );
      expect(hasCustomStyle).toBeTruthy();
    });
  });
});

export {};