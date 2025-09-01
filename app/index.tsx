import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function IndexScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome to LockerRoom Talk</Text>
      <Button 
        title="Go to Auth" 
        onPress={() => router.push('/(auth)/signin')}
      />
      <View style={{ height: 20 }} />
      <Button 
        title="Go to Tabs" 
        onPress={() => router.push('/(tabs)')}
      />
    </View>
  );
}