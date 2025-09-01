import { View, ActivityIndicator, Text } from 'react-native';

export default function IndexScreen() {
  // Simple loading screen with hardcoded colors - AuthGuard handles all navigation logic
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF'
    }}>
      <View style={{
        backgroundColor: '#FF6B6B',
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}>
        <Text style={{
          color: '#FFFFFF',
          fontSize: 32,
          fontWeight: 'bold'
        }}>
          LR
        </Text>
      </View>
      <ActivityIndicator size="large" color="#FF6B6B" />
      <Text style={{
        marginTop: 16,
        color: '#666666',
        fontSize: 16,
        fontWeight: '500'
      }}>
        LockerRoom Talk
      </Text>
      <Text style={{
        marginTop: 8,
        color: '#999999',
        fontSize: 14
      }}>
        Loading...
      </Text>
    </View>
  );
}