import usuarioAPI from "../api/usuarioAPI";
import axios from 'axios';

export const obtenerListaUsuarios = async () => {
  const response = await usuarioAPI.get("");
  return response.data;
};

export const registrarNuevoPersonal = async (datosPersonales) => {
  const response = await usuarioAPI.post("", datosPersonales);
  return response.data;
};

export const modificarRolUsuario = async (id, nuevoRol) => {
  const response = await usuarioAPI.patch(`/${id}/rol?rol=${nuevoRol}`);
  return response.data;
};

export const modificarEstadoUsuario = async (id, nuevoEstado) => {
  const response = await usuarioAPI.patch(`/${id}/estado?activo=${nuevoEstado}`);
  return response.data;
};

export const obtenerDetallesDueno = async (usuarioId) => {
  const response = await usuarioAPI.get(`/${usuarioId}/dueno`);
  return response.data;
};

export const obtenerDetallesPersonal = async (id) => {
  const response = await usuarioAPI.get(`/${id}/personal`);
  return response.data;
};

export const actualizarPersonal = async (id, data) => {
  const response = await usuarioAPI.put(`/${id}/personal`, data);
  return response.data;
};

// NUEVAS FUNCIONES PARA RECUPERACIÓN DE CONTRASEÑA
const AUTH_API_URL = `${import.meta.env.VITE_API_URL}/autenticacion`;

export const solicitarRecuperacion = async (correo) => {
  const response = await axios.post(`${AUTH_API_URL}/olvide-contrasena`, { correo });
  return response.data;
};

export const restablecerPassword = async (token, nuevaContrasena) => {
  const response = await axios.post(`${AUTH_API_URL}/restablecer-contrasena`, { token, nuevaContrasena });
  return response.data;
};