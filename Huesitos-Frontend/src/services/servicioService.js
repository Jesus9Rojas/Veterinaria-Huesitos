import servicioAPI from "../api/servicioAPI";

export const listarServicios = async () => {
  const response = await servicioAPI.get(""); 
  return response.data;
};

export const crearServicio = async (data) => {
  const response = await servicioAPI.post("", data); 
  return response.data;
};

export const actualizarServicio = async (id, data) => {
  const response = await servicioAPI.put(`/${id}`, data);
  return response.data;
};

export const cambiarEstadoServicio = async (id, activo) => {
  const response = await servicioAPI.patch(`/${id}/estado?activo=${activo}`);
  return response.data;
};