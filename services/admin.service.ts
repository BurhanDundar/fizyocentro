import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User } from '@/types';

const USERS_COLLECTION = 'users';

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as User)
    );
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Get all employees (admin only)
 */
export const getAllEmployees = async (): Promise<User[]> => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', 'employee')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as User)
    );
  } catch (error) {
    console.error('Error getting employees:', error);
    throw error;
  }
};
