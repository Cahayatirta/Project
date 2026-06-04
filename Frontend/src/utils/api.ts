import axios from "axios";

const baseURL =
  import.meta.env.VITE_MODE == 'production' ? import.meta.env.VITE_PRODUCTION_API : import.meta.env.VITE_DEVELOPMENT_API;

const api = axios.create({
  baseURL: `${baseURL ?? 'http://localhost:5001'}/api`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
