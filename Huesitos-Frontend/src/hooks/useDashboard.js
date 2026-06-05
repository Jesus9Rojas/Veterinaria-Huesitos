import { useEffect, useState } from "react";
import dashboardAPI from "../api/dashboardAPI";

export const useDashboard = () => {
  const [stats, setStats] = useState({
    totalServicios: 0,
    serviciosActivos: 0,
    totalUsuarios: 0,
    ingresosTotales: 0,
    actividades: []
  });
  const [loading, setLoading] = useState(true);

  // Creamos una función auxiliar para el botón de refrescar manual (🔄)
  const cargarDatosDashboard = () => {
    setLoading(true);
    dashboardAPI.get("/resumen")
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al refrescar el dashboard:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    // Al declarar la función de carga inicial aquí adentro,
    // React ya no pide ninguna dependencia externa. ¡Cero advertencias!
    const fetchInicial = () => {
      setLoading(true);
      dashboardAPI.get("/resumen")
        .then((res) => {
          setStats(res.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error al cargar el dashboard inicial:", error);
          setLoading(false);
        });
    };

    fetchInicial();
  }, []); // El arreglo vacío está perfecto aquí porque solo se ejecuta al montar el componente

  return { 
    stats, 
    loading, 
    refetch: cargarDatosDashboard 
  };
};