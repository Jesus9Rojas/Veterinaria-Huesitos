import { useEffect, useState } from "react";
import { listarServicios } from "../services/servicioService";

export const useServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Esta función la usarán tus botones para refrescar la tabla
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

  // El useEffect maneja la primera carga de la página.
  // Al usar .then(), React sabe que es asíncrono y desaparece la pantalla roja/error.
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