import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAppointments } from "../../../hooks/useAppointments";
import { AppointmentCard } from "../cards/AppointmentCard";
import { Appointment } from "./types";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus, ChevronDown, ChevronUp, XCircle, RefreshCw, ChevronLeft, ChevronRight, History, Loader2, X } from "lucide-react";
import { AppointmentHistoryModal } from "../AppointmentHistoryModal";
import { API } from "@/config/api";
import { apiErrorMessage } from "@/lib/auth";
import {
    STATUS_STYLES,
    appointmentDayKey,
    formatAppointmentDay,
    isChangeable,
    localDayKey,
    normalizeStatus,
} from "@/lib/appointmentStatus";

type PendingAction = { kind: "cancel" | "reschedule"; appointment: Appointment };

export function Appointments() {
    const {
        appointments,
        loadingAppointment,
        errorAppointment,
        page,
        total,
        totalPages,
        nextPage,
        prevPage,
        setPage,
        refetch,
    } = useAppointments(1, 10);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const handleStatusChanged = (e: any) => {
            if (e.detail) {
                refetch();
            }
        };
        window.addEventListener('appointment-status-changed', handleStatusChanged);
        return () => window.removeEventListener('appointment-status-changed', handleStatusChanged);
    }, [refetch]);

    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [newDate, setNewDate] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const todayKey = localDayKey();

    const handleCardClick = (id: string) => setSelectedId((prev) => (prev === id ? null : id));
    const handleReschedule = (appointment: Appointment) => {
        setNewDate("");
        setPendingAction({ kind: "reschedule", appointment });
    };
    const handleCancel = (appointment: Appointment) => setPendingAction({ kind: "cancel", appointment });
    const closeAction = () => {
        if (!submitting) setPendingAction(null);
    };

    const submitAction = async () => {
        if (!pendingAction) return;
        const { kind, appointment } = pendingAction;
        if (kind === "reschedule" && !newDate) {
            toast.error("Pick a new date");
            return;
        }
        setSubmitting(true);
        try {
            if (kind === "cancel") {
                await axios.post(`${API}/appointment/cancelAppointment`, { appointmentId: appointment._id }, { withCredentials: true });
                toast.success("Appointment cancelled");
            } else {
                const res = await axios.post(
                    `${API}/appointment/rescheduleAppointment`,
                    { appointmentId: appointment._id, date: newDate },
                    { withCredentials: true }
                );
                const updated = res.data?.data;
                toast.success("Appointment rescheduled", {
                    description: updated
                        ? `${formatAppointmentDay(updated.date)} · Token #${updated.number} · ${normalizeStatus(updated.status)}`
                        : undefined,
                });
            }
            setPendingAction(null);
            refetch();
        } catch (error) {
            toast.error(apiErrorMessage(error, kind === "cancel" ? "Could not cancel the appointment" : "Could not reschedule the appointment"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">My Appointments</h2>
                        <p className="text-xs text-gray-500">
                            {total >= 0 ? `${total} appointment${total !== 1 ? 's' : ''}` : 'Loading...'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setShowHistoryModal(true)}
                        className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 px-3.5 py-2.5 rounded-xl text-xs font-extrabold hover:bg-teal-100 transition-all shadow-2xs"
                    >
                        <History className="w-4 h-4 text-teal-600" /> View Appointment History
                    </button>

                    <button
                        onClick={() => navigate("/patient/appointment")}
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-all shadow-md shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-0.5 duration-200"
                    >
                        <Plus className="w-4 h-4" /> New Appointment
                    </button>
                </div>
            </div>

            {/* Appointment History Modal */}
            <AppointmentHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
            />

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loadingAppointment && (
                    <div className="p-6 space-y-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                    </div>
                )}

                {errorAppointment && (
                    <div className="p-8 text-center">
                        <XCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
                        <p className="text-red-500 text-sm">{errorAppointment}</p>
                    </div>
                )}

                {!loadingAppointment && appointments && appointments.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-blue-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">No Appointments Found</h3>
                        <p className="text-sm text-gray-400 mb-5">Book your first appointment with a doctor.</p>
                        <button
                            onClick={() => navigate("/patient/appointment")}
                            className="inline-flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-all shadow-md"
                        >
                            <Plus className="w-4 h-4" /> Book Appointment
                        </button>
                    </div>
                )}

                {!loadingAppointment && appointments && appointments.length > 0 && (
                    <div className="divide-y divide-gray-50">
                        {appointments.map((data: Appointment) => {
                            const formattedDate = formatAppointmentDay(data.date);
                            const isSelected = selectedId === data._id;
                            const status = normalizeStatus(data.status, data.isFinished);
                            const styles = STATUS_STYLES[status];
                            const changeable = isChangeable(status);

                            return (
                                <div key={data._id} className="group w-full">
                                    <div
                                        className={`px-5 py-3 cursor-pointer transition-colors w-full ${isSelected ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                                        onClick={() => handleCardClick(data._id)}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <AppointmentCard
                                                number={data.number}
                                                date={formattedDate}
                                                doctor={data.doctorId?.firstName || 'Doctor'}
                                                type={data.doctorId?.specialization || 'General'}
                                                time={data.time}
                                            />
                                            <div className="ml-2 flex-shrink-0">
                                                {isSelected
                                                    ? <ChevronUp className="w-4 h-4 text-blue-500" />
                                                    : <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="px-5 pb-4 bg-blue-50/40">
                                            <div className="flex items-center gap-3 pt-2">
                                                <button
                                                    className="flex items-center gap-2 bg-white border border-blue-200 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                                                    disabled={!changeable}
                                                    onClick={(e) => { e.stopPropagation(); handleReschedule(data); }}
                                                >
                                                    <RefreshCw className="w-4 h-4" /> Reschedule
                                                </button>
                                                <button
                                                    className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                                                    disabled={!changeable}
                                                    onClick={(e) => { e.stopPropagation(); handleCancel(data); }}
                                                >
                                                    <XCircle className="w-4 h-4" /> Cancel
                                                </button>
                                                <span className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${styles.badge}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                                                    {status}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <span className="text-xs text-gray-500 font-medium">
                            Showing Page <span className="font-bold text-gray-800">{page}</span> of <span className="font-bold text-gray-800">{totalPages}</span> ({total} Total Items)
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={prevPage}
                                disabled={page <= 1}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </button>
                            <button
                                onClick={nextPage}
                                disabled={page >= totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {pendingAction && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={closeAction}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900">
                                {pendingAction.kind === "cancel" ? "Cancel appointment?" : "Reschedule appointment"}
                            </h3>
                            <button onClick={closeAction} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100" aria-label="Close">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="px-5 py-4 space-y-4 text-sm text-gray-600">
                            <p>
                                Dr. {pendingAction.appointment.doctorId?.firstName || "Doctor"} on{" "}
                                <span className="font-semibold text-gray-900">{formatAppointmentDay(pendingAction.appointment.date)}</span>
                                {" "}· Token #{pendingAction.appointment.number}
                            </p>

                            {pendingAction.kind === "cancel" ? (
                                <p className="text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs font-medium">
                                    Your slot is released to other patients and the doctor is notified.
                                </p>
                            ) : (
                                <div>
                                    <label htmlFor="reschedule-date" className="block text-xs font-semibold text-gray-700 mb-1.5">New date</label>
                                    <input
                                        id="reschedule-date"
                                        type="date"
                                        min={todayKey}
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    />
                                    {newDate && newDate === appointmentDayKey(pendingAction.appointment.date) && (
                                        <p className="text-xs text-amber-600 mt-1">That is the current date. Pick a different day.</p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">You get a new token number for the chosen day.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-t border-gray-100">
                            <button
                                onClick={closeAction}
                                disabled={submitting}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                            >
                                Keep it
                            </button>
                            <button
                                onClick={submitAction}
                                disabled={
                                    submitting ||
                                    (pendingAction.kind === "reschedule" &&
                                        (!newDate || newDate === appointmentDayKey(pendingAction.appointment.date)))
                                }
                                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 ${
                                    pendingAction.kind === "cancel" ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                                }`}
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {pendingAction.kind === "cancel" ? "Cancel appointment" : "Reschedule"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
