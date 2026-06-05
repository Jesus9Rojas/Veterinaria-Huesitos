import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/citas",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar el token en todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const obtenerCitasPorDia = async (fecha) => {
  // Petición exacta buscando /calendario
  const res = await api.get(`/calendario?fecha=${fecha}`);
  return res.data;
};

export const crearCita = async (citaData) => {
  const res = await api.post("", citaData);
  return res.data;
};

export const cambiarEstadoCita = async (id, nuevoEstado) => {
  const res = await api.patch(`/${id}/estado`, null, {
    params: { nuevoEstado },
  });
  return res.data;
};