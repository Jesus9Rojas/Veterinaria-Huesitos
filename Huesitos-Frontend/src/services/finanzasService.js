import axios from "axios";

// Apuntamos a transacciones que es donde tu backend maneja el dinero
const finanzasAPI = axios.create({
  baseURL: "http://localhost:8080/api/transacciones",
  headers: { "Content-Type": "application/json" }
});

// Inyectamos el Token JWT a TODAS las peticiones de finanzas
finanzasAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 1. Usado por el Administrador en FinanzasPage.jsx
export const obtenerReporteDiario = async (fecha) => {
  const response = await finanzasAPI.get(`/reporte?fecha=${fecha}`);
  return response.data;
};

// 2. Usado por la Recepcionista en InicioRecepcion.jsx
export const obtenerTransacciones = async () => {
  const response = await finanzasAPI.get("");
  return response.data;
};

// 3. Método auxiliar para procesar pagos (El warning ya está solucionado)
export const procesarPago = async (id, medioPago, referencia = "CAJA") => {
  const response = await finanzasAPI.patch(`/${id}/pagar`, null, {
    params: { 
      medioPago: medioPago,
      referencia: referencia // <-- AQUÍ SE USA LA VARIABLE, ADIÓS WARNING
    }
  });
  return response.data;
};