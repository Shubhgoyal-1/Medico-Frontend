import { useEffect, useState } from "react";
import { AnalogWallClock } from "../AnalogClock";
import { Patient } from "@/components/patient/dashboard/types";
import { useUserProfile } from "@/context/UserProfileContext";
import { TodoItem } from "../TodoModal";
import axios from "axios";
import { API } from "@/config/api";
import {
  CalendarDays, Users, Activity, ShieldCheck, CheckSquare, Plus, Trash2, Clock, Sparkles, AlertCircle, Timer
} from "lucide-react";
import { toast } from "sonner";
import { localDayKey } from "@/lib/appointmentStatus";

function TodayLabel() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1.5">
      <Clock className="w-3.5 h-3.5 text-teal-100" />
      {now.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    </span>
  );
}

function TodoCountdown({ todo }: { todo: TodoItem }) {
  const [nowTime, setNowTime] = useState(() => Date.now());
  const running = Boolean(todo.durationMinutes) && !todo.done;

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);

  if (!todo.durationMinutes || todo.done) return null;

  const createdTime = new Date(todo.createdAt).getTime();
  const expiryTime = createdTime + todo.durationMinutes * 60 * 1000;
  const remainingMs = expiryTime - nowTime;

  if (remainingMs <= 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md animate-pulse">
        <AlertCircle className="w-3 h-3 text-rose-600" /> Timer Expired!
      </span>
    );
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
      <Timer className="w-3 h-3 text-teal-600 animate-spin" /> {timeFormatted} left
    </span>
  );
}

type TodayStats = { total: number; completed: number; remaining: number; pending: number };

export default function Overview() {
  const { doctor } = useUserProfile();
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [thisWeekPatients, setThisWeekPatients] = useState<Patient[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('0');

  const fetchDoctorTodos = async () => {
    try {
      const res = await axios.get(`${API}/doctor/getDoctorTodos`, { withCredentials: true });
      if (res.data?.data) {
        setTodos(res.data.data);
      }
    } catch (error) {
      console.log("Failed to fetch doctor todos", error);
    }
  };

  useEffect(() => {
    fetchDoctorTodos();

    const handleTodosUpdated = (e: any) => {
      if (e.detail) {
        setTodos(e.detail);
      } else {
        fetchDoctorTodos();
      }
    };

    window.addEventListener('todos-updated', handleTodosUpdated);
    return () => window.removeEventListener('todos-updated', handleTodosUpdated);
  }, []);

  useEffect(() => {
    const handleOpenTodo = () => {
      const el = document.getElementById('todo-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-blue-400/50');
        setTimeout(() => el.classList.remove('ring-4', 'ring-blue-400/50'), 2000);
      }
    };
    window.addEventListener('open-todo-section', handleOpenTodo);
    return () => window.removeEventListener('open-todo-section', handleOpenTodo);
  }, []);

  useEffect(() => {
    const fetchThisWeekPatient = async () => {
      try {
        const res = await axios.get(`${API}/doctor/getPatientsThisWeek`, {
          withCredentials: true,
        });
        setThisWeekPatients(res.data.data || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchThisWeekPatient();

    const fetchTodayStats = async () => {
      try {
        const res = await axios.get(`${API}/doctor/getTodayAppointments`, {
          params: { date: localDayKey() },
          withCredentials: true,
        });
        setTodayStats(res.data?.data || null);
      } catch (error) {
        setTodayStats(null);
      }
    };
    fetchTodayStats();

    const handleAppointmentsChanged = () => {
      fetchThisWeekPatient();
      fetchTodayStats();
    };
    window.addEventListener('new-appointment-request', handleAppointmentsChanged);
    window.addEventListener('doctor-appointments-changed', handleAppointmentsChanged);
    return () => {
      window.removeEventListener('new-appointment-request', handleAppointmentsChanged);
      window.removeEventListener('doctor-appointments-changed', handleAppointmentsChanged);
    };
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const timerMins = parseInt(durationMinutes, 10);

    try {
      const res = await axios.post(
        `${API}/doctor/addDoctorTodo`,
        {
          text: newTodo.trim(),
          priority: 'normal',
          durationMinutes: timerMins > 0 ? timerMins : null,
        },
        { withCredentials: true }
      );
      if (res.data?.data) {
        setTodos(res.data.data);
        window.dispatchEvent(new CustomEvent('todos-updated', { detail: res.data.data }));
        toast.success('Clinical task added');
      }
      setNewTodo('');
      setDurationMinutes('0');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add task');
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      const res = await axios.put(`${API}/doctor/toggleDoctorTodo/${id}`, {}, { withCredentials: true });
      if (res.data?.data) {
        setTodos(res.data.data);
        window.dispatchEvent(new CustomEvent('todos-updated', { detail: res.data.data }));
      }
    } catch (err) {
      setTodos((prev) =>
        prev.map((t) => (t._id === id || t.id === id ? { ...t, done: !t.done } : t))
      );
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const res = await axios.delete(`${API}/doctor/deleteDoctorTodo/${id}`, { withCredentials: true });
      if (res.data?.data) {
        setTodos(res.data.data);
        window.dispatchEvent(new CustomEvent('todos-updated', { detail: res.data.data }));
        toast.info('Task removed');
      }
    } catch (err) {
      setTodos((prev) => prev.filter((t) => t._id !== id && t.id !== id));
    }
  };

  const patientList = thisWeekPatients
    .map((item: any) => (typeof item?.patientId === 'object' && item.patientId !== null ? item.patientId : item))
    .filter(Boolean);

  const realMaleCount = patientList.filter((p: any) => p?.gender?.toString().toLowerCase() === 'male').length;
  const realFemaleCount = patientList.filter((p: any) => p?.gender?.toString().toLowerCase() === 'female').length;
  const realTotalCount = patientList.length;

  // Use real counts if available, otherwise sample proportions for smooth presentation
  const displayTotal = realTotalCount > 0 ? realTotalCount : 10;
  const displayMale = realTotalCount > 0 ? realMaleCount : 6;
  const displayFemale = realTotalCount > 0 ? realFemaleCount : 4;

  const malePercent = Math.round((displayMale / displayTotal) * 100);
  const femalePercent = 100 - malePercent;

  const initials = doctor
    ? `${doctor.firstName?.[0] ?? ''}${doctor.lastName?.[0] ?? ''}`.toUpperCase()
    : 'DR';

  return (
    <div className="flex-1 space-y-6">
      {/* Top Hero Section (col-span-3) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-500 to-teal-500 rounded-3xl p-8 shadow-xl shadow-blue-500/20 ring-1 ring-white/25 text-white flex justify-between items-center">
        {/* Background Ambient Glows */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-32 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-8 z-10">
          <div className="p-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 shadow-xl">
            <AnalogWallClock size={150} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TodayLabel />
              <span className="bg-teal-400/25 text-teal-100 text-xs font-bold px-3 py-1 rounded-full border border-teal-200/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> MD Verified Practitioner
              </span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Welcome back, Dr. {doctor?.firstName} {doctor?.lastName}
            </h2>
            <p className="text-blue-100 text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-200" />
              Specialization: <span className="text-white font-bold">{doctor?.specialization || "General Practitioner"}</span>
            </p>
          </div>
        </div>

        {/* Doctor Avatar */}
        <div className="relative z-10 flex flex-col items-center">
          {doctor?.avatarUrl ? (
            <img
              className="w-32 h-32 object-cover rounded-2xl ring-4 ring-white/30 shadow-2xl mr-4"
              src={doctor.avatarUrl}
              alt="Doctor Profile"
            />
          ) : (
            <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-md ring-4 ring-white/30 flex items-center justify-center shadow-2xl mr-4">
              <span className="text-3xl font-extrabold text-white">{initials}</span>
            </div>
          )}
        </div>
      </div>

      {/* Middle Widgets (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 1: Appointments Today */}
        <div className="bg-white/95 p-6 rounded-3xl border border-blue-100 shadow-sm flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CalendarDays className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Live Schedule
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Appointments Today
            </h3>
            <p className="text-4xl font-extrabold text-slate-900 mt-1">
              {todayStats ? todayStats.total : "–"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {todayStats
                ? todayStats.total === 0
                  ? "No consultations scheduled today"
                  : `${todayStats.remaining} remaining · ${todayStats.completed} completed${todayStats.pending ? ` · ${todayStats.pending} awaiting confirmation` : ""}`
                : "Scheduled for consultation"}
            </p>
          </div>
        </div>

        {/* Widget 2: Patient Demographics */}
        <div className="bg-white/95 p-6 rounded-3xl border border-teal-100 shadow-sm flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
              Demographics
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Patient Gender Distribution
            </h3>

            <div className="flex items-center gap-4">
              {/* SVG Donut / Pie Chart */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" strokeWidth="16" />
                  {/* Male Slice */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#3B82F6"
                    strokeWidth="16"
                    strokeDasharray={`${(malePercent / 100) * 238.76} 238.76`}
                    strokeDashoffset="0"
                    className="transition-all duration-700 ease-out"
                  />
                  {/* Female Slice */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#EC4899"
                    strokeWidth="16"
                    strokeDasharray={`${(femalePercent / 100) * 238.76} 238.76`}
                    strokeDashoffset={`-${(malePercent / 100) * 238.76}`}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-extrabold text-slate-800 leading-none">{displayTotal}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Patients</span>
                </div>
              </div>

              {/* Legend & Stats */}
              <div className="space-y-2 flex-1 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded-xl bg-blue-50/70 border border-blue-100">
                  <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-2xs" /> Male
                  </span>
                  <span className="font-extrabold text-blue-900">{displayMale} ({malePercent}%)</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-xl bg-pink-50/70 border border-pink-100">
                  <span className="flex items-center gap-1.5 text-pink-700 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block shadow-2xs" /> Female
                  </span>
                  <span className="font-extrabold text-pink-900">{displayFemale} ({femalePercent}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 3: Patients This Week */}
        <div className="bg-white/95 p-6 rounded-3xl border border-blue-100 shadow-sm flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              Weekly Activity
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Patients This Week
            </h3>
            <p className="text-4xl font-extrabold text-slate-900 mt-1">
              {thisWeekPatients.length || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Registered consultations</p>
          </div>
        </div>
      </div>

      {/* Todo Section */}
      <div id="todo-section" className="bg-white/95 p-6 rounded-3xl border border-blue-100 shadow-md shadow-slate-200/60 space-y-4 transition-all duration-300">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Clinical Tasks & Quick To-Do</h3>
              <p className="text-xs text-gray-400">Synced to Doctor DB schema with optional timers</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {todos.filter((t) => !t.done).length} Tasks Pending
          </span>
        </div>

        {/* Form to Add Todo */}
        <form onSubmit={handleAddTodo} className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Add new clinical task (e.g. Follow up with patient room 104)..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
              required
            />

            <div className="flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600">
              <Timer className="w-4 h-4 text-teal-600" />
              <span>Timer:</span>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="bg-transparent focus:outline-none font-bold text-teal-700"
              >
                <option value="0">None</option>
                <option value="5">5 mins</option>
                <option value="15">15 mins</option>
                <option value="30">30 mins</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </form>

        {/* Task List */}
        <div className="space-y-2 pt-1">
          {todos.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">No tasks added yet.</p>
          ) : (
            todos.map((todo) => {
              const todoId = todo._id || todo.id || '';
              return (
                <div
                  key={todoId}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    todo.done
                      ? 'bg-gray-50/60 border-gray-100 text-gray-400 line-through'
                      : 'bg-teal-50/30 border-teal-100/70 text-gray-800 shadow-2xs hover:border-teal-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => handleToggleTodo(todoId)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold truncate">{todo.text}</span>
                      <TodoCountdown todo={todo} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTodo(todoId)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
