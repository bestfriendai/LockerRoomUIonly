import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../utils/firebase';
import { User } from '../types';

const USERS_COLLECTION = 'users';

// Create or update user profile
export const createUser = async (userId: string, userData: any) => {
  try {
    console.log('Creating user with ID:', userId);

    // Verify we have an authenticated user
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error(`Authentication mismatch. Expected: ${userId}, Got: ${currentUser?.uid || 'null'}`);
    }

    // Get fresh ID token to ensure authentication is valid
    await currentUser.getIdToken(true);

    const userRef = doc(db, USERS_COLLECTION, userId);

    // Check if user already exists
    const existingUser = await getDoc(userRef);
    if (existingUser.exists()) {
      console.log('User already exists, returning existing data');
      return { id: existingUser.id, ...existingUser.data() } as User;
    }

    const userDoc = {
      id: userId,
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isOnline: true,
      lastSeen: serverTimestamp()
    };

    console.log('Creating new user document...');
    await setDoc(userRef, userDoc);

    // Return the created user with actual timestamps
    const createdUserSnap = await getDoc(userRef);
    if (createdUserSnap.exists()) {
      const createdUser = { id: createdUserSnap.id, ...createdUserSnap.data() } as User;
      console.log('User created successfully!');
      return createdUser;
    } else {
      throw new Error('Failed to retrieve created user document');
    }
  } catch (error) {
    console.error('Error creating user:', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      userId
    });
    throw error;
  }
};

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

// Update user profile
export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    // Get the updated user data
    const updatedUser = await getUserById(userId);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Get users by location (for matching)
export async function getUsersByLocation(location: string, excludeUserId?: string): Promise<User[]> {
  try {
    let q = query(
      collection(db, USERS_COLLECTION),
      where('location', '==', location),
      where('isActive', '==', true),
      limit(20)
    );

    if (excludeUserId) {
      q = query(
        collection(db, USERS_COLLECTION),
        where('location', '==', location),
        where('isActive', '==', true),
        where('id', '!=', excludeUserId),
        limit(20)
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  } catch (error) {
    console.error('Error getting users by location:', error);
    throw error;
  }
}

// Search users by interests
export async function getUsersByInterests(interests: string[], excludeUserId?: string): Promise<User[]> {
  try {
    let q = query(
      collection(db, USERS_COLLECTION),
      where('interests', 'array-contains-any', interests),
      where('isActive', '==', true),
      limit(20)
    );

    if (excludeUserId) {
      q = query(
        collection(db, USERS_COLLECTION),
        where('interests', 'array-contains-any', interests),
        where('isActive', '==', true),
        where('id', '!=', excludeUserId),
        limit(20)
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  } catch (error) {
    console.error('Error getting users by interests:', error);
    throw error;
  }
}

// Listen to user profile changes
export function subscribeToUser(userId: string, callback: (user: User | null) => void): () => void {
  const userRef = doc(db, USERS_COLLECTION, userId);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as User);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error listening to user:', error);
    callback(null);
  });
}

// Listen to user changes (alias for AuthProvider compatibility)
export const subscribeToUserChanges = subscribeToUser;

// Delete user account
export async function deleteUser(userId: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Update user's online status
export async function updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      isOnline,
      lastSeen: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating online status:', error);
    throw error;
  }
}

// Search users by name or username
export async function searchUsers(searchTerm: string): Promise<User[]> {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation - consider using Algolia or similar for production
    const q = query(
      collection(db, USERS_COLLECTION),
      where('isActive', '==', true),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const allUsers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];

    // Filter users that contain the search term in name or username
    return allUsers.filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

// Export UserService class for backward compatibility
export class UserService {
  static createUser = createUser;
  static getUserById = getUserById;
  static updateUser = updateUser;
  static getUsersByLocation = getUsersByLocation;
  static getUsersByInterests = getUsersByInterests;
  static subscribeToUser = subscribeToUser;
  static deleteUser = deleteUser;
  static updateOnlineStatus = updateOnlineStatus;
  static searchUsers = searchUsers;
}