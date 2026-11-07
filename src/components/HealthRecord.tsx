import React, { useState } from 'react';
import { FileText, Calendar, User, ChevronDown, ChevronUp, CheckCircle2, Clock } from 'lucide-react';
import { Record } from './patient/dashboard/types';

export function HealthRecord({ condition, treatment, doctorId, diagnosisDate, notes, resolved }: Record) {
  const [expanded, setExpanded] = useState(false);
  const isResolved = resolved === 'true' || resolved === true as any;

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-all duration-200 hover:shadow-md overflow-hidden">
      {/* Header Row */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${
          isResolved
            ? 'bg-gradient-to-br from-teal-500 to-teal-600'
            : 'bg-gradient-to-br from-blue-500 to-blue-600'
        }`}>
          {isResolved
            ? <CheckCircle2 className="w-5 h-5 text-white" />
            : <FileText className="w-5 h-5 text-white" />
          }
        </div>

        {/* Info */}
        <div className="flex-grow min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-base">
              Diagnosed with <span className="text-blue-600">{condition}</span>
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isResolved
                ? 'bg-teal-50 text-teal-700'
                : 'bg-blue-50 text-blue-700'
            }`}>
              {isResolved ? 'Resolved' : 'Ongoing'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Dr. {doctorId?.firstName} {doctorId?.lastName}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              {diagnosisDate}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          {expanded
            ? <ChevronUp className="w-5 h-5 text-blue-500" />
            : <ChevronDown className="w-5 h-5 text-gray-300" />
          }
        </div>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-3">
          {treatment && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">Treatment</p>
              <p className="text-sm text-gray-700">{treatment}</p>
            </div>
          )}
          {notes && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Doctor's Notes</p>
              <p className="text-sm text-gray-600">{notes}</p>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
            <Clock className="w-3.5 h-3.5" />
            {isResolved ? 'This condition has been resolved' : 'Currently under treatment'}
          </div>
        </div>
      )}
    </div>
  );
}