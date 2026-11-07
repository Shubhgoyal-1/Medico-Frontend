export interface IMedicine {
  _id: string;
  name: string;
  sideEffects: string;
  notRecommendedFor: string;
}

export interface PatientMedication {
  _id: string;
  medicationId: IMedicine;
  dosage: string;
  frequency: string;
  time: string;
  prescribedBy?: string;
  prescribedTo?: string;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

export type IMedication = PatientMedication;

export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  feePerVisit: number;
  licenseNumber?: string;
  workplace?: {
    type: string;
    name: string;
    address: string;
    state: string;
    city: string;
  };
  avatarUrl?: string;
  isVerified?: boolean | string;
  patients?: string[];
  appointments?: string[];
  aadharNo?: string;
  patientLimit?: number;
  gender?: string;
  preferences?: {
    autoConfirmBooking?: boolean;
    emailNotifications?: boolean;
    smsAlerts?: boolean;
    allowEmergencyBooking?: boolean;
    consultationSlotMinutes?: number;
  };
}

export interface Appointment {
  _id: string;
  patientId: string | Patient;
  doctorId: Doctor | {
    _id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  date: string;
  time: string;
  number: number;
  status: string;
  isFinished: boolean;
  __v?: string;
}

export type AppointmentType = Appointment;

export interface Hospital {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  city?: string;
  state?: string;
  pincode?: string;
  hospitalId?: string;
  type?: string;
}

export interface Record {
  condition: string;
  diagnosisDate: string;
  notes?: string;
  treatment?: string;
  resolved?: boolean | string;
  doctorId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
  } | string;
}

export type IMedicalHistory = Record;

export interface Report {
  _id: string;
  reportUniqueId?: string;
  patientId: string;
  reportName: string;
  reportDate?: string;
  reportFileUri: string;
  notes?: string;
  doctorName?: string;
  doctorId?: string;
  attentionNeed?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type IMedicalReport = Report;

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  allergies?: string;
  aadharNo?: string;
  fullAddress?: {
    houseNumber?: string;
    address?: string;
    landmark?: string;
    city?: string;
    state?: string;
  };
  isVerified?: boolean | string;
  medicalHistory?: IMedicalHistory[];
  appointments?: string[] | AppointmentType[];
  medications?: string[] | IMedication[];
  reports?: string[] | IMedicalReport[];
  medicalReports?: IMedicalReport[];
  avatarUrl?: string;
}
