import axios from 'axios';
import { API } from '@/config/api';

export const apiClient = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      sessionStorage.removeItem('doctor_profile');
    }
    return Promise.reject(error);
  }
);
