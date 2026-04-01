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
  currentAppointments: async (citizenId) => {
    const response = await api.get('api/current/appointments/<int:citizen_id>/'.replace('<int:citizen_id>', citizenId));
    return response.data;
  },
  currentPrescriptions: async (citizenId) => {
    const response = await api.get('api/current/prescriptions/<int:citizen_id>/'.replace('<int:citizen_id>', citizenId));
    return response.data;
  }
};

export const facilityAPI = {
  getFacilities: async () => {
    const response = await api.get('facilities/api/facilities/');
    return response.data;
  },
  getFacility: async (facId) => {
    const response = await api.get(`api/facility/${facId}/`);
    return response.data;
  },
  searchFacilities: async (query, type) => {
    const response = await api.get('api/search/', {
      params: { q: query, type }
    });
    return response.data;
  },
  fetchOccupancy: async (facId) => {
    const response = await api.get(`api/facility/${facId}/occupancy/`);
    return response.data;
  },
  fetchAppointments: async (facId) => {
    const response = await api.get(`api/facility/${facId}/appointments/today/`);
    return response.data;
  },
  fetchLowStock: async (facId) => {
    const response = await api.get(`api/facility/${facId}/inventory/low/`);
    return response.data;
  },
  fetchNearExpiry: async (facId) => {
    const response = await api.get(`api/facility/${facId}/expiry/`);
    return response.data;
  },
  fetchFullInventory: async (facId) => {
    const response = await api.get(`api/facility/${facId}/inventory/`);
    return response.data;
  },
  getWardAvailability: async (facId) => {
    const response = await api.get(`api/wards/${facId}/`);
    return response.data;   
  },
  admittedPatients: async (facId) => {
    const response = await api.get(`api/facility/${facId}/patients/admitted/`);
    return response.data;
  },
  getPatient: async (citizenId) => {
    const response = await api.get(`api/facility/get-patient/${citizenId}`);
    return response.data;
  },
  currentAppointments: async (facId) => {
    const response = await api.get(`api/facility/${facId}/appointments/today/`);
    return response.data;
  },
  currentAllPatients: async (facId) => {
    const response = await api.get(`api/facility/get-current-patient/${facId}`);
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
