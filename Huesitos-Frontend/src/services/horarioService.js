import axios from 'axios';

const API_BASE = "http://localhost:8080/api/horarios";

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

// Modificado para recibir el usuarioId en el path y el cuerpo de datos del formulario
export const crearHorario = async (usuarioId, horarioData) => {
  const response = await axios.post(`${API_BASE}/usuario/${usuarioId}`, horarioData, getHeaders());
  return response.data;
};

export const eliminarHorario = async (id) => {
  const response = await axios.delete(`${API_BASE}/${id}`, getHeaders());
  return response.data;
};