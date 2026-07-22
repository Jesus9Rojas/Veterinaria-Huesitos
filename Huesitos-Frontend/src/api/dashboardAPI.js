import axios from "axios";

const dashboardAPI = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/dashboard`,
  headers: { "Content-Type": "application/json" },
});

dashboardAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default dashboardAPI;