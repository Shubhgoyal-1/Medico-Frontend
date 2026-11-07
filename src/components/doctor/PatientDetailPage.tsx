import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Patient } from '../patient/dashboard/types';
import { Header } from '@/components/Header';
import { API } from "@/config/api";
import { User, Phone, Droplets, ShieldCheck, ArrowLeft, FileText, HeartPulse } from 'lucide-react';

export const PatientDetailPage = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/doctor/getPatientProfile/${patientId}`, { withCredentials: true });
        setPatient(res.data.data);
      } catch (error) {
        console.error("Failed to fetch patient details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const initials = patient
    ? `${patient.firstName?.[0] ?? ''}${patient.lastName?.[0] ?? ''}`.toUpperCase()
    : 'P';

  return (
    <div className="min-h-screen bg-transparent pb-12">
      <Header />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-600" /> Back to Dashboard
        </button>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center animate-pulse border border-gray-100">
            <div className="w-24 h-24 rounded-2xl bg-gray-200 mx-auto mb-4" />
            <div className="h-6 w-48 bg-gray-200 mx-auto mb-2 rounded-lg" />
          </div>
        ) : (
          <>
            {/* Hero Card */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 shadow-xl text-white border border-slate-800 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative flex-shrink-0">
                {patient?.avatarUrl ? (
                  <img
                    src={patient.avatarUrl}
                    alt={patient?.firstName}
                    className="w-28 h-28 rounded-2xl object-cover ring-4 ring-indigo-400/30 shadow-2xl"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-indigo-600/30 backdrop-blur-md ring-4 ring-indigo-400/30 flex items-center justify-center shadow-2xl">
                    <span className="text-3xl font-extrabold text-white">{initials}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-3xl font-extrabold tracking-tight">
                    {patient?.firstName} {patient?.lastName}
                  </h1>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/20 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Patient Identity Verified
                  </span>
                </div>
                <p className="text-indigo-200 text-sm font-medium">{patient?.email}</p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs">
                  {patient?.phone && (
                    <div className="bg-white/15 px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-indigo-200" /> {patient.phone}
                    </div>
                  )}
                  {patient?.bloodGroup && (
                    <div className="bg-white/15 px-3 py-1 rounded-lg flex items-center gap-1.5 font-bold">
                      <Droplets className="w-3.5 h-3.5 text-red-300" /> Blood Group: {patient.bloodGroup}
                    </div>
                  )}
                  {patient?.aadharNo && (
                    <div className="bg-white/15 px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                      <FileText className="w-3.5 h-3.5 text-teal-200" /> Aadhar: XXXX-XXXX-{patient.aadharNo.slice(-4)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Personal Demographics</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <p><strong className="text-gray-500">Gender:</strong> <span className="capitalize font-semibold text-gray-800">{patient?.gender || '-'}</span></p>
                  <p><strong className="text-gray-500">Phone:</strong> <span className="font-semibold text-gray-800">{patient?.phone || '-'}</span></p>
                  <p><strong className="text-gray-500">Email:</strong> <span className="font-semibold text-gray-800">{patient?.email || '-'}</span></p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Medical Allergies & Notes</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <p><strong className="text-gray-500">Known Allergies:</strong> <span className="font-semibold text-purple-700">{patient?.allergies || 'None recorded'}</span></p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
