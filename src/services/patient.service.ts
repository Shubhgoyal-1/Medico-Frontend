import { apiClient } from './api.service';

export const patientService = {
  getProfile: async () => {
    const res = await apiClient.get('/getPatientProfile');
    return res.data?.data;
  },

  editProfile: async (data: any) => {
    const res = await apiClient.put('/editPatientProfile', data);
    return res.data?.data;
  },

  updateAvatar: async (avatarUrl: string) => {
    const res = await apiClient.put('/updatePatientAvatar', { avatarUrl });
    return res.data?.data;
  },

  changePassword: async (passwordData: any) => {
    const res = await apiClient.put('/editPatientPassword', passwordData);
    return res.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/logout');
    } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  },
};
