import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut as firebaseSignOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { User } from '../types';
import { createUser, getUserById, subscribeToUserChanges } from '../services/userService';
import * as Sentry from 'sentry-expo';
import { showErrorAlert, logError } from '../utils/errorHandler';


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



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authTransitioning, setAuthTransitioning] = useState(false);

  useEffect(() => {
    let userUnsubscribe: (() => void) | null = null;
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      try {
        Sentry.Native.setTag('auth_state', firebaseUser ? 'authenticated' : 'unauthenticated');
      } catch (sentryError) {
        console.warn('Sentry tag failed:', sentryError);
      }

      if (__DEV__) {

        console.log('Auth state changed:', firebaseUser ? firebaseUser.uid : 'null');

      }

      try {
        // Clean up previous user subscription
        if (userUnsubscribe) {
          userUnsubscribe();
          userUnsubscribe = null;
        }

        if (firebaseUser) {
          if (__DEV__) {
            console.log('Firebase user found, getting user data...');
          }

          // Try to get user data from Firestore with retry logic
          let userData = null;
          let retries = 3;

          while (retries > 0 && !userData) {
            try {
              userData = await getUserById(firebaseUser.uid);
              if (userData) {
                if (__DEV__) {
                  console.log('User data found in Firestore');
                }
                break;
              }
            } catch (error) {
              if (__DEV__) {
                console.log(`Attempt ${4 - retries} failed, retrying...`, error);
              }
              retries--;
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }

          if (userData) {
            if (mounted) {
              setUser(userData);
              // Subscribe to real-time updates for this user
              userUnsubscribe = subscribeToUserChanges(firebaseUser.uid, (updatedUser) => {
                if (__DEV__) {
                  console.log('User data updated from Firestore');
                }
                if (mounted) {
                  setUser(updatedUser);
                }
              });
            }
          } else {
            if (__DEV__) {
              console.log('User not found in Firestore, creating new user document...');
            }

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
              isOnline: true,
              // Anonymous user fields
              isAnonymous: true,
              reputationScore: 0,
              reviewCount: 0,
              helpfulVotes: 0,
              badges: [],
            };

            try {
              const createdUser = await createUser(firebaseUser.uid, newUser);
              if (__DEV__) {
                console.log('New user created successfully');
              }
              if (mounted) {
                setUser(createdUser);

                // Subscribe to real-time updates for the new user
                userUnsubscribe = subscribeToUserChanges(firebaseUser.uid, (updatedUser) => {
                  if (__DEV__) {
                    console.log('New user data updated from Firestore');
                  }
                  if (mounted) {
                    setUser(updatedUser);
                  }
                });
              }
            } catch (createError: any) {
              if (__DEV__) {
                console.error('Failed to create user document:', createError);
              }

              // If it's a permission error, show user-friendly message
              if (createError?.message?.includes('Permission denied')) {
                if (__DEV__) {
                  console.log('Permission denied - user will need to refresh or retry');
                }
                // Still set a minimal user to allow navigation
              }

              // Set a minimal user object to prevent auth loops
              if (mounted) {
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
                  isOnline: true,
                  // Anonymous user fields
                  isAnonymous: true,
                  reputationScore: 0,
                  reviewCount: 0,
                  helpfulVotes: 0,
                  badges: [],
                });
              }
            }

	          try {
              Sentry.Native.addBreadcrumb({
                category: 'auth',
                message: 'User data loaded',
                level: 'info' as const
              });
            } catch (sentryError) {
              console.warn('Sentry breadcrumb failed:', sentryError);
            }

          }
        } else {
          if (__DEV__) {
            console.log('No Firebase user, setting user to null');
          }
          if (mounted) {
            setUser(null);
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Auth state change error:', error);
        }
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setAuthTransitioning(false);
        }
      }
    });

    return () => {
      mounted = false;
      if (userUnsubscribe) {
        userUnsubscribe();
      }
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      if (__DEV__) {
        console.log('Starting sign in process...');
      }
      setIsLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (__DEV__) {
        console.log('Sign in successful for user:', userCredential.user.uid);
      }

      // Don't set loading to false here - let the auth state change handler do it
      // This prevents race conditions with navigation
    } catch (error) {
      logError(error, 'Sign In');
      
      try {
        Sentry.Native.captureException(error);
      } catch (sentryError) {
        console.warn('Sentry exception capture failed:', sentryError);
      }
      
      setIsLoading(false); // Only set loading false on error
      
      // Show user-friendly error dialog instead of throwing
      showErrorAlert(error, 'Sign In Failed');
      
      // Don't throw the error - handle it gracefully
      // This prevents the app from crashing
    }
  };

  const signUp = async (userData: Partial<User> & { email: string; password: string }): Promise<void> => {
    try {
      if (__DEV__) {
        console.log('Starting sign up process...');
      }
      setIsLoading(true);
      setAuthTransitioning(true);

      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      if (__DEV__) {
        console.log('Firebase user created:', firebaseUser.uid);
      }

      // Wait for the auth token to be fully established
      await firebaseUser.getIdToken(true);

      const newUser: Omit<User, 'id'> = {
        name: userData.name || userData.email.split('@')[0] || 'New User',
        age: userData.age || 25,
        bio: userData.bio || '',
        photos: [],
        location: userData.location || '',
        interests: userData.interests || [],
        verified: false,
        profileComplete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date(),
        isOnline: true,
        email: userData.email, // Ensure email is set correctly
        // Anonymous user specific fields
        isAnonymous: userData.isAnonymous !== undefined ? userData.isAnonymous : true,
        reputationScore: 0,
        reviewCount: 0,
        helpfulVotes: 0,
        badges: [],
      };

      try {
        if (__DEV__) {
          console.log('Creating user document in Firestore...');
        }
        await createUser(firebaseUser.uid, newUser);
        try {
          Sentry.Native.addBreadcrumb({
            category: 'auth',
            message: 'User doc created',
            level: 'info' as const
          });
        } catch (sentryError) {
          console.warn('Sentry breadcrumb failed:', sentryError);
        }

        // The auth state change handler will update the user state
        // and handle navigation automatically
      } catch (createError: unknown) {
        if (__DEV__) {
          console.error('Failed to create user document:', createError);
        }
        const error = createError as { message?: string };

        // Even if document creation fails, the user is authenticated
        // The auth state handler will retry or handle it
        if (error.message?.includes('Permission denied')) {
          if (__DEV__) {
            console.log('Permission issue detected, but user is authenticated');
          }
        }
      }

      // Don't set loading to false here - let the auth state change handler do it
      // Auth state change will trigger navigation
    } catch (error) {
      logError(error, 'Sign Up');
      
      try {
        Sentry.Native.captureException(error);
      } catch (sentryError) {
        console.warn('Sentry exception capture failed:', sentryError);
      }
      
      setIsLoading(false);
      setAuthTransitioning(false);
      
      // Show user-friendly error dialog instead of throwing
      showErrorAlert(error, 'Sign Up Failed');
      
      // Don't throw the error - handle it gracefully
      // This prevents the app from crashing
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      if (__DEV__) {
        console.error('Sign out error:', error);
      }
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      if (user) {
        // For now, just update the local user state
        setUser({ ...user, ...userData });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Update profile error:', error);
      }
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      if (__DEV__) {
        console.error('Reset password error:', error);
      }
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
      if (__DEV__) {
        console.error('Delete account error:', error);
      }
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    // Alias for updateProfile
    await updateProfile(userData);
  };

  const demoLogin = async () => {
    // Removed hardcoded demo credentials - should be handled properly
    throw new Error('Demo login is not available. Please create an account.');
  };

  const value: AuthContextType = {
    user,
    isLoading: isLoading || authTransitioning,
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