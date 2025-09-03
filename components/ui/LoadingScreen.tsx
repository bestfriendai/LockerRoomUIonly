import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useTheme } from '../../providers/ThemeProvider';
import { tokens } from '../../constants/tokens';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  showLogo = true,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      <View style={styles.content}>
        {showLogo && (
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'timing',
              duration: 800,
              delay: 200,
            }}
            style={styles.logoContainer}
          >
            {/* App Logo */}
            <View style={[styles.logo, { backgroundColor: colors.primary }]}>
              <Text style={[styles.logoText, { color: colors.onPrimary }]}>
                LR
              </Text>
            </View>
          </MotiView>
        )}

        {/* Loading Animation */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 600,
            delay: 400,
          }}
          style={styles.loadingContainer}
        >
          {/* Animated Dots */}
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <MotiView
                key={index}
                from={{ opacity: 0.3, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'timing',
                  duration: 800,
                  delay: index * 200 + 600,
                  loop: true,
                  repeatReverse: true,
                }}
                style={[
                  styles.dot,
                  { backgroundColor: colors.primary }
                ]}
              />
            ))}
          </View>

          {/* Loading Message */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 600,
              delay: 800,
            }}
          >
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {message}
            </Text>
          </MotiView>
        </MotiView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
  },
  logoContainer: {
    marginBottom: tokens.spacing.xl * 2,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: tokens.fontSize['3xl'],
    fontWeight: tokens.fontWeight.bold as any,
    fontFamily: 'Inter',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  message: {
    fontSize: tokens.fontSize.base,
    fontWeight: tokens.fontWeight.medium as any,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
});
