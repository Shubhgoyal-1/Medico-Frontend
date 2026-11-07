import { useState, useEffect } from "react";
import { Calendar, LayoutDashboard, User, Settings, LogOut, ChevronDown, ChevronRight, Stethoscope, Search } from "lucide-react";
import { AppointmentMiniatureCard } from "@/components/patient/cards/AppointmmentMiniatureCard";
import { AppointmentType } from "@/types";

interface SidebarProps {
  onMenuChange: (menu: string) => void;
  appointments: AppointmentType[];
  onSelectAppointment: (index: number) => void;
  currentIndex: number;
  activePage?: string;
}

export function Sidebar({ onMenuChange, appointments, onSelectAppointment, currentIndex, activePage }: SidebarProps) {
  const [openAppointments, setOpenAppointments] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    return activePage === "overview" ? "dashboard" : activePage || "dashboard";
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (activePage) {
      setActiveTab(activePage === "overview" ? "dashboard" : activePage);
    }
  }, [activePage]);

  const handleTabClick = (menu: string) => {
    setActiveTab(menu);
    onMenuChange(menu);
  };

  // Filter appointments by search term
  const filteredAppointments = appointments.filter((appt) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const patientObj = typeof appt.patientId === 'object' ? appt.patientId : null;
    const name = `${patientObj?.firstName || ''} ${patientObj?.lastName || ''}`.toLowerCase();
    const num = appt.number?.toString() || '';
    return name.includes(term) || num.includes(term);
  });

  // Limit to max 10 appointments in side panel
  const displayedAppointments = filteredAppointments.slice(0, 10);
  const hiddenCount = Math.max(0, filteredAppointments.length - 10);

  return (
    <aside className="w-64 bg-white/95 border-r border-slate-200/80 h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shadow-sm flex-shrink-0">
      {/* Top Navigation */}
      <div className="space-y-4">
        
        {/* Doctor Console Title Badge */}
        <div className="px-3.5 py-3 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl border border-blue-100">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900">Doctor Console</h2>
            <p className="text-[11px] text-teal-700 font-semibold">Clinical Workstation</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1.5 text-sm font-semibold">
          {/* Dashboard */}
          <button
            onClick={() => handleTabClick("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "text-gray-600 hover:bg-teal-50 hover:text-teal-700"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {/* Appointments Dropdown */}
          <div>
            <button
              onClick={() => {
                setOpenAppointments(!openAppointments);
                handleTabClick("appointments");
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "appointments"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-gray-600 hover:bg-teal-50 hover:text-teal-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>Appointments</span>
              </div>
              <div className="flex items-center gap-1.5">
                {appointments.length > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === "appointments" ? "bg-white/20 text-white" : "bg-teal-100 text-teal-800"
                  }`}>
                    {appointments.length}
                  </span>
                )}
                {openAppointments ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </button>

            {/* Sublist & Search */}
            {openAppointments && (
              <div className="mt-2 ml-2 pl-2 space-y-2">
                {/* Easily usable Appointment Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter patient queue..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all font-normal"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[10px] text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {displayedAppointments.length === 0 ? (
                    <p className="text-[11px] text-gray-400 italic p-2">
                      {searchTerm ? "No matching patient" : "No appointments scheduled"}
                    </p>
                  ) : (
                    displayedAppointments.map((appt) => {
                      const originalIndex = appointments.findIndex(a => a._id === appt._id);
                      return (
                        <AppointmentMiniatureCard
                          key={appt._id || originalIndex}
                          appointment={appt as any}
                          onClick={() => onSelectAppointment(originalIndex >= 0 ? originalIndex : 0)}
                          isSelected={currentIndex === originalIndex}
                        />
                      );
                    })
                  )}

                  {hiddenCount > 0 && (
                    <p className="text-[10px] text-teal-700 font-bold text-center py-1 bg-teal-50 rounded-lg border border-teal-100">
                      + {hiddenCount} more in queue (Showing top 10)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Account */}
          <button
            onClick={() => handleTabClick("account")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === "account"
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "text-gray-600 hover:bg-teal-50 hover:text-teal-700"
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Account</span>
          </button>
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-1.5 border-t border-gray-100 pt-4 text-sm font-semibold">
        <button
          onClick={() => handleTabClick("settings")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === "settings"
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "text-gray-600 hover:bg-teal-50 hover:text-teal-700"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => onMenuChange("logout")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
