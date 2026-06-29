import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
});

// attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// auth interceptor — redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ── Files ──────────────────────────────────────────
export const getFiles      = ()         => api.get('/files');
export const getFile       = (id)       => api.get(`/files/${id}`);
export const createFile    = (data)     => api.post('/files', data);
export const updateFile    = (id, data) => api.put(`/files/${id}`, data);
export const deleteFile    = (id)       => api.delete(`/files/${id}`);
export const getExecutions = (id)       => api.get(`/files/${id}/executions`);

// ── Execution ──────────────────────────────────────
export const executeCode   = (data)     => api.post('/code/execute', data);
export const getJobStatus  = (jobId)    => api.get(`/code/status/${jobId}`);

export default api;