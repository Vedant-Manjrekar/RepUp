import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true, // Important for CORS
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
