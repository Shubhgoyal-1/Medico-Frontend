import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import axios from 'axios';
import { API } from '@/config/api';
import { AUTH_CHANGED_EVENT, clearSession } from '@/lib/auth';
import { Doctor, Patient } from '@/types';

export type UserRole = 'patient' | 'doctor';
type ProfileStatus = 'loading' | 'ready' | 'unauthenticated' | 'error';

interface UserProfileContextType {
  role: UserRole | null;
  patient: Patient | null;
  doctor: Doctor | null;
  status: ProfileStatus;
  setPatient: (patient: Patient | null) => void;
  setDoctor: (doctor: Doctor | null) => void;
  refresh: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

function readRole(): UserRole | null {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  if (!token || (role !== 'patient' && role !== 'doctor')) return null;
  return role;
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(() => readRole());
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [status, setStatus] = useState<ProfileStatus>(() => (readRole() ? 'loading' : 'unauthenticated'));
  const generation = useRef(0);
  const inflight = useRef<{ role: UserRole | null; promise: Promise<void> } | null>(null);

  const refresh = useCallback(async () => {
    const nextRole = readRole();
    if (inflight.current?.role === nextRole) return inflight.current.promise;

    const ticket = ++generation.current;
    const task = (async () => {
      if (!nextRole) {
        if (ticket !== generation.current) return;
        setRole(null);
        setPatient(null);
        setDoctor(null);
        setStatus('unauthenticated');
        return;
      }

      setRole(nextRole);
      setStatus((current) => (current === 'ready' ? 'ready' : 'loading'));
      try {
        if (nextRole === 'doctor') {
          const res = await axios.get(`${API}/doctor/getDoctorProfile`, { withCredentials: true });
          if (ticket !== generation.current) return;
          setDoctor(res.data?.data ?? null);
          setPatient(null);
        } else {
          const res = await axios.get(`${API}/getPatientProfile`, { withCredentials: true });
          if (ticket !== generation.current) return;
          setPatient(res.data?.data ?? null);
          setDoctor(null);
        }
        if (ticket !== generation.current) return;
        setStatus('ready');
      } catch {
        if (ticket !== generation.current) return;
        setPatient(null);
        setDoctor(null);
        setRole(null);
        setStatus('error');
        clearSession();
      }
    })();

    const tracked = task.finally(() => {
      if (inflight.current?.promise === tracked) inflight.current = null;
    });
    inflight.current = { role: nextRole, promise: tracked };
    return tracked;
  }, []);

  useEffect(() => {
    refresh();
    const onAuth = () => { refresh(); };
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
  }, [refresh]);

  const value = useMemo(
    () => ({ role, patient, doctor, status, setPatient, setDoctor, refresh }),
    [role, patient, doctor, status, refresh]
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
