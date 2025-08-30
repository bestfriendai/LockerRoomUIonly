import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut as firebaseSignOut, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '../utils/firebase';
import { User } from '../types';
import { createUser, getUserById, updateUser, subscribeToUserChanges } from '../services/userService';



interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: Partial<User> & { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>; // Added missing method
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  demoLogin: () => Promise<void>; // Added missing method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let userUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? firebaseUser.uid : 'null');

      try {
        // Clean up previous user subscription
        if (userUnsubscribe) {
          userUnsubscribe();
          userUnsubscribe = null;
        }

        if (firebaseUser) {
          console.log('Firebase user found, getting user data...');

          // Try to get user data from Firestore with retry logic
          let userData = null;
          let retries = 3;

          while (retries > 0 && !userData) {
            try {
              userData = await getUserById(firebaseUser.uid);
              if (userData) {
                console.log('User data found in Firestore');
                break;
              }
            } catch (error) {
              console.log(`Attempt ${4 - retries} failed, retrying...`, error);
              retries--;
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }

          if (userData) {
            setUser(userData);
            // Subscribe to real-time updates for this user
            userUnsubscribe = subscribeToUserChanges(firebaseUser.uid, (updatedUser) => {
              console.log('User data updated from Firestore');
              setUser(updatedUser);
            });
          } else {
            console.log('User not found in Firestore, creating new user document...');

            // Ensure we have a fresh authentication token
            await firebaseUser.getIdToken(true);

            const newUser: Omit<User, 'id'> = {
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'New User',
              email: firebaseUser.email || '',
              age: 25,
              bio: '',
              photos: [],
              location: '',
              interests: [],
              verified: false,
              profileComplete: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastActive: new Date(),
              isOnline: true
            };

            try {
              const createdUser = await createUser(firebaseUser.uid, newUser);
              console.log('New user created successfully');
              setUser(createdUser);

              // Subscribe to real-time updates for the new user
              userUnsubscribe = subscribeToUserChanges(firebaseUser.uid, (updatedUser) => {
                console.log('New user data updated from Firestore');
                setUser(updatedUser);
              });
            } catch (createError) {
              console.error('Failed to create user document:', createError);
              // Set a minimal user object to prevent auth loops
              setUser({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'New User',
                email: firebaseUser.email || '',
                age: 25,
                bio: '',
                photos: [],
                location: '',
                interests: [],
                verified: false,
                profileComplete: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastActive: new Date(),
                isOnline: true
              });
            }
          }
        } else {
          console.log('No Firebase user, setting user to null');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      if (userUnsubscribe) {
        userUnsubscribe();
      }
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Starting sign in process...');
      setIsLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful for user:', userCredential.user.uid);

      // Don't set loading to false here - let the auth state change handler do it
      // This prevents race conditions with navigation
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false); // Only set loading false on error
      throw error;
    }
  };

  const signUp = async (userData: Partial<User> & { email: string; password: string }): Promise<void> => {
    try {
      console.log('Starting sign up process...');
      setIsLoading(true);

      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      console.log('Firebase user created:', firebaseUser.uid);

      // Wait for the auth token to be fully established
      await firebaseUser.getIdToken(true);

      const newUser: Omit<User, 'id'> = {
        name: userData.name || userData.email.split('@')[0] || 'New User',
        age: userData.age || 25,
        bio: userData.bio || '',
        photos: userData.photos || [],
        location: userData.location || '',
        interests: userData.interests || [],
        verified: false,
        profileComplete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date(),
        isOnline: true,
        email: userData.email, // Ensure email is set correctly
      };

      try {
        console.log('Creating user document in Firestore...');
        const createdUser = await createUser(firebaseUser.uid, newUser);
        console.log('User document created successfully');

        // Don't set user here - let the auth state change handler do it
        // This prevents race conditions with navigation
      } catch (createError) {
        console.error('Failed to create user document:', createError);
        // Don't throw here - the auth state change handler will handle it
      }

      // Don't set loading to false here - let the auth state change handler do it
    } catch (error) {
      console.error('Sign up error:', error);
      setIsLoading(false); // Only set loading false on error
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      if (user) {
        // For now, just update the local user state
        setUser({ ...user, ...userData });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const deleteAccount = async (): Promise<void> => {
    try {
      if (user && auth.currentUser) {
        // Delete user data from Firestore first
        // Note: We would need to implement deleteUser in userService
        // For now, we'll just delete the auth account
        await auth.currentUser.delete();
        setUser(null);
      }
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    // Alias for updateProfile
    await updateProfile(userData);
  };

  const demoLogin = async () => {
    // Demo login implementation
    await signIn('demo@example.com', 'demo123');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateUser,
    resetPassword,
    deleteAccount,
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