import { Timestamp } from 'firebase/firestore';

// User roles
export type UserRole = 'admin' | 'employee';

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Appointment type
export interface Appointment {
  id: string;
  userId: string;
  patientName: string;
  description: string;
  startTime: Timestamp;
  endTime: Timestamp;
  createdAt: Timestamp;
}

// Recurring appointment options
export type RecurringType = 'daily' | 'weekly' | 'monthly' | 'none';

export interface RecurringOptions {
  type: RecurringType;
  count: number; // Number of occurrences
}

// Form types for creating/editing appointments
export interface AppointmentFormData {
  patientName: string;
  description: string;
  startTime: Date;
  endTime: Date;
  recurring?: RecurringOptions;
}

// Firebase user data
export interface FirebaseUser {
  uid: string;
  email: string | null;
}
