export const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_API || 'http://localhost:3000';
export const PATIENT_API = API;
export const DOCTOR_API = `${API}/doctor`;
