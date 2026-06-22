import axios from "axios";

const API_URL = "http://localhost:8080/api";

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" }
});

export const guardarConsultaMedica = async (data) => {
  const res = await axios.post(`${API_URL}/consultas-medicas`, data, getAuthHeaders());
  return res.data;
};
export const obtenerConsultasMascota = async (mascotaId) => {
  const res = await axios.get(`${API_URL}/consultas-medicas/mascota/${mascotaId}`, getAuthHeaders());
  return res.data;
};

export const aplicarVacuna = async (mascotaId, citaId, data) => {
  const res = await axios.post(`${API_URL}/historial-clinico/mascota/${mascotaId}/cita/${citaId}/vacuna`, data, getAuthHeaders());
  return res.data;
};
export const obtenerHistorialVacunas = async (mascotaId) => {
  const res = await axios.get(`${API_URL}/vacunas/mascota/${mascotaId}`, getAuthHeaders());
  return res.data;
};
export const aplicarDesparasitacion = async (mascotaId, citaId, data) => {
  const res = await axios.post(`${API_URL}/historial-clinico/mascota/${mascotaId}/cita/${citaId}/desparasitacion`, data, getAuthHeaders());
  return res.data;
};
export const obtenerHistorialAnti = async (mascotaId) => {
  const res = await axios.get(`${API_URL}/desparasitaciones/mascota/${mascotaId}`, getAuthHeaders());
  return res.data;
};

export const recetarMedicinasYCobrar = async (citaId, itemsArray) => {
  const res = await axios.post(`${API_URL}/citas/${citaId}/recetar-items`, itemsArray, getAuthHeaders());
  return res.data;
};
export const emitirRecetaPdf = async (consultaId, data) => {
  const res = await axios.post(`${API_URL}/historial-clinico/consulta/${consultaId}/receta`, data, getAuthHeaders());
  return res.data;
};
export const obtenerRecetasMascota = async (mascotaId) => {
  const res = await axios.get(`${API_URL}/recetas/mascota/${mascotaId}`, getAuthHeaders());
  return res.data;
};