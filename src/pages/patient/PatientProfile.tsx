import { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/Header';
import axios from 'axios';
import { API } from '@/config/api';
import {
  User, Phone, MapPin, Droplets,
  ShieldCheck, Lock, ArrowLeft, CheckCircle2,
  KeyRound, FileText, HeartPulse, Eye, EyeOff, Plus, AlertTriangle, X, Camera, Loader2, History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ImageCropperModal } from '@/components/ImageCropperModal';
import { useUserProfile } from '@/context/UserProfileContext';

export default function PatientProfile() {
  const { patient, status, setPatient } = useUserProfile();
  const loading = status !== 'ready' || !patient;
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');

  // Finished appointments history state
  const [finishedAppointments, setFinishedAppointments] = useState<any[]>([]);
  const [loadingFinished, setLoadingFinished] = useState(true);

  // Avatar upload & cropper state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  // New Allergy input state
  const [newAllergy, setNewAllergy] = useState('');
  const [addingAllergy, setAddingAllergy] = useState(false);

  // Password Change Form State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'unauthenticated' || status === 'error') {
      toast.error('Failed to load profile. Please sign in again.');
      navigate('/signin');
    }
  }, [status, navigate]);

  useEffect(() => {
    fetchFinishedAppointments();
  }, []);

  const fetchFinishedAppointments = async () => {
    try {
      setLoadingFinished(true);
      const res = await axios.get(`${API}/getFinishedAppointments`, { withCredentials: true });
      setFinishedAppointments(res.data?.data || []);
    } catch (error) {
      console.error("Failed to load finished appointments", error);
    } finally {
      setLoadingFinished(false);
    }
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawImageSrc(reader.result);
        setCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveCroppedAvatar = async (croppedFile: File) => {
    const formData = new FormData();
    formData.append('avatar', croppedFile);

    setUploadingAvatar(true);
    try {
      const res = await axios.put(`${API}/updatePatientAvatar`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.data) {
        setPatient(res.data.data);
      }
      toast.success('Profile picture cropped and updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload cropped avatar');
    } finally {
      setUploadingAvatar(false);
      setCropperOpen(false);
      setRawImageSrc(null);
    }
  };

  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newAllergy.trim();
    if (!trimmed) {
      toast.error('Please enter an allergy to add');
      return;
    }

    setAddingAllergy(true);
    try {
      const res = await axios.put(
        `${API}/editPatientProfile`,
        { allergies: trimmed },
        { withCredentials: true }
      );

      if (res.data?.data) {
        setPatient(res.data.data);
      }
      toast.success(`Allergy "${trimmed}" added successfully!`);
      setNewAllergy('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add allergy');
    } finally {
      setAddingAllergy(false);
    }
  };

  const handleRemoveAllergy = async (allergyToRemove: string) => {
    try {
      const res = await axios.put(
        `${API}/editPatientProfile`,
        { removeAllergy: allergyToRemove },
        { withCredentials: true }
      );

      if (res.data?.data) {
        setPatient(res.data.data);
      }
      toast.success(`Removed "${allergyToRemove}" from allergies`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove allergy');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      toast.error('Please enter both old and new passwords');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setChangingPassword(true);
    try {
      await axios.put(
        `${API}/editPatientPassword`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        { withCredentials: true }
      );
      toast.success('Password updated successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const initials = patient
    ? `${patient.firstName?.[0] ?? ''}${patient.lastName?.[0] ?? ''}`.toUpperCase()
    : 'P';

  const allergiesList = patient?.allergies
    ? patient.allergies
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-transparent pb-12">
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-all shadow-2xs w-fit"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" /> Back to Dashboard
          </button>

          <div className="flex items-center gap-2 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/80">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Profile Details
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Appointment History ({finishedAppointments.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center animate-pulse">
            <div className="w-24 h-24 rounded-2xl bg-gray-200 mx-auto mb-4" />
            <div className="h-6 w-48 bg-gray-200 mx-auto mb-2 rounded-lg" />
            <div className="h-4 w-32 bg-gray-100 mx-auto rounded-lg" />
          </div>
        ) : (
          <>
            {/* Patient Profile Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-teal-600 rounded-3xl p-8 shadow-xl text-white">
              {/* Background Decorative Elements */}
              <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-16 right-32 w-64 h-64 bg-teal-300/10 rounded-full blur-xl" />

              <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Profile Avatar with Camera Upload Overlay */}
                <div className="relative group flex-shrink-0">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileSelect}
                    accept="image/*"
                    className="hidden"
                  />

                  {patient?.avatarUrl ? (
                    <img
                      src={patient.avatarUrl}
                      alt="Patient Profile"
                      className="w-28 h-28 rounded-2xl object-cover ring-4 ring-white/40 shadow-2xl transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-md ring-4 ring-white/40 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105">
                      <span className="text-3xl font-extrabold text-white">{initials}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-bold shadow-md hover:bg-slate-900 disabled:opacity-60"
                    title="Change profile picture"
                  >
                    {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3 text-teal-300" />}
                    Photo
                  </button>

                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-400 rounded-full ring-2 ring-white flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Patient Header Details */}
                <div className="flex-1 text-center md:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <h1 className="text-3xl font-extrabold tracking-tight">
                      {patient?.firstName} {patient?.lastName}
                    </h1>
                    <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-300" /> Patient Verified ID
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm font-medium">{patient?.email}</p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs">
                    {patient?.phone && (
                      <div className="bg-white/15 px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-blue-200" /> {patient.phone}
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
            </div>

            {/* View Switcher: HISTORY ONLY TAB vs PROFILE DETAILS GRID */}
            {activeTab === 'history' ? (
              /* Finished Consultation History Full-Width Section */
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Finished Consultation History</h2>
                      <p className="text-xs text-gray-500">All completed doctor consultations & medical history</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-100">
                    {finishedAppointments.length} Completed
                  </span>
                </div>

                {loadingFinished ? (
                  <div className="p-12 text-center text-gray-400 text-xs animate-pulse">
                    Loading finished appointments...
                  </div>
                ) : finishedAppointments.length === 0 ? (
                  <div className="p-12 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto" />
                    <h3 className="text-sm font-bold text-gray-700">No completed consultations yet</h3>
                    <p className="text-xs text-gray-400">Finished appointments will appear here after your doctor completes the consultation.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {finishedAppointments.map((app: any) => {
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
                          className="p-5 rounded-2xl bg-slate-50/70 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex flex-col justify-between gap-4 shadow-2xs"
                        >
                          <div className="flex items-center gap-3.5">
                            {doctorObj?.avatarUrl ? (
                              <img
                                src={doctorObj.avatarUrl}
                                alt={doctorName}
                                className="w-13 h-13 rounded-xl object-cover ring-2 ring-blue-500/20 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-13 h-13 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                                DR
                              </div>
                            )}
                            <div className="space-y-0.5">
                              <h3 className="font-extrabold text-sm text-slate-900">{doctorName}</h3>
                              <p className="text-xs font-semibold text-blue-600">{spec}</p>
                              <p className="text-[11px] text-gray-500">Consultation Date: {dateFormatted}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200/60">
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                            </span>
                            <span className="text-xs font-bold text-slate-800">Fee: {fee}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Profile Details Content Grid */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
                {/* Left 2 Columns: Information & Editable Allergies Section */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Editable Section: Medical Allergies */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                          <HeartPulse className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">Medical Allergies</h2>
                          <p className="text-xs text-gray-500">Manage, add, or remove your medical allergies</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                        Editable Section
                      </span>
                    </div>

                    {/* Current Allergies Chips */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Recorded Allergies ({allergiesList.length})
                      </label>
                      {allergiesList.length === 0 ? (
                        <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400 text-xs">
                          No allergies currently recorded.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {allergiesList.map((allergy, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 bg-purple-50 text-purple-700 font-semibold text-xs pl-3.5 pr-2 py-1.5 rounded-xl border border-purple-100 group"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-purple-500" />
                              <span>{allergy}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAllergy(allergy)}
                                className="ml-1 p-0.5 rounded-md hover:bg-purple-200/70 text-purple-400 hover:text-purple-800 transition-colors"
                                title={`Remove ${allergy}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Form to Add New Allergy */}
                    <form onSubmit={handleAddAllergy} className="pt-2 border-t border-gray-100">
                      <label className="block font-semibold text-gray-700 text-sm mb-2">Add New Allergy</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="e.g. Penicillin, Dust, Peanuts, Sulfa Drugs"
                          value={newAllergy}
                          onChange={(e) => setNewAllergy(e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
                        />
                        <button
                          type="submit"
                          disabled={addingAllergy}
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex-shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                          {addingAllergy ? 'Adding...' : 'Add Allergy'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Read-Only Card 1: Personal Details */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                        <p className="text-xs text-gray-500">Verified patient identity & details</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">First Name</label>
                        <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 font-medium text-gray-800">
                          {patient?.firstName || '-'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Last Name</label>
                        <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 font-medium text-gray-800">
                          {patient?.lastName || '-'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
                        <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 font-medium text-gray-800">
                          {patient?.phone || '-'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
                        <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 font-medium text-gray-800 truncate">
                          {patient?.email || '-'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Gender</label>
                        <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 font-medium text-gray-800 capitalize">
                          {patient?.gender || '-'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Blood Group</label>
                        <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 font-bold text-red-600">
                          {patient?.bloodGroup || '-'}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Aadhar Card Number</label>
                        <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 font-medium text-gray-800">
                          {patient?.aadharNo ? `XXXX-XXXX-${patient.aadharNo.slice(-4)}` : '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Read-Only Card 2: Address Information */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Residential Address</h2>
                        <p className="text-xs text-gray-500">Registered home address</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">House / Flat No.</label>
                        <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 font-medium text-gray-800">
                          {patient?.fullAddress?.houseNumber || '-'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Street Address</label>
                        <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 font-medium text-gray-800">
                          {patient?.fullAddress?.address || '-'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Landmark</label>
                        <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 font-medium text-gray-800">
                          {patient?.fullAddress?.landmark || '-'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">City</label>
                        <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 font-medium text-gray-800">
                          {patient?.fullAddress?.city || '-'}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-400 mb-1">State</label>
                        <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 font-medium text-gray-800">
                          {patient?.fullAddress?.state || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Account Security & Identity Card */}
                <div className="space-y-8">
                  {/* Security Card: Change Password */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Account Security</h2>
                        <p className="text-xs text-gray-500">Update your account password</p>
                      </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4 text-sm">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Current Password</label>
                        <div className="relative">
                          <input
                            type={showOldPassword ? 'text' : 'password'}
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="At least 8 characters"
                            className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Re-enter new password"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="w-full mt-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4 text-amber-400" />
                        {changingPassword ? 'Updating Password...' : 'Update Password'}
                      </button>
                    </form>
                  </div>

                  {/* Identity Verification Summary Card */}
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-6 shadow-md space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <ShieldCheck className="w-5 h-5 text-emerald-200" /> Identity Protection
                    </div>
                    <p className="text-xs text-emerald-100 leading-relaxed">
                      Your profile data is encrypted end-to-end. Keep your medical allergies updated for fast and accurate medical assistance.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Image Cropper Modal Popup */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={rawImageSrc}
        onClose={() => {
          setCropperOpen(false);
          setRawImageSrc(null);
        }}
        onCropSave={handleSaveCroppedAvatar}
      />
    </div>
  );
}
