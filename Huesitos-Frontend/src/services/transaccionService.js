import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/transacciones`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const listarTransacciones = async () => {
  const response = await api.get("");
  return response.data;
};

export const procesarPagoTransaccion = async (id, medioPago) => {
  const response = await api.patch(`/${id}/pagar`, null, {
     params: { medioPago }
   });
  return response.data;
};

export const descargarComprobanteSeguro = async (id, tipo = 'BOLETA') => {
  const response = await api.get(`/${id}/comprobante`, {
    params: { tipo },
    responseType: 'blob' 
  });
  return response.data;
};