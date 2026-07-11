import axios from "axios";

const API_URL = "https://veterinaria-huesitos-production.up.railway.app/api/vacunas";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const obtenerCatalogoVacunas = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

export const registrarVacunaCatalogo = async (vacunaData) => {
  const response = await axios.post(API_URL, vacunaData, getAuthHeaders());
  return response.data;
};

export const actualizarVacunaCatalogo = async (id, vacunaData) => {
  const response = await axios.put(`${API_URL}/${id}`, vacunaData, getAuthHeaders());
  return response.data;
};

export const desactivarVacuna = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

export const reactivarVacuna = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/activar`, {}, getAuthHeaders());
  return response.data;
};