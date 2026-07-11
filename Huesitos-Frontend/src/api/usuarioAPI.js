import axios from "axios";

const usuarioAPI = axios.create({
  baseURL: "https://veterinaria-huesitos-production.up.railway.app/api/usuarios",
  headers: {
    "Content-Type": "application/json",
  },
});

usuarioAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default usuarioAPI;