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
import { BORDER_RADIUS, SHADOWS } from '../../constants/shadows';
import { tokens } from '../../constants/tokens';
import { createTypographyStyles } from '../../styles/typography';

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

  // Calculate padding based on size - improved for better visual balance
  const getPadding = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: 12, // More compact but comfortable
          paddingVertical: 8,    // Tighter vertical padding
        };
      case 'lg':
        return {
          paddingHorizontal: 16, // Better proportions
          paddingVertical: 14,   // More comfortable
        };
      default: // md
        return {
          paddingHorizontal: 14, // Better balance than tokens
          paddingVertical: 10,   // Improved vertical spacing
        };
    }
  };

  // Calculate minimum height based on size - optimized for better proportions
  const getMinHeight = () => {
    switch (size) {
      case 'sm':
        return 36;  // Compact but usable
      case 'lg':
        return 52;  // Reduced from 56 for better balance
      default: // md
        return 44;  // More compact default
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
          borderWidth: isFocused ? 2 : 1,
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
    alignItems: props.multiline ? 'flex-start' : 'center',
    ...getPadding(),
    ...(variant === 'default' && isFocused ? SHADOWS.sm : {}),
  };

  const typography = createTypographyStyles(colors);

  const textInputStyles: TextStyle = {
    flex: 1,
    fontSize: size === 'sm' ? 14 : size === 'lg' ? 16 : 15, // Size-appropriate font
    lineHeight: size === 'sm' ? 18 : size === 'lg' ? 22 : 20, // Better line height
    color: isDisabled ? colors.textDisabled : colors.text,
    paddingHorizontal: (leftIcon || rightIcon) ? 6 : 0, // Reduced icon padding
    // Improve text input experience
    includeFontPadding: false,
    textAlignVertical: props.multiline ? 'top' : 'center',
    fontWeight: '400' as any, // Consistent normal weight
  };

  return (
    <View style={containerStyle}>
      {label && (
        <RNText
          style={[typography.label, styles.label, {
            color: hasError ? colors.error : colors.textSecondary,
            fontSize: 13,    // Slightly smaller for better hierarchy
            fontWeight: '500', // Medium weight for clarity
            marginBottom: 6,   // Better spacing from input
          }]}
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
          style={[typography.caption, styles.helperText, { 
            color: hasError ? colors.error : colors.textTertiary 
          }]}
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
    marginTop: tokens.spacing.xs,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  label: {
    marginBottom: tokens.spacing.xs,
  },
});