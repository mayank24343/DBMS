import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// --- Attach token to every outgoing request ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// --- Handle expired/invalid tokens globally ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_role');
      localStorage.removeItem('auth_user_id');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const authAPI = {
  login: async (identifier, password, role) => {
    const response = await api.post('api/login/', { identifier, password, role });
    const { token, role: returnedRole, ...rest } = response.data;
    const userId = rest.citizen_id ?? rest.worker_id ?? rest.id;

    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_role', returnedRole);
    if (userId !== undefined) {
      localStorage.setItem('auth_user_id', userId);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_user_id');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    return {
      token,
      role: localStorage.getItem('auth_role'),
      id: localStorage.getItem('auth_user_id'),
    };
  },
};

export const citizenAPI = {
  medicalHistory: async (citizenId) => {
    const response = await api.get(`api/history/${citizenId}/`);
    return response.data;
  },
  vaccinationHistory: async (citizenId) => {
    const response = await api.get(`api/vaccinations/${citizenId}/`);
    return response.data;
  },
  eligibleVaccines: async (citizenId) => {
    const response = await api.get(`api/vaccines/eligible/${citizenId}/`);
    return response.data;
  },
  visitDetail: async (visitId) => {
    const response = await api.get(`api/visit/${visitId}/`);
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
    const response = await api.get(`api/current/appointments/${citizenId}/`);
    return response.data;
  },
  currentPrescriptions: async (citizenId) => {
    const response = await api.get(`api/current/prescriptions/${citizenId}/`);
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

  logUsage: async (item_id, facility_id, quantity) => {
    const response = await api.post('api/facility/usage/', { item_id, facility_id, quantity });
    return response.data;
  },

  getAllItems: async () => {
    const response = await api.get('api/all-items/');
    return response.data;
  },
  getFacilityWorkers: async (facId) => {
    const response = await api.get(`api/facility/${facId}/workers/`);
    return response.data;
  },
  getAllFacilities: async () => {
    const response = await api.get('api/all-facilities/');
    return response.data;
  },
  getPendingLabOrders: async (facId) => {
    const response = await api.get(`api/lab/${facId}/pending/`);
    return response.data;
  },
  getLabOrderDetails: async (orderId) => {
    const response = await api.get(`api/lab/order/${orderId}/`);
    return response.data;
  },
  submitLabResult: async (orderId, resultText) => {
    const response = await api.post('api/lab/result/', { result: resultText, order_id: orderId });
    return response.data;
  }
};

export const getLowStockAlerts = async (facId) => {
  const response = await api.get(`inventory/api/alerts/low-stock/${facId}/`);
  return response.data;
};

export const getNearExpiryAlerts = async (facId) => {
  const response = await api.get(`inventory/api/alerts/expiry/${facId}/`);
  return response.data;
};

export default api;