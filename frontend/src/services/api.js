// Axios API client with automatic JWT token insertion
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

// Interceptor to attach JWT authorization token to every outgoing request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('phc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
