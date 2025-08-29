import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockUsers } from '../data/mockData';

interface User {
  id: string;
  _id?: string;
  name: string;
  email?: string;
  age: number;
  bio: string;
  photos: string[];
  location?: string;
  interests: string[];
  verified: boolean;
  lastActive: string;
  displayName?: string;
  height?: string;
  relationshipGoals?: string;
  profileComplete?: boolean;
  reviewsCount?: number;
  matchesCount?: number;
  rating?: number;
  username?: string;
  profilePicture?: string;
  photoURL?: string;
  phone?: string;
  gender?: string;
  datingPreferences?: {
    ageRange: {
      min: number;
      max: number;
    };
    gender: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (userData: Partial<User> & { email: string; password: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  demoLogin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, _password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For mock app: Accept any email/password combination
      // Use first mock user as default or create a demo user
      let userToLogin;
      
      if (email && mockUsers.length > 0) {
        // Try to find user by email first
        const foundUser = mockUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
        userToLogin = foundUser || mockUsers[0]; // Use first mock user as fallback
      } else {
        // Create a demo user if no email provided or no mock users available
        userToLogin = {
          id: 'demo-user',
          name: 'Demo User',
          email: email || 'demo@mocktrae.com',
          age: 25,
          bio: 'Demo user for MockTrae app',
          photos: [],
          location: 'Demo City',
          interests: ['Demo', 'Testing'],
          verified: true,
          lastActive: new Date().toISOString(),
        };
      }
      
      const userWithEmail = { ...userToLogin, email: email || userToLogin.email };
      await AsyncStorage.setItem('user', JSON.stringify(userWithEmail));
      setUser(userWithEmail);
      return true;
    } catch (error) {
      // Even on error, allow login for demo purposes
      const demoUser = {
        id: 'demo-user-fallback',
        name: 'Demo User',
        email: email || 'demo@mocktrae.com',
        age: 25,
        bio: 'Demo user for MockTrae app',
        photos: [],
        location: 'Demo City',
        interests: ['Demo', 'Testing'],
        verified: true,
        lastActive: new Date().toISOString(),
      };
      await AsyncStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: Partial<User> & { email: string; password: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name || 'New User',
        email: userData.email,
        age: userData.age || 25,
        bio: userData.bio || '',
        photos: userData.photos || [],
        location: userData.location || '',
        interests: userData.interests || [],
        verified: false,
        lastActive: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch (error) {
      // Sign up error
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      // Sign out error
    }
  };

  const demoLogin = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Use first mock user or create a demo user
      const demoUser = mockUsers.length > 0 ? mockUsers[0] : {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@mocktrae.com',
        age: 25,
        bio: 'Demo user exploring MockTrae',
        photos: [],
        location: 'Demo City',
        interests: ['Demo', 'Testing'],
        verified: true,
        lastActive: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      if (user) {
        const updatedUser = { ...user, ...userData };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateUser: updateProfile, // Alias for updateProfile
    demoLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}