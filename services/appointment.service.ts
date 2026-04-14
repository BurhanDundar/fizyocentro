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
 * Create a new appointment (supports recurring appointments)
 */
export const createAppointment = async (
  userId: string,
  data: AppointmentFormData
): Promise<string> => {
  try {
    // Check if recurring
    if (data.recurring && data.recurring.type !== 'none' && data.recurring.count > 1) {
      return await createRecurringAppointments(userId, data);
    }

    // Single appointment
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
 * Create recurring appointments
 */
const createRecurringAppointments = async (
  userId: string,
  data: AppointmentFormData
): Promise<string> => {
  try {
    const { recurring } = data;
    if (!recurring || recurring.type === 'none') {
      throw new Error('Invalid recurring configuration');
    }

    // Generate unique group ID for this recurring series
    const recurringGroupId = `recurring_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    const appointments: any[] = [];
    const duration = data.endTime.getTime() - data.startTime.getTime();

    for (let i = 0; i < recurring.count; i++) {
      let newStartTime: Date;

      if (recurring.type === 'daily') {
        newStartTime = new Date(data.startTime.getTime() + (i * 24 * 60 * 60 * 1000));
      } else if (recurring.type === 'weekly') {
        newStartTime = new Date(data.startTime.getTime() + (i * 7 * 24 * 60 * 60 * 1000));
      } else if (recurring.type === 'monthly') {
        newStartTime = new Date(data.startTime);
        newStartTime.setMonth(newStartTime.getMonth() + i);
      } else {
        throw new Error('Invalid recurring type');
      }

      const newEndTime = new Date(newStartTime.getTime() + duration);

      appointments.push({
        userId,
        patientName: data.patientName,
        description: data.description,
        startTime: Timestamp.fromDate(newStartTime),
        endTime: Timestamp.fromDate(newEndTime),
        createdAt: Timestamp.now(),
        recurringGroupId, // Add group ID to link recurring appointments
      });
    }

    // Create all appointments
    const promises = appointments.map(apt =>
      addDoc(collection(db, APPOINTMENTS_COLLECTION), apt)
    );

    const results = await Promise.all(promises);
    return results[0].id; // Return first appointment ID
  } catch (error) {
    console.error('Error creating recurring appointments:', error);
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
 * Delete all appointments in a recurring group
 */
export const deleteRecurringGroup = async (
  recurringGroupId: string
): Promise<void> => {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where('recurringGroupId', '==', recurringGroupId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting recurring group:', error);
    throw error;
  }
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (
  appointmentId: string
): Promise<Appointment | null> => {
  try {
    const appointmentDoc = await getDocs(
      query(collection(db, APPOINTMENTS_COLLECTION), where('__name__', '==', appointmentId))
    );

    if (appointmentDoc.empty) return null;

    const data = appointmentDoc.docs[0].data();
    return {
      id: appointmentDoc.docs[0].id,
      ...data,
    } as Appointment;
  } catch (error) {
    console.error('Error getting appointment:', error);
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
