import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const authAPI = {
  login: (data) => axios.post(`${API_BASE_URL}/auth/login`, data),
  signup: (data) => axios.post(`${API_BASE_URL}/auth/signup`, data),
  verify: (data) => axios.post(`${API_BASE_URL}/auth/verify`, data),
};

export const reportsAPI = {
  create: (data) => axios.post(`${API_BASE_URL}/reports/create`, data),
  getPrioritized: () => axios.get(`${API_BASE_URL}/reports/prioritized`),
  classify: (id, data) => axios.put(`${API_BASE_URL}/reports/${id}/classify`, data),
  getFinal: () => axios.get(`${API_BASE_URL}/reports/final`),
};