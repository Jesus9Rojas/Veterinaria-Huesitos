import axios from "axios";

const API_URL = "http://localhost:8080/api/medicinas";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const obtenerCatalogoMedicinas = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

export const registrarMedicina = async (medicinaData) => {
  const response = await axios.post(API_URL, medicinaData, getAuthHeaders());
  return response.data;
};

export const actualizarMedicina = async (id, medicinaData) => {
  const response = await axios.put(`${API_URL}/${id}`, medicinaData, getAuthHeaders());
  return response.data;
};

export const desactivarMedicina = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

export const reactivarMedicina = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/activar`, {}, getAuthHeaders());
  return response.data;
};