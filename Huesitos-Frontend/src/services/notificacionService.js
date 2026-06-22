import axios from "axios";

const API_URL = "http://localhost:8080/api/notificaciones";

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

export const obtenerNotificaciones = async (usuarioId) => {
  const response = await axios.get(`${API_URL}/usuario/${usuarioId}`, getAuthHeaders());
  return response.data;
};

export const marcarNotificacionLeida = async (id) => {
  const response = await axios.patch(`${API_URL}/${id}/leer`, {}, getAuthHeaders());
  return response.data;
};

export const eliminarNotificacion = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

export const limpiarTodasNotificaciones = async (usuarioId) => {
  const response = await axios.delete(`${API_URL}/usuario/${usuarioId}/todas`, getAuthHeaders());
  return response.data;
};