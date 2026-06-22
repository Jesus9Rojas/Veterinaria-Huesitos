import { useEffect, useState } from "react";
import { listarServicios } from "../services/servicioService";

export const useServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  const obtenerServicios = () => {
    setLoading(true);
    listarServicios()
      .then((data) => {
        setServicios(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al actualizar servicios:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    listarServicios()
      .then((data) => {
        setServicios(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error en la carga inicial:", error);
        setLoading(false);
      });
  }, []);

  return {
    servicios,
    loading,
    obtenerServicios,
  };
};