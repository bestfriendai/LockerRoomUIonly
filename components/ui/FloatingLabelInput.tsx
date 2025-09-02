import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Animated,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, borderRadius } from '../../utils/spacing';
import { textStyles } from '../../utils/typography';
import { createTimingAnimation } from '../../utils/animations';

interface FloatingLabelInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  required?: boolean;
  disabled?: boolean;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  error,
  success,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  size = 'md',
  variant = 'outlined',
  required = false,
  disabled = false,
  value,
  onChangeText,
  onFocus,
  onBlur,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  
  const labelAnim = useRef(new Animated.Value(hasValue ? 1 : 0)).current;
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const shouldFloat = isFocused || hasValue;
    createTimingAnimation(labelAnim, shouldFloat ? 1 : 0, 200).start();
  }, [isFocused, hasValue]);

  useEffect(() => {
    const colorValue = error ? 2 : success ? 3 : isFocused ? 1 : 0;
    createTimingAnimation(borderColorAnim, colorValue, 200).start();
  }, [isFocused, error, success]);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    onBlur?.(e);
  };

  const handleChangeText = (text: string) => {
    setHasValue(!!text);
    onChangeText?.(text);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: { minHeight: 56 },
          input: { fontSize: 14, paddingHorizontal: spacing.sm },
          label: { fontSize: 12 },
        };
      case 'lg':
        return {
          container: { minHeight: 72 },
          input: { fontSize: 18, paddingHorizontal: spacing.lg },
          label: { fontSize: 16 },
        };
      default: // md
        return {
          container: { minHeight: 64 },
          input: { fontSize: 16, paddingHorizontal: spacing.md },
          label: { fontSize: 14 },
        };
    }
  };

  const getVariantStyles = () => {
    const baseRadius = borderRadius.lg;
    
    switch (variant) {
      case 'filled':
        return {
          container: {
            backgroundColor: colors.surface,
            borderRadius: baseRadius,
            borderBottomWidth: 2,
          },
          input: { paddingTop: spacing.lg },
        };
      case 'outlined':
        return {
          container: {
            backgroundColor: 'transparent',
            borderRadius: baseRadius,
            borderWidth: 2,
          },
          input: { paddingTop: spacing.md },
        };
      default: // default
        return {
          container: {
            backgroundColor: 'transparent',
            borderBottomWidth: 2,
          },
          input: { paddingTop: spacing.lg },
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [
      colors.border,      // default
      colors.primary,     // focused
      colors.error,       // error
      colors.success,     // success
    ],
  });

  const labelColor = borderColorAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [
      colors.textSecondary, // default
      colors.primary,       // focused
      colors.error,         // error
      colors.success,       // success
    ],
  });

  return (
    <Animated.View 
      style={[
        styles.wrapper,
        { transform: [{ scale: scaleAnim }] },
        containerStyle
      ]}
    >
      <Animated.View
        style={[
          styles.container,
          sizeStyles.container,
          variantStyles.container,
          { borderColor },
          disabled && styles.disabled,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}

        <View style={styles.inputContainer}>
          <Animated.Text
            style={[
              styles.label,
              sizeStyles.label,
              labelStyle,
              {
                color: labelColor,
                transform: [
                  {
                    translateY: labelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -spacing.lg],
                    }),
                  },
                  {
                    scale: labelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.85],
                    }),
                  },
                ],
              },
            ]}
          >
            {label}{required && ' *'}
          </Animated.Text>

          <TextInput
            style={[
              styles.input,
              sizeStyles.input,
              variantStyles.input,
              { color: colors.text },
              inputStyle,
            ]}
            value={value}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.primary}
            editable={!disabled}
            {...props}
          />
        </View>

        {rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </Animated.View>

      {(error || helperText) && (
        <Text 
          style={[
            styles.helperText,
            error ? { color: colors.error } : { color: colors.textSecondary }
          ]}
        >
          {error || helperText}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 0,
    top: spacing.lg,
    fontWeight: '500',
    zIndex: 1,
  },
  input: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xs,
    minHeight: 24,
    zIndex: 0,
  },
  leftIcon: {
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
    ...textStyles.caption,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default FloatingLabelInput;
