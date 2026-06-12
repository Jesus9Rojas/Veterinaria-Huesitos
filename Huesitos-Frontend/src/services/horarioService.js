import axios from 'axios';

// Usamos la base de la API general
const API_BASE = "http://localhost:8080/api";

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
  // ¡AQUÍ ESTÁ LA MAGIA! 
  // Apuntamos exactamente a la ruta que configuraste en tu HorarioPersonalControlador.java
  const response = await axios.get(`${API_BASE}/usuarios/${usuarioId}/horarios`, getHeaders());
  return response.data;
};  