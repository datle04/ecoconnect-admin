
import axios from 'axios';

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;


const API_BASE_URL = `${BACK_END_URL}/api`; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  
  login: (credentials) => api.post('/auth/admin/login', credentials),
  
  
  getEvents: (params) => api.get('/admin/events', { params }),
  approveEvent: (id) => api.patch(`/admin/events/${id}/approve`),
  rejectEvent: (id, reason) => api.patch(`/admin/events/${id}/reject`, { reason }),
  
  
  getTickets: (params) => api.get('/admin/tickets', { params }),
  resolveTicket: (id, status) => api.patch(`/admin/tickets/${id}`, { status }),
  
  
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserHistory: (id) => api.get(`/admin/users/${id}/history`),
  updateUserStatus: (id, status, reason) => api.patch(`/admin/users/${id}/status`, { status, reason }),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),

  
  deleteEventForce: (id, reason) => api.delete(`/admin/events/${id}`, { data: { reason } }),

  
  broadcastNotification: (data) => api.post('/admin/notifications/broadcast', data),
  
};

export default api;