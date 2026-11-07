import React from 'react';
import { Calendar, Clock, Stethoscope, Hash } from 'lucide-react';

interface AppointmentCardProps {
  number: number;
  date: string;
  doctor: string;
  type: string;
  time: string;
}

export function AppointmentCard({ number, date, doctor, type, time }: AppointmentCardProps) {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-100/70 transition-all duration-200 group w-full">
      {/* Slot Number Badge */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 group-hover:bg-blue-100 transition-colors">
        <Hash className="w-3 h-3 text-blue-400 mb-0.5" />
        <span className="text-lg font-bold text-blue-700 leading-none">{number}</span>
      </div>

      {/* Doctor Icon */}
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
        <Stethoscope className="w-5 h-5 text-white" />
      </div>

      {/* Details */}
      <div className="flex-grow min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">Dr. {doctor}</h3>
        <p className="text-xs text-teal-600 font-medium truncate">{type}</p>
      </div>

      {/* Date & Time */}
      <div className="text-right flex-shrink-0">
        <div className="flex items-center gap-1 justify-end text-gray-600 mb-1">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <p className="text-xs font-medium">{date}</p>
        </div>
        <div className="flex items-center gap-1 justify-end text-gray-500">
          <Clock className="w-3.5 h-3.5 text-teal-400" />
          <p className="text-xs">{time}</p>
        </div>
      </div>
    </div>
  );
}