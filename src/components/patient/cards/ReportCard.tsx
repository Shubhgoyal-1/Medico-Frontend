import React from "react";
import { FileText, Download, Eye, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { Report } from "../dashboard/types";

export function ReportCard({ reportDate, reportName, notes, doctorName, attentionNeed, reportFileUri }: Report) {
  const handlePreview = () => window.open(reportFileUri, "_blank");
  const needsAttention = attentionNeed?.toLowerCase() === "high" || attentionNeed?.toLowerCase() === "critical";

  return (
    <div className={`bg-white rounded-xl p-5 border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
      needsAttention ? 'border-red-100 hover:border-red-200' : 'border-gray-100 hover:border-blue-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${
            needsAttention
              ? 'bg-gradient-to-br from-red-500 to-rose-600'
              : 'bg-gradient-to-br from-blue-500 to-teal-500'
          }`}>
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{reportName}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{reportDate}</p>
          </div>
        </div>

        {/* Attention Badge */}
        {attentionNeed && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
            needsAttention ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-700'
          }`}>
            {needsAttention
              ? <AlertCircle className="w-3.5 h-3.5" />
              : <CheckCircle2 className="w-3.5 h-3.5" />
            }
            {attentionNeed}
          </div>
        )}
      </div>

      {/* Notes */}
      {notes && (
        <div className="bg-gray-50 rounded-lg px-3 py-2.5 mb-3 text-sm text-gray-600 border border-gray-100">
          <span className="font-medium text-gray-700">Notes: </span>{notes}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <span className="text-xs">Dr. {doctorName || 'Unknown'}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 text-xs font-medium transition-colors"
            title="Preview"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <a
            href={reportFileUri}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </a>
        </div>
      </div>
    </div>
  );
}
