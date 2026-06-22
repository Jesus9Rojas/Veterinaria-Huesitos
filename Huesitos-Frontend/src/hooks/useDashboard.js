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
  }, []); 

  return { 
    stats, 
    loading, 
    refetch: cargarDatosDashboard 
  };
};