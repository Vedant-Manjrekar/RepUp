import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://repup-at24.onrender.com/api',
  withCredentials: true, // Important for CORS
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
