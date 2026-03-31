import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (identifier, password, role) => {
    const response = await api.post('accounts/api/login/', { identifier, password, role });
    return response.data;
  },
};

export const citizenAPI = {
  medicalHistory: async (citizenId) => {
    const response = await api.get('clinical/api/history/<int:citizen_id>/'.replace('<int:citizen_id>', citizenId));
    return response.data;
  },
  vaccinationHistory: async (citizenId) => {
    const response = await api.get('clinical/api/vaccinations/<int:citizen_id>/'.replace('<int:citizen_id>', citizenId));
    return response.data;
  },
  eligibleVaccines: async (citizenId) => {
    const response = await api.get('clinical/api/vaccines/eligible/<int:citizen_id>/'.replace('<int:citizen_id>', citizenId));
    return response.data;
  },
  visitDetail: async (visitId) => {
    const response = await api.get('clinical/api/visit/<int:id>/'.replace('<int:id>', visitId));
    return response.data;
  },
  bookAppointment: async (appointmentData) => {
    const response = await api.post('clinical/api/appointments/book/', appointmentData);
    return response.data;
  },
  searchDirectory: async (searchType, searchQuery) => {
    const response = await api.get('clinical/api/directory/search/', {
      params: { type: searchType, query: searchQuery }
    });
    return response.data;
  },
};

export const facilityAPI = {
  getFacilities: async () => {
    const response = await api.get('facilities/api/facilities/');
    return response.data;
  },
  searchFacilities: async (query, type) => {
    const response = await api.get('api/search/', {
      params: { q: query, type }
    });
    return response.data;
  },
};

export default api;
