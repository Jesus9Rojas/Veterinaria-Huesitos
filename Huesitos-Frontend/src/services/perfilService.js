import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL}/perfiles`;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  };
};

export const obtenerPerfilUsuario = async (usuarioId) => {
  const response = await axios.get(`${API_BASE}/usuario/${usuarioId}`, getHeaders());
  return response.data;
};

export const cambiarContrasena = async (usuarioId, nuevaContrasena) => {
  const response = await axios.patch(
    `${API_BASE}/usuario/${usuarioId}/contrasena`, 
    { nuevaContrasena }, 
    getHeaders()
  );
  return response.data;
};

export const subirFotoPerfil = async (usuarioId, file) => {
  const formData = new FormData();
  formData.append("archivo", file);

  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_BASE}/usuario/${usuarioId}/foto`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};