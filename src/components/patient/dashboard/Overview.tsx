import React, { useEffect, useState } from 'react';
import { AppointmentCard } from '../cards/AppointmentCard';
import {
    Activity, Heart, Thermometer, Weight, ArrowRight, Calendar, Pill,
    TrendingUp, Sparkles, ChevronLeft, ChevronRight, Lightbulb, ShieldCheck
} from 'lucide-react';
import { useMedications } from '../../../hooks/useMedications';
import { useAppointments } from '../../../hooks/useAppointments';
import { Appointment } from './types';

interface OverviewProps {
    onViewAppointments?: () => void;
}

const medicalTips = [
    {
        id: 1,
        category: "Hydration & Health",
        tip: "Drink at least 8–10 glasses of water daily to support kidney function, boost skin vitality, and maintain healthy metabolism.",
        tag: "Daily Essential",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
        accentColor: "text-blue-600",
        bgGradient: "from-blue-50 via-teal-50/50 to-cyan-50/80"
    },
    {
        id: 2,
        category: "Prescription Safety",
        tip: "Always complete your full prescribed dosage course of antibiotics even if symptoms subside early to prevent drug resistance.",
        tag: "Medical Safety",
        badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
        accentColor: "text-teal-600",
        bgGradient: "from-teal-50 via-cyan-50/60 to-emerald-50/60"
    },
    {
        id: 3,
        category: "Cardiovascular Wellness",
        tip: "Engaging in 30 minutes of moderate aerobic activity 5 days a week helps regulate blood pressure and improves cholesterol levels.",
        tag: "Heart Care",
        badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
        accentColor: "text-indigo-600",
        bgGradient: "from-indigo-50 via-blue-50/60 to-teal-50/50"
    },
    {
        id: 4,
        category: "Rest & Cellular Repair",
        tip: "Getting 7 to 8 hours of quality sleep allows cellular repair, reduces stress hormone levels, and strengthens immunity.",
        tag: "Wellness Habit",
        badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
        accentColor: "text-purple-600",
        bgGradient: "from-purple-50 via-indigo-50/60 to-blue-50/60"
    }
];

export function Overview({ onViewAppointments }: OverviewProps) {
    const { medications } = useMedications(1, 10, "active");
    const { appointments, loadingAppointment, errorAppointment } = useAppointments();

    const [tipIndex, setTipIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % medicalTips.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [isPaused]);

    const activeTip = medicalTips[tipIndex];

    return (
        <div className="space-y-6">
            {/* Medical Advice Carousel Strip (Placed above Quick Stats) */}
            <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className={`relative overflow-hidden rounded-2xl border border-gray-100 p-4 sm:p-5 bg-gradient-to-r ${activeTip.bgGradient} shadow-sm transition-all duration-500`}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl bg-white/90 shadow-sm flex items-center justify-center flex-shrink-0 ${activeTip.accentColor}`}>
                            <Sparkles className="w-5 h-5" />
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${activeTip.badgeColor}`}>
                                    {activeTip.tag}
                                </span>
                                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> {activeTip.category}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed">
                                "{activeTip.tip}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 text-white shadow-md shadow-blue-200/80 ring-1 ring-white/20">
                    <div className="flex items-center justify-between mb-2">
                        <Calendar className="w-5 h-5 text-blue-200" />
                        <span className="text-xs text-blue-200 font-medium">Total</span>
                    </div>
                    <p className="text-3xl font-bold">{appointments?.length ?? '—'}</p>
                    <p className="text-xs text-blue-100 mt-1">Appointments</p>
                </div>
                <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-4 text-white shadow-md shadow-teal-200/80 ring-1 ring-white/20">
                    <div className="flex items-center justify-between mb-2">
                        <Pill className="w-5 h-5 text-teal-200" />
                        <span className="text-xs text-teal-200 font-medium">Active</span>
                    </div>
                    <p className="text-3xl font-bold">{medications?.filter(m => m.active !== false).length ?? '—'}</p>
                    <p className="text-xs text-teal-100 mt-1">Medications</p>
                </div>
                <div className="bg-gradient-to-br from-sky-500 to-teal-600 rounded-xl p-4 text-white shadow-md shadow-sky-200/80 ring-1 ring-white/20">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-100" />
                        <span className="text-xs text-blue-100 font-medium">Status</span>
                    </div>
                    <p className="text-3xl font-bold">Good</p>
                    <p className="text-xs text-blue-50 mt-1">Health Status</p>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white/95 rounded-2xl p-6 shadow-md shadow-slate-200/70 border border-white">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-500" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Upcoming Appointments</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onViewAppointments}
                        className="flex items-center gap-1 text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="space-y-3">
                    {loadingAppointment && (
                        <div className="space-y-3">
                            {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                        </div>
                    )}
                    {errorAppointment && <p className="text-red-500 text-sm text-center py-4">{errorAppointment}</p>}
                    {!loadingAppointment && appointments && appointments.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                            <p className="text-sm">No upcoming appointments</p>
                        </div>
                    )}
                    {appointments?.slice(0, 3).map((data: Appointment) => {
                        const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
                            weekday: "long", year: "numeric", month: "long", day: "numeric",
                        });
                        return (
                            <AppointmentCard
                                key={data._id}
                                number={data.number}
                                date={formattedDate}
                                doctor={typeof data.doctorId === 'object' ? data.doctorId.firstName : 'Doctor'}
                                type={typeof data.doctorId === 'object' ? data.doctorId.specialization : 'Specialist'}
                                time={data.time}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
