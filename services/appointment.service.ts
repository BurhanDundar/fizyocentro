import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  onSnapshot,
  QuerySnapshot,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Appointment, AppointmentFormData } from '@/types';

const APPOINTMENTS_COLLECTION = 'appointments';

/**
 * Get all appointments for a specific user
 */
export const getAppointmentsByUserId = async (
  userId: string
): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('startTime', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Appointment)
    );
  } catch (error) {
    console.error('Error getting appointments:', error);
    throw error;
  }
};

/**
 * Get all appointments (admin only)
 */
export const getAllAppointments = async (): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      orderBy('startTime', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Appointment)
    );
  } catch (error) {
    console.error('Error getting all appointments:', error);
    throw error;
  }
};

/**
 * Create a new appointment
 */
export const createAppointment = async (
  userId: string,
  data: AppointmentFormData
): Promise<string> => {
  try {
    const appointmentData = {
      userId,
      patientName: data.patientName,
      description: data.description,
      startTime: Timestamp.fromDate(data.startTime),
      endTime: Timestamp.fromDate(data.endTime),
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, APPOINTMENTS_COLLECTION),
      appointmentData
    );
    return docRef.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

/**
 * Update an existing appointment
 */
export const updateAppointment = async (
  appointmentId: string,
  data: AppointmentFormData
): Promise<void> => {
  try {
    const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);

    await updateDoc(appointmentRef, {
      patientName: data.patientName,
      description: data.description,
      startTime: Timestamp.fromDate(data.startTime),
      endTime: Timestamp.fromDate(data.endTime),
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

/**
 * Delete an appointment
 */
export const deleteAppointment = async (
  appointmentId: string
): Promise<void> => {
  try {
    await deleteDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId));
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for user appointments
 */
export const subscribeToUserAppointments = (
  userId: string,
  callback: (appointments: Appointment[]) => void
): (() => void) => {
  const q = query(
    collection(db, APPOINTMENTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('startTime', 'asc')
  );

  return onSnapshot(q, (snapshot: QuerySnapshot) => {
    const appointments = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Appointment)
    );
    callback(appointments);
  });
};

/**
 * Subscribe to real-time updates for all appointments (admin)
 */
export const subscribeToAllAppointments = (
  callback: (appointments: Appointment[]) => void
): (() => void) => {
  const q = query(
    collection(db, APPOINTMENTS_COLLECTION),
    orderBy('startTime', 'asc')
  );

  return onSnapshot(q, (snapshot: QuerySnapshot) => {
    const appointments = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Appointment)
    );
    callback(appointments);
  });
};
