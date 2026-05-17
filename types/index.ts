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

// Appointment types
export type AppointmentType = 'Ön Görüşme' | 'Rutin Görüşme' | 'Muayene';
export type ServiceType = 'Fizik Tedavi';

// Patient information
export interface PatientInfo {
  name: string;
  phone?: string;
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
  recurringGroupId?: string; // ID to link recurring appointments together
  appointmentType: AppointmentType;
  serviceType: ServiceType;
  patients: PatientInfo[];
  reminderAt?: Timestamp;
  reminderChannel?: 'whatsapp';
  reminderStatus?: 'scheduled' | 'sent' | 'failed' | 'skipped';
  reminderSentAt?: Timestamp;
  reminderError?: string | null;
  reminderProvider?: 'twilio';
  reminderProviderMessageSid?: string;
  reminderProviderStatus?: string;
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
  description?: string;
  startTime: Date;
  endTime: Date;
  recurring?: RecurringOptions;
  appointmentType: AppointmentType;
  serviceType: ServiceType;
  patients: PatientInfo[];
}

// Firebase user data
export interface FirebaseUser {
  uid: string;
  email: string | null;
}
