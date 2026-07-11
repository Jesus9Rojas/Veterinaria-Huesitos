import axios from 'axios';

const API_BASE = "https://veterinaria-huesitos-production.up.railway.app/api/horarios";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  };
};

export const listarHorariosPorUsuario = async (usuarioId) => {
  const response = await axios.get(`${API_BASE}/usuario/${usuarioId}`, getHeaders());
  return response.data;
};

export const crearHorario = async (usuarioId, horarioData) => {
  const response = await axios.post(`${API_BASE}/usuario/${usuarioId}`, horarioData, getHeaders());
  return response.data;
};

export const eliminarHorario = async (id) => {
  const response = await axios.delete(`${API_BASE}/${id}`, getHeaders());
  return response.data;
};