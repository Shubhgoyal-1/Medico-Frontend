import React, { useEffect, useMemo, useState } from "react";
import { MedicationCard } from "../patient/cards/MedicationCard";
import { HealthRecord } from "../HealthRecord";
import {
  ChevronLeft, Pill, FileText, Activity, User, ShieldCheck,
  CheckCircle2, Plus, AlertCircle, Droplets, X, XCircle, Loader2, Search
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { API } from "@/config/api";
import { AppointmentType, IMedicine, IMedication } from "@/types";
import { formatAppointmentDay, normalizeStatus } from "@/lib/appointmentStatus";

interface Props {
  appointment: AppointmentType;
  onFinish: () => void;
  onChanged: () => void;
}

export default function Appointment({ appointment, onFinish, onChanged }: Props) {
  const [activeTab, setActiveTab] = useState<"medications" | "reports" | "records">("medications");
  const [selectedMedication, setSelectedMedication] = useState<IMedication | null>(null);
  const [isEditingMedication, setIsEditingMedication] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);

  const [medications, setMedications] = useState<IMedicine[]>();
  const [medicineSearch, setMedicineSearch] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [reportNotes, setReportNotes] = useState<Record<string, string>>({});
  const [savingReportId, setSavingReportId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const res = await axios.get(`${API}/medication/getMedication`);
        setMedications(res.data.data || []);
      } catch (err: any) {
        console.error(err);
      }
    };
    fetchMedications();
  }, []);

  const filteredCatalog = useMemo(() => {
    const query = medicineSearch.trim().toLowerCase();
    const catalog = medications || [];
    if (!query) return catalog;
    return catalog.filter((med) => {
      const name = med.name?.toLowerCase() || "";
      const effects = med.sideEffects?.toLowerCase() || "";
      const avoid = med.notRecommendedFor?.toLowerCase() || "";
      return name.includes(query) || effects.includes(query) || avoid.includes(query);
    });
  }, [medications, medicineSearch]);

  const getPatientIdStr = (p: any) => (typeof p === 'object' && p ? p._id : (typeof p === 'string' ? p : ''));

  const today = new Date().toISOString().split("T")[0];
  const [recordFormData, setRecordFormData] = useState({
    patientId: getPatientIdStr(appointment.patientId),
    medicalHistory: {
      doctorId: appointment.doctorId,
      condition: "",
      diagnosisDate: today,
      treatment: "",
      notes: "",
      resolved: false,
    },
  });

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/doctor/addPatientMedicalHistory`, recordFormData, {
        withCredentials: true,
      });
      toast.success("Health record added");
      setIsEditingReport(false);
      setRecordFormData({
        patientId: getPatientIdStr(appointment.patientId),
        medicalHistory: {
          doctorId: appointment.doctorId,
          condition: "",
          diagnosisDate: today,
          treatment: "",
          notes: "",
          resolved: false,
        },
      });
      onChanged();
    } catch (err: any) {
      console.error("Error saving record:", err);
      toast.error(err?.response?.data?.message || "Failed to save record");
    }
  };

  const [medicineFormData, setMedicineFormData] = useState({
    patientId: getPatientIdStr(appointment.patientId),
    medicationId: "",
    name: "",
    dosage: "",
    frequency: "",
    time: "",
    startDate: "",
    endDate: "",
  });

  const handleMedicationSelect = (med: IMedication | null) => {
    setSelectedMedication(med);
    setMedicineSearch("");
    if (med) {
      setMedicineFormData({
        name: med.medicationId?.name || "",
        medicationId: med.medicationId?._id || "",
        dosage: med.dosage || "",
        frequency: med.frequency || "",
        time: med.time || "",
        startDate: med.startDate || "",
        endDate: med.endDate || "",
        patientId: getPatientIdStr(appointment.patientId),
      });
    } else {
      setMedicineFormData({
        name: "",
        dosage: "",
        medicationId: "",
        frequency: "",
        time: "",
        startDate: "",
        endDate: "",
        patientId: "",
      });
    }
  };

  const handleMedicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineFormData.medicationId) {
      toast.error("Search and select a medicine from the catalog");
      return;
    }
    try {
      if (selectedMedication) {
        await axios.put(
          `${API}/doctor/editPatientMedication`,
          {
            ...medicineFormData,
            prescribedTo: getPatientIdStr(appointment.patientId),
            prescribedBy: appointment.doctorId,
          },
          { withCredentials: true }
        );
        toast.success("Medication updated");
      } else {
        const patientIdVal = typeof appointment.patientId === 'object' ? appointment.patientId._id : appointment.patientId;
        await axios.post(
          `${API}/doctor/addPatientMedication`,
          {
            ...medicineFormData,
            prescribedTo: patientIdVal,
            prescribedBy: appointment.doctorId,
          },
          { withCredentials: true }
        );
        toast.success("Medication prescribed");
      }
      setIsEditingMedication(false);
      setSelectedMedication(null);
      setMedicineSearch("");
      onChanged();
    } catch (error: any) {
      console.error("Error saving medication:", error);
      toast.error(error?.response?.data?.message || "Failed to save medication");
    }
  };

  const changeStatus = async (status: "Cancelled" | "Confirmed") => {
    setUpdatingStatus(true);
    try {
      await axios.post(`${API}/appointment/updateAppointmentStatus`, {
        appointmentId: appointment._id,
        status,
      }, { withCredentials: true });
      toast.success(status === "Cancelled" ? "Appointment cancelled. The patient has been notified." : "Appointment confirmed.");
      setConfirmCancel(false);
      onChanged();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not update this appointment");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const patientObj = typeof appointment.patientId === 'object' ? appointment.patientId : null;
  const status = normalizeStatus(appointment.status, appointment.isFinished);
  const patientName = `${patientObj?.firstName || "Patient"} ${patientObj?.lastName || ""}`.trim();
  const initials = patientObj
    ? `${patientObj.firstName?.[0] ?? ''}${patientObj.lastName?.[0] ?? ''}`.toUpperCase()
    : 'P';

  return (
    <div className="p-6 bg-slate-50/60 rounded-3xl space-y-6">
      {/* Top Patient Summary Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        {/* Patient Details */}
        {(() => {
          const patientObj = typeof appointment.patientId === 'object' ? appointment.patientId : null;
          return (
            <div className="flex items-start gap-5 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                {patientObj?.avatarUrl ? (
                  <img
                    src={patientObj.avatarUrl}
                    alt="Patient Avatar"
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-100 shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-extrabold text-2xl ring-4 ring-indigo-100 shadow-md">
                    {initials}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full ring-2 ring-white" />
              </div>

              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900 truncate">
                    {patientObj?.firstName} {patientObj?.lastName}
                  </h2>
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Appointment #{appointment.number}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-lg text-slate-700 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-500" /> Gender: <span className="capitalize font-bold">{patientObj?.gender || 'N/A'}</span>
                  </div>
                  {patientObj?.bloodGroup && (
                    <div className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-lg font-bold border border-red-100">
                      <Droplets className="w-3.5 h-3.5 text-red-500" /> Blood Group: {patientObj.bloodGroup}
                    </div>
                  )}
                  {patientObj?.aadharNo && (
                    <div className="flex items-center gap-1 bg-teal-50 text-teal-700 px-3 py-1 rounded-lg font-medium border border-teal-100">
                      <FileText className="w-3.5 h-3.5 text-teal-500" /> Aadhar: XXXX-XXXX-{patientObj.aadharNo.slice(-4)}
                    </div>
                  )}
                </div>

                {patientObj?.allergies && (
                  <div className="mt-2 text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 flex items-center gap-1.5 w-fit">
                    <AlertCircle className="w-4 h-4 text-purple-500" />
                    Allergies: {patientObj.allergies}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2 flex-shrink-0">
          {status === "Pending" && (
            <button
              type="button"
              onClick={() => changeStatus("Confirmed")}
              disabled={updatingStatus}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-teal-200 transition-all disabled:opacity-60"
            >
              {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Confirm
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirmCancel(true)}
            disabled={updatingStatus}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm rounded-2xl transition-all disabled:opacity-60"
          >
            <XCircle className="w-4 h-4" /> Cancel
          </button>
          <button
            type="button"
            onClick={onFinish}
            disabled={updatingStatus}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-200 transition-all disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4" /> Finish Appointment
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-xs border border-gray-100 max-w-md">
        <button
          onClick={() => setActiveTab("medications")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === "medications"
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "text-gray-500 hover:bg-teal-50 hover:text-teal-700"
          }`}
        >
          <Pill className="w-4 h-4" /> Medications
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === "reports"
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "text-gray-500 hover:bg-teal-50 hover:text-teal-700"
          }`}
        >
          <FileText className="w-4 h-4" /> Medical Reports
        </button>
        <button
          onClick={() => setActiveTab("records")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === "records"
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "text-gray-500 hover:bg-teal-50 hover:text-teal-700"
          }`}
        >
          <Activity className="w-4 h-4" /> Health Records
        </button>
      </div>

      {/* Tab Content Display */}
      <div>
        {/* Tab 1: Medications */}
        {activeTab === "medications" && (
          <div
            className={`grid gap-6 transition-all duration-300 ${
              isEditingMedication ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {/* Left Column: Medications List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-600" /> Prescribed Medications
                </h3>
                {!isEditingMedication && (
                  <button
                    onClick={() => {
                      handleMedicationSelect(null);
                      setMedicineSearch("");
                      setIsEditingMedication(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" /> Prescribe Medication
                  </button>
                )}
              </div>

              {typeof appointment.patientId === 'object' && appointment.patientId?.medications && appointment.patientId.medications.length > 0 ? (
                appointment.patientId.medications.map((med: any) => (
                  <div
                    key={med._id}
                    className={`cursor-pointer transition-all ${
                      selectedMedication?._id === med._id
                        ? "rounded-2xl ring-2 ring-indigo-500 shadow-md"
                        : "hover:opacity-90"
                    }`}
                    onClick={() =>
                      handleMedicationSelect(selectedMedication?._id === med._id ? null : med)
                    }
                  >
                    <MedicationCard {...med} />
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-3xl text-center text-gray-400 border border-gray-100">
                  <Pill className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p className="text-xs font-semibold">No ongoing prescriptions for this patient.</p>
                </div>
              )}
            </div>

            {/* Right Column: Edit / Add Form */}
            {isEditingMedication && (
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedMedication ? "Edit Prescription" : "Prescribe New Medication"}
                  </h3>
                  <button
                    onClick={() => setIsEditingMedication(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                <form className="space-y-4 text-xs font-medium" onSubmit={handleMedicationSubmit}>
                  <div>
                    <label htmlFor="medicine-search" className="block text-gray-700 font-semibold mb-1">Select Medicine</label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="medicine-search"
                        type="text"
                        role="combobox"
                        aria-expanded={true}
                        aria-controls="medicine-search-results"
                        autoComplete="off"
                        placeholder="Search the pharmacy catalog..."
                        value={medicineSearch}
                        onChange={(e) => setMedicineSearch(e.target.value)}
                        className="w-full pl-8 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                      />
                      {medicineSearch && (
                        <button
                          type="button"
                          onClick={() => setMedicineSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label="Clear medicine search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {medicineFormData.medicationId && (
                      <p className="mt-1.5 text-[11px] text-teal-700 font-semibold">
                        Selected: {medicineFormData.name || "Medicine"}
                      </p>
                    )}
                    <div
                      id="medicine-search-results"
                      role="listbox"
                      className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-gray-100 bg-white divide-y divide-gray-50"
                    >
                      {filteredCatalog.length > 0 ? (
                        filteredCatalog.slice(0, 40).map((med) => {
                          const selected = medicineFormData.medicationId === med._id;
                          return (
                            <button
                              type="button"
                              key={med._id}
                              role="option"
                              aria-selected={selected}
                              onClick={() => {
                                setMedicineFormData({
                                  ...medicineFormData,
                                  medicationId: med._id,
                                  name: med.name,
                                  patientId: getPatientIdStr(appointment.patientId),
                                });
                                setMedicineSearch(med.name);
                              }}
                              className={`w-full text-left px-3 py-2 transition-colors ${
                                selected ? "bg-indigo-50 text-indigo-800" : "hover:bg-gray-50 text-gray-800"
                              }`}
                            >
                              <span className="block font-semibold truncate">{med.name}</span>
                              {med.sideEffects && (
                                <span className="block text-[10px] text-gray-400 line-clamp-1 mt-0.5">{med.sideEffects}</span>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <p className="px-3 py-4 text-center text-gray-400">
                          {medications?.length ? "No medicines match that search." : "Loading catalog..."}
                        </p>
                      )}
                    </div>
                    {!medicineFormData.medicationId && (
                      <p className="mt-1.5 text-[11px] text-gray-400">Pick a medicine from the list to continue.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Dosage (e.g. 500mg, 1 tablet)</label>
                    <input
                      type="text"
                      placeholder="e.g. 500 mg"
                      value={medicineFormData.dosage}
                      onChange={(e) => setMedicineFormData({ ...medicineFormData, dosage: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Frequency</label>
                    <input
                      type="text"
                      placeholder="e.g. Twice daily, Once every morning"
                      value={medicineFormData.frequency}
                      onChange={(e) => setMedicineFormData({ ...medicineFormData, frequency: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="medicine-time" className="block text-gray-700 font-semibold mb-1">Time of day</label>
                    <select
                      id="medicine-time"
                      value={medicineFormData.time}
                      onChange={(e) => setMedicineFormData({ ...medicineFormData, time: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                      required
                    >
                      <option value="">Select when to take it</option>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                      <option value="morning-afternoon">Morning and afternoon</option>
                      <option value="morning-evening">Morning and evening</option>
                      <option value="afternoon-evening">Afternoon and evening</option>
                      <option value="morning-afternoon-evening">Morning, afternoon and evening</option>
                      <option value="after_meals">After meals</option>
                      <option value="before_meals">Before meals</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Start Date</label>
                      <input
                        type="date"
                        value={medicineFormData.startDate}
                        onChange={(e) => setMedicineFormData({ ...medicineFormData, startDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">End Date</label>
                      <input
                        type="date"
                        value={medicineFormData.endDate}
                        onChange={(e) => setMedicineFormData({ ...medicineFormData, endDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingMedication(false)}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200 transition-all"
                    >
                      {selectedMedication ? "Update Prescription" : "Save Prescription"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Medical Reports */}
        {activeTab === "reports" && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileText className="w-4 h-4 text-purple-600" /> Uploaded Medical Lab Reports
            </h3>

            {typeof appointment.patientId === 'object' && appointment.patientId?.medicalReports && appointment.patientId.medicalReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointment.patientId.medicalReports.map((report: any) => {
                  const noteKey = report.reportUniqueId || report._id;
                  const draft = reportNotes[noteKey] ?? report.notes ?? "";
                  const saving = savingReportId === noteKey;
                  return (
                  <div
                    key={report._id}
                    className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3 hover:border-purple-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 truncate">{report.reportName}</h4>
                        {report.notes && <p className="text-[11px] text-gray-500 italic line-clamp-2">{report.notes}</p>}
                      </div>
                      <a
                        href={report.reportFileUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1 shadow-2xs flex-shrink-0"
                      >
                        View PDF
                      </a>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Doctor notes</label>
                      <textarea
                        rows={2}
                        value={draft}
                        onChange={(e) => setReportNotes((prev) => ({ ...prev, [noteKey]: e.target.value }))}
                        placeholder="Add clinical notes for this report..."
                        className="w-full p-2 rounded-xl border border-purple-100 bg-white text-xs focus:ring-2 focus:ring-purple-400 outline-none"
                      />
                      <button
                        type="button"
                        disabled={saving || !draft.trim() || draft.trim() === (report.notes || "")}
                        onClick={async () => {
                          if (!report.reportUniqueId) {
                            toast.error("This report cannot be annotated");
                            return;
                          }
                          setSavingReportId(noteKey);
                          try {
                            await axios.put(`${API}/doctor/editPatientReport`, {
                              reportUniqueId: report.reportUniqueId,
                              notes: draft.trim(),
                            }, { withCredentials: true });
                            toast.success("Report notes saved");
                            onChanged();
                          } catch (error: any) {
                            toast.error(error?.response?.data?.message || "Failed to save report notes");
                          } finally {
                            setSavingReportId(null);
                          }
                        }}
                        className="mt-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save notes"}
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                <p className="text-xs font-semibold">No medical lab reports found for this patient.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Health Records */}
        {activeTab === "records" && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" /> Past Clinical Diagnoses & Records
              </h3>
              {!isEditingReport && (
                <button
                  onClick={() => setIsEditingReport(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Diagnosis Record
                </button>
              )}
            </div>

            {/* List View */}
            {!isEditingReport && (
              <div className="space-y-3">
                {typeof appointment.patientId === 'object' && appointment.patientId?.medicalHistory && appointment.patientId.medicalHistory.length > 0 ? (
                  appointment.patientId.medicalHistory.map((record: any) => (
                    <HealthRecord key={record._id || record.doctorId?._id || Math.random()} {...record} />
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <Activity className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                    <p className="text-xs font-semibold">No medical history records logged yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Form View */}
            {isEditingReport && (
              <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50/60 relative space-y-4">
                <button
                  type="button"
                  onClick={() => setIsEditingReport(false)}
                  className="p-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 transition shadow-2xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <h4 className="text-sm font-bold text-slate-900 text-center">Add New Medical History Record</h4>

                <form className="space-y-4 text-xs font-medium" onSubmit={handleRecordSubmit}>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Diagnosed Condition</label>
                    <input
                      type="text"
                      value={recordFormData.medicalHistory.condition}
                      onChange={(e) =>
                        setRecordFormData({
                          ...recordFormData,
                          medicalHistory: { ...recordFormData.medicalHistory, condition: e.target.value },
                        })
                      }
                      placeholder="e.g. Hypertension, Acute Bronchitis"
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Diagnosis Date</label>
                    <input
                      type="date"
                      value={recordFormData.medicalHistory.diagnosisDate}
                      onChange={(e) =>
                        setRecordFormData({
                          ...recordFormData,
                          medicalHistory: { ...recordFormData.medicalHistory, diagnosisDate: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Treatment Prescribed</label>
                    <input
                      type="text"
                      value={recordFormData.medicalHistory.treatment}
                      onChange={(e) =>
                        setRecordFormData({
                          ...recordFormData,
                          medicalHistory: { ...recordFormData.medicalHistory, treatment: e.target.value },
                        })
                      }
                      placeholder="e.g. Oral antibiotics for 7 days"
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Clinical Notes</label>
                    <textarea
                      rows={3}
                      value={recordFormData.medicalHistory.notes}
                      onChange={(e) =>
                        setRecordFormData({
                          ...recordFormData,
                          medicalHistory: { ...recordFormData.medicalHistory, notes: e.target.value },
                        })
                      }
                      placeholder="Enter physician observations and follow-up advice..."
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Status (Resolved)</label>
                    <select
                      value={recordFormData.medicalHistory.resolved ? "Yes" : "No"}
                      onChange={(e) =>
                        setRecordFormData({
                          ...recordFormData,
                          medicalHistory: { ...recordFormData.medicalHistory, resolved: e.target.value === "Yes" },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
                    >
                      <option value="No">Ongoing / In Treatment</option>
                      <option value="Yes">Resolved</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingReport(false)}
                      className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200 transition"
                    >
                      Save Medical Record
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {confirmCancel && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => { if (!updatingStatus) setConfirmCancel(false); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Cancel appointment?</h3>
              <button
                type="button"
                onClick={() => setConfirmCancel(false)}
                disabled={updatingStatus}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm text-gray-600">
              <p>
                {patientName} on{" "}
                <span className="font-semibold text-gray-900">{formatAppointmentDay(appointment.date)}</span>
                {" "}· Token #{appointment.number}
              </p>
              <p className="text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs font-medium">
                The patient is notified and this visit leaves your queue.
              </p>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setConfirmCancel(false)}
                disabled={updatingStatus}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={() => changeStatus("Cancelled")}
                disabled={updatingStatus}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                Cancel appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
