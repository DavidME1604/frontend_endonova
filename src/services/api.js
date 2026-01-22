import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
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

// AUTH SERVICES
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verify: () => api.post('/auth/verify'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// PATIENT SERVICES
export const patientService = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  getByHistoria: (historia) => api.get(`/patients/historia/${historia}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

// FICHA SERVICES
export const fichaService = {
  getAll: (params) => api.get('/fichas', { params }),
  getById: (id) => api.get(`/fichas/${id}`),
  create: (data) => api.post('/fichas', data),
  update: (id, data) => api.put(`/fichas/${id}`, data),
  delete: (id) => api.delete(`/fichas/${id}`),
};

// ODONTOGRAMA SERVICES
export const odontogramaService = {
  getByFicha: (fichaId) => api.get(`/odontogramas/ficha/${fichaId}`),
  create: (data) => api.post('/odontogramas', data),
  update: (id, data) => api.put(`/odontogramas/${id}`, data),
  delete: (id) => api.delete(`/odontogramas/${id}`),
  getEstados: () => api.get('/odontogramas/estados'),
};

// PRESUPUESTO SERVICES
export const presupuestoService = {
  getAll: (params) => api.get('/presupuestos', { params }),
  getById: (id) => api.get(`/presupuestos/${id}`),
  getByFicha: (fichaId) => api.get(`/presupuestos/ficha/${fichaId}`),
  create: (data) => api.post('/presupuestos', data),
  update: (id, data) => api.put(`/presupuestos/${id}`, data),
  delete: (id) => api.delete(`/presupuestos/${id}`),
  getPagos: (id) => api.get(`/presupuestos/${id}/pagos`),
  addPago: (id, data) => api.post(`/presupuestos/${id}/pagos`, data),
  getEstadisticas: () => api.get('/presupuestos/estadisticas'),
};

// CITA SERVICES
export const citaService = {
  getAll: (params) => api.get('/citas', { params }),
  getById: (id) => api.get(`/citas/${id}`),
  getByFecha: (fecha) => api.get(`/citas/fecha/${fecha}`),
  getByPaciente: (pacienteId) => api.get(`/citas/paciente/${pacienteId}`),
  getProximas: (dias = 7) => api.get('/citas/proximas', { params: { dias } }),
  create: (data) => api.post('/citas', data),
  update: (id, data) => api.put(`/citas/${id}`, data),
  updateEstado: (id, estado) => api.patch(`/citas/${id}/estado`, { estado }),
  delete: (id) => api.delete(`/citas/${id}`),
};

export default api;
