import axios from "axios";

const API_URL = "http://localhost:8080/api/citas";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const crearCita = async (citaData) => {
  const response = await axios.post(API_URL, citaData, getAuthHeaders());
  return response.data;
};

export const obtenerCitasPorDia = async (fecha) => {
  const response = await axios.get(`${API_URL}/calendario?fecha=${fecha}`, getAuthHeaders());
  return response.data;
};

export const cambiarEstadoCita = async (id, estado) => {
  const response = await axios.patch(`${API_URL}/${id}/estado?nuevoEstado=${estado}`, {}, getAuthHeaders());
  return response.data;
};

export const cancelarCita = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/cancelar`, {}, getAuthHeaders());
  return response.data;
};

export const checkInCita = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/check-in`, {}, getAuthHeaders());
  return response.data;
};

export const reprogramarCita = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}/reprogramar`, data, getAuthHeaders());
  return response.data;
};

export const obtenerCitasHoy = async () => {
  const response = await axios.get(`${API_URL}/hoy`, getAuthHeaders());
  return response.data;
};

export const recetarItemsCita = async (citaId, itemsArray) => {
  const response = await axios.post(`${API_URL}/${citaId}/recetar-items`, itemsArray, getAuthHeaders());
  return response.data;
};