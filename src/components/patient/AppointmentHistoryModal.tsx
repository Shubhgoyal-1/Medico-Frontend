import { useEffect, useState } from 'react';
import { History, X, CheckCircle2, Stethoscope, Calendar, IndianRupee, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API } from '@/config/api';

interface AppointmentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentHistoryModal({ isOpen, onClose }: AppointmentHistoryModalProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/getFinishedAppointments`, { withCredentials: true });
      setHistory(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch appointment history", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white ring-1 ring-white/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Finished Appointment History</h3>
              <p className="text-xs text-blue-100">All completed medical consultations & doctor visits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/15 text-blue-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="p-12 text-center text-gray-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              <p className="text-xs font-semibold">Loading completed appointments...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="text-sm font-bold text-gray-700">No Finished Appointments</h4>
              <p className="text-xs text-gray-400">Completed doctor appointments will appear here automatically.</p>
            </div>
          ) : (
            history.map((app: any) => {
              const doctorObj = typeof app.doctorId === 'object' ? app.doctorId : null;
              const doctorName = doctorObj
                ? `Dr. ${doctorObj.firstName} ${doctorObj.lastName}`
                : 'Specialist Practitioner';
              const spec = doctorObj?.specialization || 'General Practitioner';
              const fee = doctorObj?.feePerVisit ? `₹${doctorObj.feePerVisit}` : 'Free';
              const dateFormatted = new Date(app.date).toLocaleDateString('en-IN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={app._id}
                  className="p-4 rounded-2xl bg-slate-50/60 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    {doctorObj?.avatarUrl ? (
                      <img
                        src={doctorObj.avatarUrl}
                        alt={doctorName}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                        DR
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-sm text-slate-900">{doctorName}</h4>
                      <p className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5" /> {spec}
                      </p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" /> {dateFormatted}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                    </span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                      <IndianRupee className="w-3 h-3 text-gray-400" /> Fee: {fee}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium">{history.length} finished consultation(s)</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
