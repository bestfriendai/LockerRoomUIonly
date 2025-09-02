import React, { useState, forwardRef } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
  StyleSheet,
  Pressable,
  Text as RNText
} from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { SPACING } from '../../constants/spacing';
import { BORDER_RADIUS } from '../../constants/shadows';
import { tokens } from '../../constants/tokens';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'underlined';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Input = forwardRef<TextInput, InputProps>((
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    inputStyle,
    size = 'md',
    variant = 'default',
    style,
    editable = true,
    accessibilityLabel,
    accessibilityHint,
    ...props
  },
  ref
) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;
  const isDisabled = !editable;

  // Calculate padding based on size
  const getPadding = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: SPACING.sm,
          paddingVertical: SPACING.xs,
        };
      case 'lg':
        return {
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
        };
      default: // md
        return {
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
        };
    }
  };

  // Calculate minimum height based on size
  const getMinHeight = () => {
    switch (size) {
      case 'sm':
        return 36;
      case 'lg':
        return 56;
      default: // md
        return 48;
    }
  };

  // Get border color based on state
  const getBorderColor = () => {
    if (hasError) {
      return colors.error;
    }
    if (isFocused) {
      return colors.primary;
    }
    if (isDisabled) {
      return colors.borderSubtle;
    }
    return colors.border;
  };

  // Get background color based on variant and state
  const getBackgroundColor = () => {
    if (isDisabled) {
      return colors.surfaceDisabled;
    }
    
    switch (variant) {
      case 'filled':
        return colors.surface;
      case 'underlined':
        return 'transparent';
      default:
        return colors.background;
    }
  };

  // Get border style based on variant
  const getBorderStyle = () => {
    switch (variant) {
      case 'underlined':
        return {
          borderBottomWidth: 2,
          borderBottomColor: getBorderColor(),
          borderRadius: 0,
        };
      default:
        return {
          borderWidth: 1,
          borderColor: getBorderColor(),
          borderRadius: BORDER_RADIUS.md,
        };
    }
  };

  const containerStyles: ViewStyle = {
    ...getBorderStyle(),
    backgroundColor: getBackgroundColor(),
    minHeight: getMinHeight(),
    flexDirection: 'row',
    alignItems: 'center',
    ...getPadding(),
  };

  const textInputStyles: TextStyle = {
    flex: 1,
    fontSize: tokens.fontSize.base,
    lineHeight: tokens.lineHeight.base,
    color: isDisabled ? colors.textDisabled : colors.text,
    paddingHorizontal: (leftIcon || rightIcon) ? SPACING.xs : 0,
    // Improve text input experience
    includeFontPadding: false,
    textAlignVertical: multiline ? 'top' : 'center',
    fontFamily: 'Inter',
    fontWeight: tokens.fontWeight.normal as any,
  };

  return (
    <View style={containerStyle}>
      {label && (
        <RNText
          style={[styles.label, { color: hasError ? colors.error : colors.textSecondary }]}
          accessibilityRole="text"
        >
          {label}
        </RNText>
      )}
      
      <View style={[containerStyles, style as ViewStyle]}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={[textInputStyles, inputStyle as TextStyle]}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.primary}
          editable={editable}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          accessibilityLabel={accessibilityLabel || label || props.placeholder}
          accessibilityHint={accessibilityHint}
          accessibilityRole="text"
          accessibilityState={{
            disabled: !editable,
            selected: isFocused,
          }}
          {...props}
        />
        
        {rightIcon && (
          <Pressable
            style={styles.iconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            accessibilityRole="button"
            accessibilityLabel="Input action"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {rightIcon}
          </Pressable>
        )}
      </View>
      
      {(error || helperText) && (
        <RNText
          style={[styles.helperText, { color: hasError ? colors.error : colors.textSecondary }]}
          accessibilityRole="text"
          accessibilityLiveRegion={hasError ? "assertive" : "polite"}
        >
          {error || helperText}
        </RNText>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  helperText: {
    marginTop: SPACING.xs,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginBottom: SPACING.xs,
  },
});