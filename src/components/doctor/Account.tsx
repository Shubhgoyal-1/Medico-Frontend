import { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '@/config/api';
import { Doctor } from '@/components/patient/dashboard/types';
import {
  Mail, Phone, Building, Award, ShieldCheck, Stethoscope, MapPin, Calendar, Clock, IndianRupee, Users, Sparkles, Edit3, X, Save, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useUserProfile } from '@/context/UserProfileContext';

export default function Account() {
  const { doctor, status, setDoctor } = useUserProfile();
  const loading = status === 'loading' || (status === 'ready' && !doctor);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: '',
    experience: 0,
    feePerVisit: 0,
    patientLimit: 0,
    workplaceName: '',
    workplaceType: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    if (doctor) initForm(doctor);
  }, [doctor]);

  const initForm = (doc: Doctor) => {
    setEditForm({
      phone: doc.phone || '',
      experience: doc.experience || 0,
      feePerVisit: doc.feePerVisit || 500,
      patientLimit: doc.patientLimit || 30,
      workplaceName: doc.workplace?.name || '',
      workplaceType: doc.workplace?.type || '',
      city: doc.workplace?.city || '',
      state: doc.workplace?.state || ''
    });
  };

  const handleOpenEdit = () => {
    if (doctor) initForm(doctor);
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        phone: editForm.phone,
        experience: Number(editForm.experience),
        feePerVisit: Number(editForm.feePerVisit),
        patientLimit: Number(editForm.patientLimit),
        workplace: {
          name: editForm.workplaceName,
          type: editForm.workplaceType,
          city: editForm.city,
          state: editForm.state
        }
      };

      const res = await axios.put(`${API}/doctor/editDoctorProfile`, payload, {
        withCredentials: true
      });

      const updatedDoctor = res.data?.data || { ...doctor, ...payload };
      setDoctor(updatedDoctor);
      toast.success("Doctor profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const initials = doctor
    ? `${doctor.firstName?.[0] ?? ''}${doctor.lastName?.[0] ?? ''}`.toUpperCase()
    : 'DR';

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm animate-pulse space-y-6 max-w-5xl mx-auto">
        <div className="w-24 h-24 bg-gray-200 rounded-2xl mx-auto" />
        <div className="h-6 w-48 bg-gray-200 rounded mx-auto" />
        <div className="h-4 w-32 bg-gray-100 rounded mx-auto" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Hero Banner (White, Blue, Teal Theme) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 rounded-3xl p-8 shadow-xl shadow-blue-500/10 text-white flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Background Glows */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-32 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex-shrink-0 z-10">
          {doctor?.avatarUrl ? (
            <img
              src={doctor.avatarUrl}
              alt="Doctor Avatar"
              className="w-28 h-28 rounded-2xl object-cover ring-4 ring-white/30 shadow-2xl"
            />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-md ring-4 ring-white/30 flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-extrabold text-white">{initials}</span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-400 rounded-full ring-2 ring-white flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2 z-10 w-full">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Dr. {doctor?.firstName} {doctor?.lastName}
              </h1>
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-200" /> Medical License Verified
              </span>
            </div>

            {/* Edit Profile Action Button */}
            <button
              onClick={handleOpenEdit}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 rounded-xl text-xs font-extrabold backdrop-blur-md transition-all shadow-sm flex items-center gap-2 hover:scale-105 duration-200"
            >
              <Edit3 className="w-4 h-4 text-teal-200" /> Edit Profile
            </button>
          </div>
          
          <p className="text-blue-100 text-sm font-semibold flex items-center justify-center md:justify-start gap-2">
            <Stethoscope className="w-4 h-4 text-teal-200" />
            {doctor?.specialization || "General Physician & Consultant"}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2 text-xs">
            {doctor?.email && (
              <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium border border-white/10">
                <Mail className="w-3.5 h-3.5 text-teal-200" /> {doctor.email}
              </div>
            )}
            {doctor?.phone && (
              <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium border border-white/10">
                <Phone className="w-3.5 h-3.5 text-teal-200" /> {doctor.phone}
              </div>
            )}
            {doctor?.licenseNumber && (
              <div className="bg-teal-400/25 text-teal-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold border border-teal-200/30">
                <Award className="w-3.5 h-3.5 text-teal-200" /> License: {doctor.licenseNumber}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Professional Qualifications */}
        <div className="bg-white rounded-3xl p-6 border border-blue-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Professional Qualifications</h3>
              <p className="text-xs text-gray-400">Medical practice credentials & experience</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50/70 p-3 rounded-2xl border border-gray-100">
              <span className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                Specialization
              </span>
              <span className="font-extrabold text-slate-900 text-xs">
                {doctor?.specialization || "General Practitioner"}
              </span>
            </div>

            <div className="bg-slate-50/70 p-3 rounded-2xl border border-gray-100">
              <span className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                Clinical Experience
              </span>
              <span className="font-extrabold text-blue-600 text-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> {doctor?.experience || 5}+ Years
              </span>
            </div>

            <div className="bg-slate-50/70 p-3 rounded-2xl border border-gray-100">
              <span className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                Consultation Fee
              </span>
              <span className="font-extrabold text-emerald-600 text-xs flex items-center gap-0.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> {doctor?.feePerVisit || 500} / Visit
              </span>
            </div>

            <div className="bg-slate-50/70 p-3 rounded-2xl border border-gray-100">
              <span className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                Daily Patient Limit
              </span>
              <span className="font-extrabold text-teal-600 text-xs flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-teal-600" /> {doctor?.patientLimit || 30} Patients
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Workplace & Practice Details */}
        <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Workplace & Practice Details</h3>
              <p className="text-xs text-gray-400">Hospital & clinic affiliation</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-teal-50/40 rounded-2xl border border-teal-100/60">
              <div>
                <span className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-0.5">
                  Workplace Type
                </span>
                <span className="font-extrabold text-teal-700 capitalize text-xs">
                  {doctor?.workplace?.type || "Hospital Affiliation"}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-extrabold text-[10px]">
                Active Practice
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-2xl border border-gray-100 space-y-1">
              <span className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-0.5">
                Facility Name
              </span>
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                {doctor?.workplace?.name || "Medico Specialty Healthcare Center"}
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-2xl border border-gray-100 space-y-1">
              <span className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-0.5">
                City & State Address
              </span>
              <span className="font-semibold text-gray-700 text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                {doctor?.workplace?.city || "New Delhi"}, {doctor?.workplace?.state || "Delhi NCR"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Clinical OPD Hours & Timings */}
        <div className="bg-white rounded-3xl p-6 border border-blue-100 shadow-xs space-y-4 hover:shadow-md transition-shadow md:col-span-2">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Clinical Hours & Consultation Schedule</h3>
              <p className="text-xs text-gray-400">Regular outpatient department (OPD) availability</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
              <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" /> Monday - Friday
              </span>
              <span className="font-bold text-blue-700">09:00 AM - 05:00 PM</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-teal-50/50 rounded-2xl border border-teal-100">
              <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" /> Saturday
              </span>
              <span className="font-bold text-teal-700">09:00 AM - 01:00 PM</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-rose-50/50 rounded-2xl border border-rose-100">
              <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-500" /> Sunday
              </span>
              <span className="font-bold text-rose-600">On-Call Duty Only</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Doctor Profile Modal Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-teal-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white ring-1 ring-white/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Edit Doctor Profile</h3>
                  <p className="text-xs text-blue-100">Update your clinical qualifications, fees & workplace</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-xl hover:bg-white/15 text-blue-100 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Consultation Fee (₹ / Visit)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.feePerVisit}
                    onChange={(e) => setEditForm({ ...editForm, feePerVisit: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Daily Patient Quota (Max Patients)</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.patientLimit}
                    onChange={(e) => setEditForm({ ...editForm, patientLimit: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent font-medium"
                    required
                  />
                </div>
              </div>

              {/* Workplace Details Section */}
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Workplace Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Facility Name</label>
                    <input
                      type="text"
                      value={editForm.workplaceName}
                      onChange={(e) => setEditForm({ ...editForm, workplaceName: e.target.value })}
                      placeholder="e.g. City General Hospital"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-400 focus:border-transparent font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Workplace Type</label>
                    <input
                      type="text"
                      value={editForm.workplaceType}
                      onChange={(e) => setEditForm({ ...editForm, workplaceType: e.target.value })}
                      placeholder="e.g. Hospital, Private Clinic"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-400 focus:border-transparent font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-400 focus:border-transparent font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-400 focus:border-transparent font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}