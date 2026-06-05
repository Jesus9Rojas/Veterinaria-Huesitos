import axios from "axios";

const servicioAPI = axios.create({
  baseURL: "http://localhost:8080/api/servicios",
  headers: {
    "Content-Type": "application/json",
  },
});

// Inyectar el Token JWT en cada petición automáticamente
servicioAPI.interceptors.request.use(
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

export default servicioAPI;