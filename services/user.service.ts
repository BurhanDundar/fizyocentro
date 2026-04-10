import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, UserRole } from '@/types';

const USERS_COLLECTION = 'users';

/**
 * Get user data from Firestore
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));

    if (!userDoc.exists()) {
      return null;
    }

    return {
      id: userDoc.id,
      ...userDoc.data(),
    } as User;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

/**
 * Create or update user document in Firestore
 */
export const createOrUpdateUser = async (
  userId: string,
  userData: Omit<User, 'id'>
): Promise<void> => {
  try {
    await setDoc(doc(db, USERS_COLLECTION, userId), userData);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};
