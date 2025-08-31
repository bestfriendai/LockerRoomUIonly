import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { Text } from '@/components/ui/Text';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Wait for component to mount before attempting navigation
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && isMounted) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)');
      }
    }
  }, [user, isLoading, isMounted]);

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ marginTop: 16, color: colors.textSecondary }}>
        Loading...
      </Text>
    </View>
  );
}