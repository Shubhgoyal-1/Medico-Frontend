import { lazy, Suspense, useEffect, useState } from 'react';
import { RouteFallback } from '@/components/common/RouteFallback';
import { useUserProfile } from '@/context/UserProfileContext';
import {
  LayoutDashboard, Calendar, FileText, Pill, ClipboardList, Droplets,
  Phone, MapPin, User, ShieldAlert, HeartPulse, Plus,
  CheckCircle2, CalendarDays, ExternalLink, Activity, ArrowRight, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMedications } from '@/hooks/useMedications';

const Overview = lazy(() => import('./dashboard/Overview').then((m) => ({ default: m.Overview })));
const Records = lazy(() => import('./dashboard/Records').then((m) => ({ default: m.Records })));
const Medication = lazy(() => import('./dashboard/Medication').then((m) => ({ default: m.Medication })));
const Reports = lazy(() => import('./dashboard/Reports').then((m) => ({ default: m.Reports })));
const Appointments = lazy(() => import('./dashboard/Appointments').then((m) => ({ default: m.Appointments })));

const tabs = [
  { id: 'overview',      label: 'Overview',      icon: LayoutDashboard },
  { id: 'appointments',  label: 'Appointments',   icon: Calendar },
  { id: 'records',       label: 'Health Records', icon: FileText },
  { id: 'medications',   label: 'Medications',    icon: Pill },
  { id: 'reports',       label: 'Reports',        icon: ClipboardList },
] as const;

type TabId = typeof tabs[number]['id'];

const sampleMedications = [
  {
    _id: "sample-1",
    medicationId: { _id: "med-1", name: "Amoxicillin Trihydrate" },
    dosage: "500 mg",
    frequency: "2 times a day",
    time: "after_meals",
    active: true,
  },
  {
    _id: "sample-2",
    medicationId: { _id: "med-2", name: "Metformin HCl" },
    dosage: "850 mg",
    frequency: "Once daily",
    time: "with_breakfast",
    active: true,
  },
  {
    _id: "sample-3",
    medicationId: { _id: "med-3", name: "Atorvastatin Calcium" },
    dosage: "20 mg",
    frequency: "Once at night",
    time: "before_sleep",
    active: true,
  },
  {
    _id: "sample-4",
    medicationId: { _id: "med-4", name: "Pantoprazole Sodium" },
    dosage: "40 mg",
    frequency: "Once daily",
    time: "before_breakfast",
    active: true,
  },
];

export function PatientDashboard() {
  const { patient, status } = useUserProfile();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [waterGlasses, setWaterGlasses] = useState(0);
  const navigate = useNavigate();
  const { medications, loadingMedication } = useMedications(1, 20, "active");
  const activeMedications = (medications && medications.length > 0)
    ? medications.filter(m => m.active !== false)
    : [];

  useEffect(() => {
    if (status === 'unauthenticated' || status === 'error') {
      navigate('/signin', { replace: true });
    }
  }, [status, navigate]);

  // Per-patient daily hydration tracker with 12:00 AM reset
  useEffect(() => {
    if (!patient?._id) return;
    const todayStr = new Date().toLocaleDateString('en-CA');
    const storageKey = `medico_water_${patient._id}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const { count, date } = JSON.parse(saved);
        if (date === todayStr) {
          setWaterGlasses(count ?? 0);
        } else {
          // Reset at 12:00 AM (new date)
          setWaterGlasses(0);
          localStorage.setItem(storageKey, JSON.stringify({ count: 0, date: todayStr }));
        }
      } catch {
        setWaterGlasses(0);
      }
    } else {
      setWaterGlasses(0);
      localStorage.setItem(storageKey, JSON.stringify({ count: 0, date: todayStr }));
    }

    // Check periodically for midnight crossover
    const interval = setInterval(() => {
      const currentToday = new Date().toLocaleDateString('en-CA');
      const currentSaved = localStorage.getItem(storageKey);
      if (currentSaved) {
        try {
          const { date } = JSON.parse(currentSaved);
          if (date !== currentToday) {
            setWaterGlasses(0);
            localStorage.setItem(storageKey, JSON.stringify({ count: 0, date: currentToday }));
          }
        } catch (_) {}
      }
    }, 30000); // check every 30s

    return () => clearInterval(interval);
  }, [patient?._id]);

  const updateWaterGlasses = (newCount: number) => {
    const count = Math.max(0, newCount);
    setWaterGlasses(count);
    if (patient?._id) {
      const todayStr = new Date().toLocaleDateString('en-CA');
      localStorage.setItem(`medico_water_${patient._id}`, JSON.stringify({ count, date: todayStr }));
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':     return <Overview onViewAppointments={() => setActiveTab('appointments')} />;
      case 'records':      return <Records />;
      case 'medications':  return <Medication />;
      case 'reports':      return <Reports />;
      case 'appointments': return <Appointments />;
      default:             return null;
    }
  };

  const initials = patient
    ? `${patient.firstName?.[0] ?? ''}${patient.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <main className="min-h-screen bg-transparent">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Top Hero Banner — Full Width */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-500 to-teal-500 rounded-2xl p-6 mb-6 shadow-xl shadow-blue-500/20 ring-1 ring-white/30">
          {/* Background Decorative Patterns */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-12 -right-4 w-56 h-56 bg-white/5 rounded-full" />
          <div className="absolute top-4 right-32 w-20 h-20 bg-white/10 rounded-full" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5 min-w-0">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {patient?.avatarUrl ? (
                  <img
                    src={patient.avatarUrl}
                    alt="Patient"
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">{initials}</span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full ring-2 ring-white shadow-sm" />
              </div>

              {/* Patient Basic Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-white truncate">
                    Welcome back, {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient'}
                  </h2>
                  <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20">
                    ID Verified
                  </span>
                </div>
                <p className="text-blue-100 text-sm mt-0.5">{patient?.email}</p>

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {patient?.bloodGroup && (
                    <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1">
                      <Droplets className="w-3.5 h-3.5 text-red-300" />
                      <span className="text-xs font-semibold text-white">{patient.bloodGroup}</span>
                    </div>
                  )}
                  {patient?.phone && (
                    <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1">
                      <Phone className="w-3.5 h-3.5 text-blue-100" />
                      <span className="text-xs font-medium text-white">{patient.phone}</span>
                    </div>
                  )}
                  {patient?.gender && (
                    <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1">
                      <User className="w-3.5 h-3.5 text-blue-100" />
                      <span className="text-xs font-medium text-white capitalize">{patient.gender}</span>
                    </div>
                  )}
                  {patient?.fullAddress?.city && (
                    <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-200" />
                      <span className="text-xs font-medium text-white">{patient.fullAddress.city}, {patient.fullAddress.state}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hero Quick Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0 w-full md:w-auto">
              <button
                onClick={() => navigate('/patient/appointment')}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-900/10 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" /> Book Appointment
              </button>
              <button
                onClick={() => setActiveTab('medications')}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/30 transition-all text-sm"
              >
                <Pill className="w-4 h-4" /> Meds Tracker
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout for efficient space usage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Main Workspace (Left - 8/9 Columns) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">

            {/* Tab Navigation Bar */}
            <div className="flex gap-1 bg-white/90 backdrop-blur-sm rounded-xl p-1.5 shadow-md shadow-slate-200/70 border border-white overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap flex-1 justify-center ${
                    activeTab === id
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                      : 'text-gray-500 hover:bg-teal-50 hover:text-teal-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content Display */}
            <div className="animate-fade-in">
              <Suspense fallback={<RouteFallback />}>
                {renderTabContent()}
              </Suspense>
            </div>
          </div>

          {/* Right Useful Sidebar (3/4 Columns) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">

            {/* Card: Current Active Medications (Vertical Column) */}
            <div className="bg-white/95 rounded-2xl p-5 border border-white shadow-md shadow-slate-200/70 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                    <Pill className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Active Medications</h3>
                    <p className="text-[11px] text-gray-400">Current ongoing prescriptions</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('medications')}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-0.5 transition-colors"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Vertical Column List of Active Medications */}
              <div className="space-y-3">
                {loadingMedication && (
                  <div className="space-y-2.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
                    ))}
                  </div>
                )}

                {!loadingMedication && activeMedications.length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <Pill className="w-8 h-8 mx-auto mb-1 text-gray-200" />
                    <p className="text-xs font-medium">No active medications prescribed</p>
                  </div>
                )}

                {activeMedications.map((med) => (
                  <div
                    key={med._id}
                    className="p-3.5 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50/40 border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-100/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Pill className="w-4 h-4 text-teal-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {med.medicationId?.name || "Medication"}
                        </h4>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-100/90 px-2 py-0.5 rounded-full flex-shrink-0">
                          {med.dosage}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                        <span className="font-medium">{med.frequency}</span>
                        <span>•</span>
                        <span className="capitalize text-teal-700 font-semibold flex items-center gap-0.5">
                          <Clock className="w-3 h-3 text-teal-500 inline" /> {med.time?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Emergency & Health Helpline Quick Links */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg shadow-slate-300/70 space-y-3 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <Phone className="w-4 h-4" /> Emergency Assistance
              </div>
              <p className="text-xs text-gray-300">
                Need urgent medical support or hospital bed allocation?
              </p>
              <div className="pt-1 flex flex-col gap-2">
                <a
                  href="tel:108"
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-sm"
                >
                  Call Ambulance (108)
                </a>
                <button
                  onClick={() => navigate('/patient/appointment')}
                  className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-teal-300 font-semibold py-2 rounded-xl text-xs transition-colors border border-gray-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Find Hospitals Nearby
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}