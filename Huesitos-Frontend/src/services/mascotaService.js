import axios from "axios";

const mascotaAPI = axios.create({
  baseURL: "http://localhost:8080/api/mascotas",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar automáticamente el Token en todas las peticiones
mascotaAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const obtenerMascotasPorDueno = async (duenoId) => {
  const response = await mascotaAPI.get(`/dueno/${duenoId}`);
  return response.data;
};

export const crearMascota = async (mascotaData) => {
  const response = await mascotaAPI.post("", mascotaData);
  return response.data;
};

// Se optimizó para usar la misma instancia de mascotaAPI
export const listarTodasMascotas = async () => {
  const response = await mascotaAPI.get("");
  return response.data;
};

export const obtenerMascotaPorId = async (id) => {
  const response = await mascotaAPI.get(`/${id}`);
  return response.data;
};