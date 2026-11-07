import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/doctor/dashboard/Sidebar";
import { RouteFallback } from "@/components/common/RouteFallback";
import axios from "axios";
import { API } from "@/config/api";
import { AppointmentType } from "@/types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserX } from "lucide-react";
import { clearSession } from "@/lib/auth";

const Overview = lazy(() => import("@/components/doctor/dashboard/Overview"));
const Appointment = lazy(() => import("@/components/doctor/Appointment"));
const Account = lazy(() => import("@/components/doctor/Account"));
const Settings = lazy(() => import("@/components/doctor/Settings"));

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [activePage, setActivePage] = useState<string>(() => {
    return searchParams.get("tab") || "overview";
  });
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActivePage(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleOpenAccount = () => setActivePage("account");
    window.addEventListener("open-doctor-account", handleOpenAccount);
    return () => window.removeEventListener("open-doctor-account", handleOpenAccount);
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/doctor/getAppointments`, { withCredentials: true });
      const queue = Array.isArray(res.data?.data) ? res.data.data.filter(Boolean) : [];
      setAppointments(queue);
    } catch (err) {
      setAppointments([]);
    }
  }, []);

  const refreshQueue = () => {
    window.dispatchEvent(new CustomEvent("doctor-appointments-changed", { detail: { source: "doctor" } }));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/signin', { replace: true });
      return;
    }

    fetchAppointments();

    const handleNewAppointment = (e: any) => {
      if (e.detail) {
        fetchAppointments();
      }
    };

    window.addEventListener("new-appointment-request", handleNewAppointment);
    window.addEventListener("doctor-appointments-changed", handleNewAppointment);
    return () => {
      window.removeEventListener("new-appointment-request", handleNewAppointment);
      window.removeEventListener("doctor-appointments-changed", handleNewAppointment);
    };
  }, [navigate, fetchAppointments]);

  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, Math.max(0, appointments.length - 1)));
  }, [appointments.length]);

  const handleNextAppointment = async () => {
    try {
      const currAppt = appointments[currentIndex];
      if (currAppt && currAppt._id) {
        const patientId = typeof currAppt.patientId === 'object' ? currAppt.patientId._id : currAppt.patientId;
        await axios.post(`${API}/doctor/finishPatientAppointment`, {
          appointmentId: currAppt._id,
          patientId
        }, { withCredentials: true });
      }
      
      setAppointments(prev =>
        prev.filter((_, index) => index !== currentIndex)
      );
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      setAppointments(prev =>
        prev.filter((_, index) => index !== currentIndex)
      );
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }
  };

  const handleSelectAppointment = (index: number) => {
    setCurrentIndex(index);
    setActivePage("appointments");
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/doctor/logout`, {}, { withCredentials: true });
    } catch (_) {}
    clearSession();
    navigate('/signin', { replace: true });
  };

  const renderPage = () => {
    switch (activePage) {
      case "overview":
        return <Overview />;
      case "appointments":
        if (appointments.length === 0) {
          return (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-100 shadow-sm max-w-lg mx-auto mt-12 space-y-3">
              <UserX className="w-12 h-12 mx-auto text-gray-300" />
              <h3 className="text-base font-bold text-gray-800">No Appointments Scheduled</h3>
              <p className="text-xs text-gray-500">There are currently no active patient appointments in your queue.</p>
              <button
                onClick={() => setActivePage("overview")}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-200 hover:bg-blue-700 transition-all mt-2"
              >
                Back to Overview
              </button>
            </div>
          );
        }
        return (
          <Appointment
            appointment={appointments[currentIndex]}
            onFinish={handleNextAppointment}
            onChanged={refreshQueue}
          />
        );
      case "account":
        return <Account />;
      case "settings":
        return <Settings />;
      case "logout":
        handleLogout();
        return null;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onMenuChange={setActivePage}
          appointments={appointments}
          onSelectAppointment={handleSelectAppointment}
          currentIndex={currentIndex}
          activePage={activePage}
        />
        <main className="medico-scroll flex-1 bg-transparent p-6 overflow-y-auto">
          <Suspense fallback={<RouteFallback />}>
            {renderPage()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
