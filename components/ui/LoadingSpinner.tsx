import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/providers/ThemeProvider';
import { Spinner } from './LoadingAnimations';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  fullScreen?: boolean;
  color?: string;
}

export default function LoadingSpinner({ 
  size = 'large', 
  text = 'Loading...', 
  fullScreen = false,
  color
}: LoadingSpinnerProps) {
  const { colors, tokens } = useTheme();

  const containerStyle = fullScreen ? styles.fullScreenContainer : styles.inlineContainer;

  return (
    <View style={[containerStyle, { backgroundColor: fullScreen ? colors.background : 'transparent' }]}>
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        style={styles.content}
      >
        <Spinner 
          size={size === 'large' ? 32 : 24} 
          color={color || colors.primary} 
          style={{ marginBottom: text ? tokens.spacing.md : 0 }}
        />
        {text && (
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
            {text}
          </Text>
        )}
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  fullScreenContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  inlineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});