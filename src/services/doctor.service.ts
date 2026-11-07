import { apiClient } from './api.service';

export const doctorService = {
  getProfile: async () => {
    const cached = sessionStorage.getItem('doctor_profile');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (_) {}
    }
    const res = await apiClient.get('/doctor/getDoctorProfile');
    if (res.data?.data) {
      sessionStorage.setItem('doctor_profile', JSON.stringify(res.data.data));
      return res.data.data;
    }
    return null;
  },

  getAppointments: async () => {
    const res = await apiClient.get('/doctor/getAppointments');
    return res.data?.data || [];
  },

  getThisWeekPatients: async () => {
    const res = await apiClient.get('/doctor/getPatientsThisWeek');
    return res.data?.data || [];
  },

  getTodos: async () => {
    const res = await apiClient.get('/doctor/getDoctorTodos');
    return res.data?.data || [];
  },

  addTodo: async (todoData: { text: string; priority?: string; durationMinutes?: number | null }) => {
    const res = await apiClient.post('/doctor/addDoctorTodo', todoData);
    return res.data?.data || [];
  },

  toggleTodo: async (todoId: string) => {
    const res = await apiClient.put(`/doctor/toggleDoctorTodo/${todoId}`);
    return res.data?.data || [];
  },

  editTodo: async (todoData: { todoId: string; text?: string; priority?: string; durationMinutes?: number | null }) => {
    const res = await apiClient.put('/doctor/editDoctorTodo', todoData);
    return res.data?.data || [];
  },

  deleteTodo: async (todoId: string) => {
    const res = await apiClient.delete(`/doctor/deleteDoctorTodo/${todoId}`);
    return res.data?.data || [];
  },

  updatePreferences: async (preferences: {
    autoConfirmBooking?: boolean;
    emailNotifications?: boolean;
    smsAlerts?: boolean;
    allowEmergencyBooking?: boolean;
    consultationSlotMinutes?: number;
  }) => {
    const res = await apiClient.put('/doctor/updateDoctorPreferences', preferences);
    return res.data?.data;
  },

  finishAppointment: async (appointmentId: string, patientId: string) => {
    const res = await apiClient.post('/doctor/finishPatientAppointment', { appointmentId, patientId });
    return res.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/doctor/logout');
    } catch (_) {}
    sessionStorage.removeItem('doctor_profile');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  },
};
