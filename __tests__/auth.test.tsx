import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import SignInScreen from '../app/(auth)/signin';
import SignUpScreen from '../app/(auth)/signup';
import { AuthProvider } from '../providers/AuthProvider';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Mock Firebase
jest.mock('../utils/firebase', () => ({
  auth: {},
  db: {},
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
  Link: ({ children }: any) => children,
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sign In', () => {
    it('should render sign in form correctly', () => {
      const { getByPlaceholderText, getByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <SignInScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
    });

    it('should handle successful sign in', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });

      const { getByPlaceholderText, getByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <SignInScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const signInButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          auth,
          'test@example.com',
          'password123'
        );
      });
    });

    it('should show error on invalid credentials', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials')
      );

      const { getByPlaceholderText, getByText, findByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <SignInScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const signInButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'invalid@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(signInButton);

      const errorMessage = await findByText(/Invalid credentials/i);
      expect(errorMessage).toBeTruthy();
    });

    it('should validate email format', async () => {
      const { getByPlaceholderText, getByText, findByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <SignInScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const emailInput = getByPlaceholderText('Email');
      const signInButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'invalidemail');
      fireEvent.press(signInButton);

      const errorMessage = await findByText(/valid email/i);
      expect(errorMessage).toBeTruthy();
    });
  });

  describe('Sign Up', () => {
    it('should render sign up form correctly', () => {
      const { getByPlaceholderText, getByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <SignUpScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
      expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
      expect(getByText('Sign Up')).toBeTruthy();
    });

    it('should handle successful sign up', async () => {
      const mockUser = { uid: 'new-uid', email: 'newuser@example.com' };
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });

      const { getByPlaceholderText, getByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <SignUpScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const confirmPasswordInput = getByPlaceholderText('Confirm Password');
      const signUpButton = getByText('Sign Up');

      fireEvent.changeText(emailInput, 'newuser@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');
      fireEvent.press(signUpButton);

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          auth,
          'newuser@example.com',
          'password123'
        );
      });
    });

    it('should validate password match', async () => {
      const { getByPlaceholderText, getByText, findByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <SignUpScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const passwordInput = getByPlaceholderText('Password');
      const confirmPasswordInput = getByPlaceholderText('Confirm Password');
      const signUpButton = getByText('Sign Up');

      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password456');
      fireEvent.press(signUpButton);

      const errorMessage = await findByText(/Passwords do not match/i);
      expect(errorMessage).toBeTruthy();
    });

    it('should validate password strength', async () => {
      const { getByPlaceholderText, getByText, findByText } = render(
        <AuthProvider>
          <NavigationContainer>
            <SignUpScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      const passwordInput = getByPlaceholderText('Password');
      const confirmPasswordInput = getByPlaceholderText('Confirm Password');
      const signUpButton = getByText('Sign Up');

      fireEvent.changeText(passwordInput, '123');
      fireEvent.changeText(confirmPasswordInput, '123');
      fireEvent.press(signUpButton);

      const errorMessage = await findByText(/at least 6 characters/i);
      expect(errorMessage).toBeTruthy();
    });
  });

  describe('Auth State Management', () => {
    it('should track auth state changes', async () => {
      const mockCallback = jest.fn();
      const { onAuthStateChanged } = require('firebase/auth');
      
      onAuthStateChanged.mockImplementation((auth, callback) => {
        mockCallback.mockImplementation(callback);
        return jest.fn(); // unsubscribe function
      });

      render(
        <AuthProvider>
          <NavigationContainer>
            <SignInScreen />
          </NavigationContainer>
        </AuthProvider>
      );

      // Simulate user sign in
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      mockCallback(mockUser);

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(mockUser);
      });

      // Simulate user sign out
      mockCallback(null);

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(null);
      });
    });
  });
});