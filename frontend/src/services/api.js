import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authAction = /\/auth\/(student-login|admin-login|register|change-password)/.test(error.config?.url || '');
    if (error.response?.status === 401 && !authAction) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  loginStudent: (data) => api.post('/auth/student-login', data),
  loginAdmin: (data) => api.post('/auth/admin-login', data),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const studentAPI = {
  submitEvent: (data) => api.post('/student/event', data),
  getDashboard: () => api.get('/student/dashboard'),
  updateProfile: (data) => api.patch('/student/profile', data),
};

export const adminAPI = {
  getOverview: () => api.get('/admin/overview'),
  getStudents: (params) => api.get('/admin/students', { params }),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  exportStudents: (params) => api.get('/admin/students/export.csv', { params, responseType: 'blob' }),
};

export default api;
