import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const listarProductosPOS = async () => {
  const response = await api.get("/productos");
  return response.data;
};

export const listarPedidos = async () => {
  const response = await api.get("/gestion-pedidos");
  return response.data;
};

export const actualizarEstadoPedido = async (id, nuevoEstado) => {
  const response = await api.patch(`/gestion-pedidos/${id}/estado`, null, {
    params: { nuevoEstado }
  });
  return response.data;
};

export const procesarVentaPOS = async (ventaData) => {
  const response = await api.post("/gestion-pedidos/mostrador", ventaData);
  return response.data;
};

export const obtenerDetallesPedido = async (id) => {
  const response = await api.get(`/gestion-pedidos/${id}/detalles`);
  return response.data;
};