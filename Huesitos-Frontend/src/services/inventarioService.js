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

export const listarProductos = async () => {
  const response = await api.get("/productos");
  return response.data;
};

export const listarTodosProductos = async () => {
  const response = await api.get("/productos/todos");
  return response.data;
};

export const guardarProducto = async (producto) => {
  if (producto.id) {
    const response = await api.put(`/productos/${producto.id}`, producto);
    return response.data;
  } else {
    const response = await api.post("/productos", producto);
    return response.data;
  }
};

export const desactivarProducto = async (id) => {
  const response = await api.delete(`/productos/${id}`);
  return response.data;
};

export const activarProducto = async (id) => {
  const response = await api.put(`/productos/${id}/activar`);
  return response.data;
};

export const listarCategorias = async () => {
  const response = await api.get("/categorias");
  return response.data;
};

export const crearCategoria = async (categoria) => {
  const response = await api.post("/categorias", categoria);
  return response.data;
};

export const ingresarLoteInventario = async (inventarioData) => {
  const response = await api.post("/inventarios", inventarioData);
  return response.data;
};