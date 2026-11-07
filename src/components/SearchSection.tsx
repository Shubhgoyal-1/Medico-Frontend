import { useEffect, useState } from "react";
import { DoctorCard } from "./doctor/DoctorCard";
import { HospitalCard } from "./hospital/HospitalCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import statesWithCities from "@/constants/stateWithCities";
import { Doctor, Hospital } from "./patient/dashboard/types";
import axios from "axios";
import { ArrowLeft, Search, Filter, Stethoscope, Building2, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { API } from "@/config/api";

export const SearchSection = ({ patientState, patientCity }: any) => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [hospital, setHospital] = useState<Hospital[]>([]);
    const [stateValue, setStateValue] = useState(patientState);
    const [cityValue, setCityValue] = useState(patientCity);

    // Search query states
    const [doctorSearch, setDoctorSearch] = useState("");
    const [hospitalSearch, setHospitalSearch] = useState("");

    useEffect(() => {
        if (patientState) setStateValue(patientState);
        if (patientCity) setCityValue(patientCity);
    }, [patientState, patientCity]);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await axios.get(`${API}/getDoctorsByFilter`, {
                    params: { state: stateValue, city: cityValue }
                });
                setDoctors(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch doctors", err);
            }
        };
        fetchDoctors();
    }, [cityValue, stateValue]);

    useEffect(() => {
        const fetchHospital = async () => {
            try {
                const res = await axios.get(`${API}/hospital/getHospitalsByStateAndCity`, {
                    params: { state: stateValue, city: cityValue }
                });
                setHospital(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch hospitals", err);
            }
        };
        fetchHospital();
    }, [cityValue, stateValue]);

    // Client-side search filtering
    const filteredDoctors = doctors.filter((d) => {
        const name = `${d.firstName} ${d.lastName}`.toLowerCase();
        const spec = d.specialization?.toLowerCase() || "";
        const query = doctorSearch.toLowerCase();
        return name.includes(query) || spec.includes(query);
    });

    const filteredHospitals = hospital.filter((h) => {
        const name = h.name.toLowerCase();
        const addr = h.address?.toLowerCase() || "";
        const query = hospitalSearch.toLowerCase();
        return name.includes(query) || addr.includes(query);
    });

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
            
            {/* Filter Header Bar */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Filter className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 text-base">Filter by Location</h2>
                        <p className="text-xs text-gray-500">Narrow down available doctors & medical centers</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* State Selector */}
                    <div className="flex-1 md:w-56 min-w-[160px]">
                        <select
                            onChange={(e) => {
                                setStateValue(e.target.value);
                                setCityValue("");
                            }}
                            value={stateValue}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                        >
                            <option value="">Select State</option>
                            {statesWithCities.map((s) => (
                                <option key={s.state} value={s.state}>
                                    {s.state}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* City Selector */}
                    <div className="flex-1 md:w-56 min-w-[160px]">
                        <select
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all disabled:opacity-50"
                            value={cityValue}
                            onChange={(e) => setCityValue(e.target.value)}
                            disabled={!stateValue}
                        >
                            <option value="">Select City</option>
                            {statesWithCities.find((s) => s.state === stateValue)?.cities.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Doctors Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Stethoscope className="w-4.5 h-4.5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Available Doctors</h2>
                            <p className="text-xs text-gray-500">{filteredDoctors.length} specialists found</p>
                        </div>
                    </div>

                    {/* Doctor Search */}
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search doctor or specialty..."
                            value={doctorSearch}
                            onChange={(e) => setDoctorSearch(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                        />
                        {doctorSearch && (
                            <button
                                onClick={() => setDoctorSearch("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Horizontal Scroll Cards Container */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <ScrollArea className="w-full">
                        <div className="flex space-x-4 pb-2">
                            {filteredDoctors.length > 0 ? (
                                filteredDoctors.map((d) => (
                                    <DoctorCard
                                        key={d._id}
                                        name={`${d.firstName} ${d.lastName}`}
                                        specialization={d.specialization}
                                        experience={d.experience}
                                        fees={d.feePerVisit}
                                        hospital={d.workplace}
                                        avatarUrl={d.avatarUrl}
                                        doctorId={d._id}
                                    />
                                ))
                            ) : (
                                <div className="w-full text-center py-12">
                                    <Stethoscope className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-gray-600">No Doctors Found</p>
                                    <p className="text-xs text-gray-400 mt-1">Try selecting a different state or city filter.</p>
                                </div>
                            )}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            </div>

            {/* Hospitals Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                            <Building2 className="w-4.5 h-4.5 text-teal-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Partner Hospitals & Clinics</h2>
                            <p className="text-xs text-gray-500">{filteredHospitals.length} medical centers found</p>
                        </div>
                    </div>

                    {/* Hospital Search */}
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search hospital name or address..."
                            value={hospitalSearch}
                            onChange={(e) => setHospitalSearch(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
                        />
                        {hospitalSearch && (
                            <button
                                onClick={() => setHospitalSearch("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Horizontal Scroll Cards Container */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <ScrollArea className="w-full">
                        <div className="flex space-x-4 pb-2">
                            {filteredHospitals.length > 0 ? (
                                filteredHospitals.map((h) => (
                                    <HospitalCard
                                        key={h._id}
                                        onClick={() => navigate(`/hospital/${h._id}`)}
                                        name={h.name}
                                        address={h.address}
                                    />
                                ))
                            ) : (
                                <div className="w-full text-center py-12">
                                    <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-gray-600">No Hospitals Found</p>
                                    <p className="text-xs text-gray-400 mt-1">Try selecting a different state or city filter.</p>
                                </div>
                            )}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            </div>

        </div>
    );
};
