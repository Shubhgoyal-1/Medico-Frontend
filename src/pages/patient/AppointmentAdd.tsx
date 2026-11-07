import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import { SearchSection } from "../../components/SearchSection";
import { ArrowLeft, MapPin, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/context/UserProfileContext";

function PatientSection({ setPatientState, setPatientCity }: { setPatientState: (s: string) => void, setPatientCity: (c: string) => void }) {
    const { patient, status } = useUserProfile();
    const navigate = useNavigate();

    useEffect(() => {
        if (status === 'unauthenticated' || status === 'error') {
            navigate('/signin', { replace: true });
        }
    }, [status, navigate]);

    useEffect(() => {
        if (patient?.fullAddress) {
            setPatientState(patient.fullAddress.state || "");
            setPatientCity(patient.fullAddress.city || "");
        }
    }, [patient, setPatientState, setPatientCity]);

    return (
        <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <button
                    onClick={() => navigate('/patient/dashboard')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="flex items-center gap-5">
                    {patient?.avatarUrl ? (
                        <img
                            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-200 shadow-md flex-shrink-0"
                            src={patient.avatarUrl}
                            alt="Patient"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-md flex-shrink-0">
                            <User className="w-7 h-7 text-white" />
                        </div>
                    )}

                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'Loading...'}
                        </h1>
                        {patient?.fullAddress && (
                            <div className="flex items-center gap-1.5 text-sm text-teal-600 font-medium mt-0.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {patient.fullAddress.city}, {patient.fullAddress.state}
                            </div>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">Find and book appointments with nearby doctors</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AppointmentAdd() {
    const [patientState, setPatientState] = useState<string>("");
    const [patientCity, setPatientCity] = useState<string>("");

    return (
        <div className="min-h-screen bg-transparent">
            <Header />
            <PatientSection setPatientCity={setPatientCity} setPatientState={setPatientState} />
            <SearchSection patientCity={patientCity} patientState={patientState} />
        </div>
    );
}
