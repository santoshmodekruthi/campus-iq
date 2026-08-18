import axios from 'axios';

/* =======================
   API BASE URL
======================= */
const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://dropout-backend-r596.onrender.com/api';

/* =======================
   AXIOS INSTANCE
======================= */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/* =======================
   REQUEST INTERCEPTOR
======================= */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* =======================
   RESPONSE INTERCEPTOR
======================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/* =======================
   AUTH APIs
======================= */
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

/* =======================
   STUDENT APIs
======================= */
export const studentAPI = {
  submitEvent: (data) => api.post('/student/event', data),
  getDashboard: () => api.get('/student/dashboard'),
};

/* =======================
   MENTOR APIs
======================= */
export const mentorAPI = {
  getDashboard: () => api.get('/mentor/dashboard'),
  getStudentDetails: (id) => api.get(`/mentor/student/${id}`),
};

/* =======================
   ADMIN APIs
======================= */
export const adminAPI = {
  getOverview: () => api.get('/admin/overview'),
};

export default api;




