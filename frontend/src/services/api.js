import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle auth errors
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

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const formsAPI = {
  getUserForms: (userId) => api.get(`/forms/user/${userId}`),
  createForm: (formData) => api.post('/forms/create', formData),
  getForm: (formId) => api.get(`/forms/${formId}`),
  updateForm: (formId, formData) => api.put(`/forms/${formId}`, formData),
  deleteForm: (formId) => api.delete(`/forms/${formId}`),
  getStats: (userId) => api.get(`/forms/user/${userId}/stats`),
};

export const responsesAPI = {
  submitResponse: (formId, responseData) => api.post(`/responses/${formId}/submit`, responseData),
  getFormResponses: (formId) => api.get(`/responses/form/${formId}`),
  deleteResponse: (responseId) => api.delete(`/responses/${responseId}`),
  exportResponses: (formId, format = 'json') => api.get(`/responses/export/${formId}?format=${format}`),
};

export default api;