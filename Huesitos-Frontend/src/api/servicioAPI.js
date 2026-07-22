import axios from "axios";

const servicioAPI = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/servicios`,
  headers: {
    "Content-Type": "application/json",
  },
});

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