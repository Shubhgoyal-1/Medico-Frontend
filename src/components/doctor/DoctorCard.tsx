import React, { useState } from "react";
import { X, Calendar, Clock, MapPin, Award, IndianRupee, Stethoscope, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useForm } from "react-hook-form";

import { API } from "@/config/api";
import { invalidateAppointments } from "@/hooks/useAppointments";

export function DoctorCard({
    name,
    avatarUrl,
    specialization,
    experience,
    doctorId,
    fees,
    hospital,
}: any) {
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const selectedDate = watch("date");

    const todayStr = new Date().toISOString().split('T')[0];

    // Quick date helpers
    const setQuickDate = (daysFromToday: number) => {
        const d = new Date();
        d.setDate(d.getDate() + daysFromToday);
        setValue("date", d.toISOString().split('T')[0], { shouldValidate: true });
    };

    const bookAppointment = async (data: any) => {
        setIsSubmitting(true);
        try {
            await axios.post(`${API}/appointment/addAppointment`, {
                doctorId,
                date: data.date,
            }, { withCredentials: true });
            invalidateAppointments();

            const formattedDate = new Date(data.date).toLocaleDateString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
            });

            toast.success(
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-gray-900">Appointment Requested!</span>
                    <span className="text-xs text-gray-600">With Dr. {name} on {formattedDate}</span>
                </div>
            );
            setShowModal(false);
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to book appointment");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Doctor Card */}
            <div className="w-72 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 p-5 flex flex-col justify-between group flex-shrink-0">
                <div>
                    {/* Header: Avatar + Specs */}
                    <div className="flex items-start gap-3.5 mb-3.5">
                        <div className="relative flex-shrink-0">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={name}
                                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-100 shadow-sm"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-sm">
                                    <Stethoscope className="w-7 h-7 text-white" />
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-500 rounded-full ring-2 ring-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-blue-600 transition-colors truncate">
                                Dr. {name}
                            </h3>
                            <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                                {specialization}
                            </span>
                        </div>
                    </div>

                    {/* Stats & Info */}
                    <div className="space-y-2 py-2 border-y border-gray-50 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-gray-500">
                                <Award className="w-3.5 h-3.5 text-amber-500" /> Experience
                            </span>
                            <span className="font-semibold text-gray-800">{experience} Years</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-gray-500">
                                <IndianRupee className="w-3.5 h-3.5 text-teal-600" /> Consultation Fee
                            </span>
                            <span className="font-bold text-teal-700">₹{fees}</span>
                        </div>
                        {hospital && (
                            <div className="flex items-start gap-1.5 text-gray-500 pt-1">
                                <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-1 text-gray-700 font-medium">
                                    {hospital.name || hospital.address || 'Clinic'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Book Action */}
                <button
                    onClick={() => setShowModal(true)}
                    className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm py-2.5 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 group-hover:shadow-md"
                >
                    <Calendar className="w-4 h-4" /> Book Appointment
                </button>
            </div>

            {/* Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-gray-100">
                        
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-5 text-white relative">
                            <button
                                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                onClick={() => setShowModal(false)}
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">
                                <Sparkles className="w-3.5 h-3.5 text-teal-200" /> Appointment Booking
                            </div>
                            <h2 className="text-xl font-bold">Book Consultation</h2>
                        </div>

                        {/* Doctor Overview Box */}
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-4 bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={name}
                                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-sm flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-sm flex-shrink-0">
                                        <Stethoscope className="w-7 h-7" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-gray-900 text-base truncate">Dr. {name}</h3>
                                    <p className="text-xs font-semibold text-blue-600">{specialization}</p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Award className="w-3 h-3 text-amber-500" /> {experience} Years Exp.
                                        <span className="text-gray-300">•</span>
                                        <span className="font-bold text-teal-700">₹{fees} Fee</span>
                                    </p>
                                </div>
                            </div>

                            {/* Location Details */}
                            {hospital && (
                                <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600">
                                    <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold text-gray-800">{hospital.name || 'Hospital / Clinic'}</span>
                                        <p className="text-gray-500">{hospital.address || `${hospital.city || ''}, ${hospital.state || ''}`}</p>
                                    </div>
                                </div>
                            )}

                            {/* Booking Form */}
                            <form onSubmit={handleSubmit(bookAppointment)} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                                        <span>Select Date <span className="text-red-500">*</span></span>
                                        <span className="text-gray-400 font-normal">Available Mon-Sat</span>
                                    </label>

                                    {/* Date Picker */}
                                    <input
                                        type="date"
                                        min={todayStr}
                                        {...register("date", { required: "Please select an appointment date" })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                    />
                                    {errors.date && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">
                                            {errors.date.message as string}
                                        </p>
                                    )}

                                    {/* Quick Date Pills */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setQuickDate(0)}
                                            className={`text-xs px-3 py-1 rounded-lg border font-medium transition-colors ${
                                                selectedDate === todayStr
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50'
                                            }`}
                                        >
                                            Today
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setQuickDate(1)}
                                            className="text-xs px-3 py-1 rounded-lg border bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 font-medium transition-colors"
                                        >
                                            Tomorrow
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setQuickDate(2)}
                                            className="text-xs px-3 py-1 rounded-lg border bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 font-medium transition-colors"
                                        >
                                            In 2 Days
                                        </button>
                                    </div>
                                </div>

                                {/* Slot Info Note */}
                                <div className="flex items-center gap-2 text-xs text-teal-700 bg-teal-50/70 p-3 rounded-xl border border-teal-100">
                                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                    <span>Token number and exact time slot will be auto-generated upon booking.</span>
                                </div>

                                {/* Fee Summary */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-sm">
                                    <span className="font-medium text-gray-600">Total Payable at Clinic:</span>
                                    <span className="text-lg font-bold text-gray-900">₹{fees}</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold text-sm py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" /> Confirming...
                                            </>
                                        ) : (
                                            "Confirm Booking"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
