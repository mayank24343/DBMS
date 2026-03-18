import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const getMedicalHistory = async (aadharNo) => {
    try {
        // This hits the endpoint we just tested! [cite: 40]
        const response = await axios.get(`${API_BASE_URL}/history/${aadharNo}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching history:", error);
        throw error;
    }
};

export const getInventoryAlerts = async (facId) => {
    try {
        // This handles Query #8 (Low Stock) [cite: 47]
        const response = await axios.get(`${API_BASE_URL}/alerts/low-stock/${facId}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching alerts:", error);
        throw error;
    }
};

export const getDiseaseTrends = async (diseaseId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/stats/disease/${diseaseId}/trends/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching disease trends:", error);
        return []; // Return empty array so the UI doesn't crash on error
    }
};

export const getVisitDetails = async (visitId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/visit/${visitId}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching visit details:", error);
        throw error;
    }
};

export const getBedAvailability = async (facId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/wards/${facId}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching bed availability:", error);
        return [];
    }
};

export const getLowStockAlerts = async (facId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/alerts/low-stock/${facId}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching low stock alerts:", error);
        return [];
    }
};

export const getNearExpiryAlerts = async (facId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/alerts/expiry/${facId}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching expiry alerts:", error);
        return [];
    }
};

export const createNewVisit = async (visitData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/visit/new/`, visitData);
        return response.data;
    } catch (error) {
        console.error("Error creating visit:", error.response?.data || error);
        throw error.response?.data?.error || "Failed to create visit";
    }
};

export const bookCitizenAppointment = async (appointmentData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/appointments/book/`, appointmentData);
        return response.data;
    } catch (error) {
        console.error("Error booking appointment:", error.response?.data || error);
        throw error.response?.data?.error || "Failed to book appointment";
    }
};

export const searchHealthDirectory = async (searchType, searchQuery) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/directory/search/`, {
            params: { type: searchType, query: searchQuery }
        });
        return response.data;
    } catch (error) {
        console.error("Error searching directory:", error);
        return [];
    }
};