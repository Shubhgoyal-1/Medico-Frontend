import React from 'react';
import { Pill, Clock, Calendar, AlertCircle } from 'lucide-react';

interface MedicationCardProps {
  _id: string;
  medicationId: {
    _id: string;
    name: string;
    sideEffects: string;
    notRecommendedFor: string;
  };
  dosage: string;
  frequency: string;
  time: string;
  prescribedBy?: string;
  prescribedTo?: string;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

export function MedicationCard({ medicationId, dosage, frequency, time, active, startDate, endDate }: MedicationCardProps) {
  const isActive = active !== false;

  return (
    <div className={`relative bg-white rounded-xl p-4 border transition-all duration-200 hover:shadow-lg hover:shadow-blue-100/80 hover:-translate-y-0.5 ${
      isActive ? 'border-gray-200 hover:border-blue-300' : 'border-gray-100 opacity-70'
    }`}>
      {/* Active Badge */}
      <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isActive ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-500'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-teal-500' : 'bg-gray-400'}`} />
        {isActive ? 'Active' : 'Inactive'}
      </div>

      {/* Icon + Name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Pill className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 pr-14">
          <h3 className="font-semibold text-gray-900 truncate">{medicationId.name}</h3>
          <p className="text-xs text-blue-600 font-medium">{dosage}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="text-xs">{frequency} · {time}</span>
        </div>
        {startDate && endDate && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
            <span>
              {new Date(startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              {' – '}
              {new Date(endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}
        {medicationId.sideEffects && (
          <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mt-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{medicationId.sideEffects}</span>
          </div>
        )}
      </div>
    </div>
  );
}