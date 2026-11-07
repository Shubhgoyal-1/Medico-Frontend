import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Doctor } from "@/components/patient/dashboard/types";
import { DoctorCard } from "@/components/doctor/DoctorCard";
import { Header } from "@/components/Header";
interface Hospital {
    _id: string;
    name: string;
    address: string;
    phone: string;
    pincode: string;
    state: string;
    city: string;
    avatarUrl:string
}

import { API } from "@/config/api";
// const hospital =
// {
//     _id: "1",
//     name: "Hospital A",
//     address: "123 Main Street",
//     phone: "123-456-7890",
//     pincode: "12345",
//     state: "State A",
//     city: "City A",
// }
const patient = {
    "avatarUrl":"/public/alternate.jpeg",
    "name": "hello",
}

export function Hospital() {
    const { id } = useParams<{ id: string }>();
    const [hospital, setHospital] = useState<Hospital | null>(null);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            console.log("called")
            console.log(id)
            setLoading(true);
            try {
                const hospitalRes = await axios.get(`${API}/getHospital`, { params: { id } });
                const doctorRes = await axios.get(`${API}/getDoctorByHospital`, { params: { id } });
                setHospital(hospitalRes.data.data);
                setDoctors(doctorRes.data.data || []);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to fetch hospital details");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <p className="p-4">Loading...</p>;
    if (error) return <p className="p-4 text-red-500">{error}</p>;

    return (
        <>
            <Header />
            <div className="max-w-6xl mx-auto p-6">
                {hospital ? (
                    <>
                        {/* Patient Info + Back Button */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <img
                                    src={patient?.avatarUrl || "/public/alternate.jpeg"}
                                    alt="Patient"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <p className="font-semibold">{patient?.name || "Patient Name"}</p>
                            </div>
                            <button
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                ← Go Back
                            </button>
                        </div>

                        {/* Hospital Info */}
                        <div className="bg-white shadow-md rounded-lg p-6 flex gap-8 mb-10">
                            {/* Hospital Image */}
                            <img
                                src={hospital.avatarUrl || "/hospital-placeholder.jpg"}
                                alt={hospital.name}
                                className="w-64 h-64 object-cover rounded-lg"
                            />

                            {/* Hospital Details */}
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{hospital.name}</h1>
                                <p className="text-gray-600">{hospital.address}</p>
                                <p className="text-gray-600">
                                    {hospital.city}, {hospital.state} - {hospital.pincode}
                                </p>
                                <p className="mt-2 font-semibold">📞 {hospital.phone}</p>
                            </div>
                        </div>

                        {/* Doctors Available */}
                        <div className="mb-8">
                            <h2 className="text-xl font-bold mb-4">Doctors Available</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {doctors && doctors.length > 0 ? (
                                    doctors.map((d) => (
                                        <DoctorCard
                                            key={d._id}
                                            name={d.firstName + " " + d.lastName}
                                            specialization={d.specialization}
                                            experience={d.experience}
                                            fees={d.feePerVisit}
                                            hospital={d.workplace}
                                            avatarUrl={d.avatarUrl}
                                            doctorId={d._id}
                                        />
                                    ))
                                ) : (
                                    <p>No Doctors Found</p>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <p>No hospital details found.</p>
                )}
            </div>
        </>
    );
}
