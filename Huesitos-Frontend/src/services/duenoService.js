import axios from "axios";

const duenosAPI = axios.create({
  baseURL: "http://localhost:8080/api/duenos",
  headers: {
    "Content-Type": "application/json",
  },
});

duenosAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const obtenerListaDuenos = async () => {
  const response = await duenosAPI.get("");
  return response.data;
};

export const crearNuevoDueno = async (datos) => {
  const response = await duenosAPI.post("", datos);
  return response.data;
};

export const actualizarDuenoExistente = async (id, datos) => {
  const response = await duenosAPI.put(`/${id}`, datos);
  return response.data;
};