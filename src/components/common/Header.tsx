import { useState, useEffect } from 'react';
import { Search, Bell, User, CheckSquare, Stethoscope, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import img from '../../../Public/Screenshot 2024-11-21 160510_processed.png';
import { NotificationsDropdown } from "../NotificationsDropdown"
import { TodoModal } from '@/features/doctor/TodoModal';
import axios from 'axios';
import { API } from '@/config/api';
import { clearSession } from '@/lib/auth';
import { useNotifications } from '@/context/NotificationContext';
import { useUserProfile } from '@/context/UserProfileContext';

export function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isTodoOpen, setIsTodoOpen] = useState(false);

  const { unreadCount } = useNotifications();
  const { role, patient, doctor } = useUserProfile();
  const userRole = role || 'patient';
  const userAvatar = (role === 'doctor' ? doctor?.avatarUrl : patient?.avatarUrl) || null;

  useEffect(() => {
    const handleOpenModal = () => setIsTodoOpen(true);
    window.addEventListener('open-todo-modal', handleOpenModal);
    return () => window.removeEventListener('open-todo-modal', handleOpenModal);
  }, []);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (userRole === "doctor") {
        await axios.post(`${API}/doctor/logout`, {}, { withCredentials: true });
      } else {
        await axios.post(`${API}/logout`, {}, { withCredentials: true });
      }
    } catch (_) {}
    clearSession();
    navigate('/signin', { replace: true });
  };

  const handleLogoClick = () => {
    if (userRole === "doctor") {
      navigate('/doctor/dashboard');
    } else {
      navigate('/patient/dashboard');
    }
  };

  return (
    <header className="bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-sm sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Portal Role Subtitle */}
          <div className="flex items-center gap-6">
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity focus:outline-none"
            >
              <img className="w-10 h-10 object-contain" src={img} alt="Medico Logo" />
              <div className="text-left">
                <span className="text-xl font-bold text-gray-900 tracking-tight leading-none block">
                  Medico
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                  {userRole === "doctor" ? (
                    <>
                      <Stethoscope className="w-3 h-3 text-blue-600 inline-block" /> Doctor Portal
                    </>
                  ) : (
                    "Patient Portal"
                  )}
                </span>
              </div>
            </button>

            {/* Quick Access Badges for Doctor */}
            {userRole === "doctor" && (
              <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-gray-200">
                <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                  OPD Active
                </span>
              </div>
            )}
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={
                  userRole === "doctor"
                    ? "Search patients, prescriptions, or lab reports..."
                    : "Search doctors, hospitals, or medications..."
                }
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Access To-Do Button & Dropdown Tab for Doctors */}
            {userRole === "doctor" && (
              <div className="relative">
                <button
                  onClick={() => setIsTodoOpen(!isTodoOpen)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-2xs ${
                    isTodoOpen
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'
                  }`}
                  title="Toggle Clinical Tasks & To-Do List"
                >
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">Quick To-Do</span>
                </button>

                <TodoModal isOpen={isTodoOpen} onClose={() => setIsTodoOpen(false)} />
              </div>
            )}

            {/* Notification Bell Button & Tab */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2.5 rounded-xl transition-all ${
                  notificationsOpen ? 'bg-blue-100/70 text-blue-600' : 'hover:bg-blue-50 text-gray-500 hover:text-blue-600'
                }`}
                aria-label="Toggle Notifications"
              >
                <Bell className="w-5 h-5 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationsDropdown
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
              />
            </div>

            {/* User Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="User Profile"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-200">
                    {userRole === "doctor" ? "D" : "P"}
                  </div>
                )}
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      if (userRole === "doctor") {
                        navigate('/doctor/dashboard?tab=account');
                        window.dispatchEvent(new CustomEvent('open-doctor-account'));
                      } else {
                        navigate('/patient/profile');
                      }
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                  >
                    <User className="w-4 h-4 text-blue-500" /> View Profile
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
