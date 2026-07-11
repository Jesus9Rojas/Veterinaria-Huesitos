import axios from "axios";

const dashboardAPI = axios.create({
  baseURL: "https://veterinaria-huesitos-production.up.railway.app/api/dashboard",
  headers: { "Content-Type": "application/json" },
});

dashboardAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default dashboardAPI;