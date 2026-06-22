import axios from 'axios';

const API_BASE = "http://localhost:8080/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  };
};

export const listarConsultasPorMascota = async (mascotaId) => {
  const response = await axios.get(`${API_BASE}/consultas-medicas/mascota/${mascotaId}`, getHeaders());
  return response.data;
};

export const registrarConsultaMedica = async (consultaData) => {
  const response = await axios.post(`${API_BASE}/consultas-medicas`, consultaData, getHeaders());
  return response.data;
};

export const listarRecetasPorMascota = async (mascotaId) => {
  const response = await axios.get(`${API_BASE}/recetas/mascota/${mascotaId}`, getHeaders());
  return response.data;
};

export const registrarReceta = async (recetaData) => {
  const response = await axios.post(`${API_BASE}/recetas`, recetaData, getHeaders());
  return response.data;
};

export const listarVacunasPorMascota = async (mascotaId) => {
  const response = await axios.get(`${API_BASE}/vacunas/mascota/${mascotaId}`, getHeaders());
  return response.data;
};

export const registrarVacuna = async (vacunaData) => {
  const response = await axios.post(`${API_BASE}/vacunas/aplicar`, vacunaData, getHeaders());
  return response.data;
};

export const listarDesparasitacionesPorMascota = async (mascotaId) => {
  const response = await axios.get(`${API_BASE}/desparasitaciones/mascota/${mascotaId}`, getHeaders());
  return response.data;
};

export const registrarDesparasitacion = async (desparasitacionData) => {
  const response = await axios.post(`${API_BASE}/desparasitaciones`, desparasitacionData, getHeaders());
  return response.data;
};

export const listarArchivosPorMascota = async (mascotaId) => {
  const response = await axios.get(`${API_BASE}/archivos-clinicos/mascota/${mascotaId}`, getHeaders());
  return response.data;
};

export const registrarArchivoClinico = async (archivoData) => {
  const response = await axios.post(`${API_BASE}/archivos-clinicos`, archivoData, getHeaders());
  return response.data;
};