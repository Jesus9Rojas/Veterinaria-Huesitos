import usuarioAPI from "../api/usuarioAPI";

export const obtenerListaUsuarios = async () => {
  const response = await usuarioAPI.get("");
  return response.data;
};

// NUEVA FUNCIÓN AÑADIDA
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

export const obtenerDetallesDueño = async (usuarioId) => {
  const response = await usuarioAPI.get(`/${usuarioId}/dueño`);
  return response.data;
};

export const actualizarCredencialesUsuario = async (usuarioId, datos) => {
  const response = await usuarioAPI.patch(`/${usuarioId}/credenciales`, datos);
  return response.data;
};