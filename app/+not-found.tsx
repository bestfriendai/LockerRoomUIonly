import React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Home, ArrowLeft, Search, RefreshCw } from "lucide-react-native";
import { useTheme } from "../providers/ThemeProvider";
import { Button } from "../components/ui/Button";
import Card from "../components/ui/Card";

const { width: screenWidth } = Dimensions.get('window');

export default function NotFoundScreen() {
  const router = useRouter();
  const { colors, tokens, isDark } = useTheme();

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSearch = () => {
    router.push('/(tabs)/search');
  };

  const handleRefresh = () => {
    // In a real app, this might retry the current route or refresh data
    // For now, just go back to home since we can't get current pathname
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Error Illustration */}
        <View style={[styles.illustration, { backgroundColor: colors.card }]}>
          <Text style={[styles.errorCode, { color: colors.primary }]}>
            404
          </Text>
          <Text style={[styles.errorEmoji, { color: colors.textSecondary }]}>
            🔍
          </Text>
        </View>

        {/* Error Message */}
        <View style={(styles as any)?.messageContainer}>
          <Text style={styles.title}>
            Page Not Found
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}
          >
            Sorry, we couldn't find the page you're looking for. 
            It might have been moved, deleted, or you entered the wrong URL.
          </Text>
        </View>

        {/* Action Buttons */}
        <Card style={styles.actionsCard}>
          <Text style={{ marginBottom: 16 }}>
            What would you like to do?
          </Text>
          
          <View style={styles.actionButtons}>
            <Button
              onPress={handleGoHome}
              leftIcon={<Home size={20} color={colors.background} strokeWidth={1.5} />}
              style={styles.primaryButton}
            >
              Go to Home
            </Button>

            <Button
              onPress={handleGoBack}
              leftIcon={<ArrowLeft size={20} color={colors.text} strokeWidth={1.5} />}
              style={styles.secondaryButton}
            >
              Go Back
            </Button>

            <Button
              onPress={handleSearch}
              leftIcon={<Search size={20} color={colors.text} strokeWidth={1.5} />}
              style={styles.secondaryButton}
            >
              Search
            </Button>

            <Button
              onPress={handleRefresh}
              leftIcon={<RefreshCw size={20} color={colors.textSecondary} strokeWidth={1.5} />}
              style={styles.ghostButton}
            >
              Refresh Page
            </Button>
          </View>
        </Card>

        {/* Help Section */}
        <Card style={styles.helpCard}>
          <Text style={{ marginBottom: 12 }}>
            Need Help?
          </Text>
          
          <View style={styles.helpContent}>
            <View style={styles.helpItem}>
              <Text style={styles.helpBullet}>•</Text>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Check if the URL is spelled correctly
              </Text>
            </View>
            
            <View style={styles.helpItem}>
              <Text style={styles.helpBullet}>•</Text>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Try searching for what you're looking for
              </Text>
            </View>
            
            <View style={styles.helpItem}>
              <Text style={styles.helpBullet}>•</Text>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Go back to the home page and navigate from there
              </Text>
            </View>
            
            <View style={styles.helpItem}>
              <Text style={styles.helpBullet}>•</Text>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Contact support if the problem persists
              </Text>
            </View>
          </View>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            MockTrae • Error 404
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionButtons: {
    gap: 12,
  },
  actionsCard: {
    marginBottom: 24,
    padding: 20,
    width: '100%',
  },
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  description: {
    lineHeight: 24,
    maxWidth: screenWidth - 80,
    textAlign: 'center',
  },
  errorCode: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorEmoji: {
    bottom: 20,
    fontSize: 32,
    position: 'absolute',
    right: 20,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    textAlign: 'center',
  },
  ghostButton: {
    width: '100%',
  },
  helpBullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  helpCard: {
    marginBottom: 24,
    padding: 20,
    width: '100%',
  },
  helpContent: {
    gap: 8,
  },
  helpItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  helpText: {
    flex: 1,
    lineHeight: 18,
  },
  illustration: {
    alignItems: 'center',
    borderRadius: 80,
    height: 160,
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
    width: 160,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
});