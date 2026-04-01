import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const citizenAPI = {
  medicalHistory: async (citizenId) => {
    const response = await api.get('api/history/<int:citizen_id>/'.replace('<int:citizen_id>', citizenId));
    return response.data;
  },
  vaccinationHistory: async (citizenId) => {
    const response = await api.get('api/vaccinations/<int:citizen_id>/'.replace('<int:citizen_id>', citizenId));
    return response.data;
  },
  eligibleVaccines: async (citizenId) => {
    const response = await api.get('api/vaccines/eligible/<int:citizen_id>/'.replace('<int:citizen_id>', citizenId));
    return response.data;
  },
  visitDetail: async (visitId) => {
    const response = await api.get('api/visit/<int:id>/'.replace('<int:id>', visitId));
    return response.data;
  },
  bookAppointment: async (appointmentData) => {
    const response = await api.post('api/appointments/book/', appointmentData);
    return response.data;
  },
  searchDirectory: async (searchType, searchQuery) => {
    const response = await api.get('api/search/', {
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

export const getLowStockAlerts = async (facId) => {
  const response = await api.get(`inventory/api/alerts/low-stock/${facId}/`);
  return response.data;
}

export const getNearExpiryAlerts = async (facId) => {
  const response = await api.get(`inventory/api/alerts/expiry/${facId}/`);
  return response.data;
}

export default api;
