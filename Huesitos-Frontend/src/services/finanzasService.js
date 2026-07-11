import axios from "axios";

const finanzasAPI = axios.create({
  baseURL: "https://veterinaria-huesitos-production.up.railway.app/api/transacciones",
  headers: { "Content-Type": "application/json" }
});

finanzasAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const obtenerReporteDiario = async (fecha) => {
  const response = await finanzasAPI.get(`/reporte?fecha=${fecha}`);
  return response.data;
};

export const obtenerTransacciones = async () => {
  const response = await finanzasAPI.get("");
  return response.data;
};

export const procesarPago = async (id, medioPago, referencia = "CAJA") => {
  const response = await finanzasAPI.patch(`/${id}/pagar`, null, {
    params: { 
      medioPago: medioPago,
      referencia: referencia 
    }
  });
  return response.data;
};