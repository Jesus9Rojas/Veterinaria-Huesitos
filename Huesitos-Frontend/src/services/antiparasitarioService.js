import axios from "axios";

const API_URL = "https://veterinaria-huesitos-production.up.railway.app/api/antiparasitarios";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const obtenerCatalogoAntiparasitarios = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

export const registrarAntiparasitario = async (data) => {
  const response = await axios.post(API_URL, data, getAuthHeaders());
  return response.data;
};

export const actualizarAntiparasitario = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
  return response.data;
};

export const desactivarAntiparasitario = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

export const reactivarAntiparasitario = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/activar`, {}, getAuthHeaders());
  return response.data;
};