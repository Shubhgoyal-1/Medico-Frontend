import React from 'react';
// import { Patient } from '../dashboard/types';


interface IMedicine {
  _id: string;
  name: string;
  sideEffects: string;
  notRecommendedFor: string;
}
interface IMedication {
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
// Medical Report type
interface IMedicalReport {
  _id: string;
  patientId: string;
  reportName: string;
  reportFileUri: string;
  notes?: string;
  doctorName?: string;
  doctorId?: string;
  attentionNeed?: "Critical" | "Minor" | "Normal";
  createdAt?: string;
  updatedAt?: string;
}
interface IMedicalHistory {
  condition: string,
  diagnosisDate: string,
  notes: string,
  treatment: string,
  resolved: string,
  doctorId: {
    _id: string,
    firstName: string,
    lastName: string
  }
}
// Patient type
interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  allergies?: string;
  aadharNo?: string;
  fullAddress?: {
    houseNumber: string;
    address: string;
    landmark: string;
    city: string;
    state: string;
  };
  isVerified: boolean;
  medicalHistory: IMedicalHistory[];
  appointments: string[];
  medications: IMedication[];
  medicalReports: IMedicalReport[];
  avatarUrl?: string;
}
// Appointment type
interface AppointmentType {
  _id: string;
  patientId: Patient;
  doctorId: string;
  date: string;
  time: string;
  number: number;
  status: string;
  isFinished: boolean;
}


interface AppointmentCardProps {
  appointment: AppointmentType;
  onClick?: () => void; // <-- callback for selecting appointment
  isSelected?: boolean;  // <-- optional, to highlight the selected one
}

export const AppointmentMiniatureCard: React.FC<AppointmentCardProps> = ({ appointment, onClick, isSelected }) => {
  const initials = appointment.patientId
    ? `${appointment.patientId.firstName?.[0] ?? ''}${appointment.patientId.lastName?.[0] ?? ''}`.toUpperCase()
    : 'P';

  return (
    <div
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer text-xs font-semibold
        ${
          isSelected
            ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-200"
            : "bg-teal-50/60 text-slate-800 border-teal-100 hover:bg-teal-100/70 hover:border-teal-200"
        }
      `}
    >
      {/* Appointment Number Badge */}
      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-extrabold text-[10px] flex-shrink-0 ${
        isSelected ? "bg-white text-blue-700" : "bg-teal-200 text-teal-900"
      }`}>
        #{appointment.number}
      </span>

      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden ring-1 ring-black/5 flex-shrink-0">
        {appointment.patientId?.avatarUrl ? (
          <img
            src={appointment.patientId.avatarUrl}
            alt="Patient Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-bold text-[10px] text-teal-800">{initials}</span>
        )}
      </div>

      {/* Name */}
      <span className="truncate font-semibold flex-1">
        {appointment.patientId?.firstName} {appointment.patientId?.lastName}
      </span>
    </div>
  );
};
