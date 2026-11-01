// Axios API client with automatic JWT token insertion
import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
rawBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const baseURL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const API = axios.create({
  baseURL
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
