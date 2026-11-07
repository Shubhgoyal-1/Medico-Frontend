import { useState, useEffect } from 'react';
import { Sliders, Bell, CheckCircle2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/config/api';
import { useUserProfile } from '@/context/UserProfileContext';

export default function Settings() {
  const { doctor, status, setDoctor } = useUserProfile();
  const loading = status === 'loading';
  const [saving, setSaving] = useState(false);

  const [autoConfirmBooking, setAutoConfirmBooking] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [allowEmergencyBooking, setAllowEmergencyBooking] = useState(true);
  const [consultationSlotMinutes, setConsultationSlotMinutes] = useState('15');

  useEffect(() => {
    const prefs = doctor?.preferences;
    if (!prefs) return;
    setAutoConfirmBooking(prefs.autoConfirmBooking !== false);
    setEmailNotifications(prefs.emailNotifications !== false);
    setSmsAlerts(prefs.smsAlerts !== false);
    setAllowEmergencyBooking(prefs.allowEmergencyBooking !== false);
    setConsultationSlotMinutes(prefs.consultationSlotMinutes ? prefs.consultationSlotMinutes.toString() : '15');
  }, [doctor]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(
        `${API}/doctor/updateDoctorPreferences`,
        {
          autoConfirmBooking,
          emailNotifications,
          smsAlerts,
          allowEmergencyBooking,
          consultationSlotMinutes: parseInt(consultationSlotMinutes, 10),
        },
        { withCredentials: true }
      );
      if (doctor) {
        setDoctor({
          ...doctor,
          preferences: {
            autoConfirmBooking,
            emailNotifications,
            smsAlerts,
            allowEmergencyBooking,
            consultationSlotMinutes: parseInt(consultationSlotMinutes, 10),
          },
        });
      }
      toast.success('Doctor preferences & auto-confirm settings saved to database!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm animate-pulse space-y-4 max-w-4xl mx-auto">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="h-20 bg-gray-100 rounded-2xl" />
        <div className="h-20 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Workstation Preferences</h1>
            <p className="text-xs text-gray-500">Configure auto-confirm booking, slot durations & alerts</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-xs shadow-md shadow-blue-200 transition-all flex-shrink-0"
        >
          <CheckCircle2 className="w-4 h-4" /> {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>

      <div className="space-y-6 text-sm">
        {/* Section 1: Auto-Confirm & Booking Requirements */}
        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h2 className="font-extrabold text-slate-900 text-sm">Booking Requirements & Auto-Confirm</h2>
          </div>

          <div className="space-y-3 text-xs">
            {/* Auto Confirm Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
              <div className="space-y-0.5">
                <span className="block font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Auto-Confirm Booking Requests
                </span>
                <span className="text-[11px] text-gray-500">
                  Automatically confirm valid appointment requests without manual review
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoConfirmBooking}
                onChange={(e) => setAutoConfirmBooking(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer flex-shrink-0"
              />
            </div>

            {/* Emergency Booking */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100">
              <div className="space-y-0.5">
                <span className="block font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-teal-600" /> Allow Emergency Walk-In Requests
                </span>
                <span className="text-[11px] text-gray-500">
                  Allow urgent duty consultations outside regular scheduled OPD hours
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowEmergencyBooking}
                onChange={(e) => setAllowEmergencyBooking(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer flex-shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Consultation Slot Options */}
        <div className="bg-white p-6 rounded-3xl border border-teal-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Sliders className="w-4 h-4 text-teal-600" />
            <h2 className="font-extrabold text-slate-900 text-sm">Consultation Slot Duration</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Default Appointment Slot Duration
            </label>
            <select
              value={consultationSlotMinutes}
              onChange={(e) => setConsultationSlotMinutes(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
            >
              <option value="10">10 Minutes per patient</option>
              <option value="15">15 Minutes per patient (Default)</option>
              <option value="20">20 Minutes per patient</option>
              <option value="30">30 Minutes per patient</option>
              <option value="45">45 Minutes per patient</option>
              <option value="60">60 Minutes per patient</option>
            </select>
          </div>
        </div>

        {/* Section 3: Notification Preferences */}
        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Bell className="w-4 h-4 text-blue-600" />
            <h2 className="font-extrabold text-slate-900 text-sm">Notification Alerts</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="space-y-0.5">
                <span className="block font-bold text-slate-900">Email Alerts for New Consultations</span>
                <span className="text-gray-400">Receive instant email notifications when a patient books a slot</span>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer flex-shrink-0"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="space-y-0.5">
                <span className="block font-bold text-slate-900">SMS Reminders & Schedule Summaries</span>
                <span className="text-gray-400">Receive daily OPD queue summary at 8:00 AM</span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer flex-shrink-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}