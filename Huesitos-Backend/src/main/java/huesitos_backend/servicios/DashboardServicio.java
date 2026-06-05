package huesitos_backend.servicios;

import huesitos_backend.dto.DashboardDTO;
import huesitos_backend.repositorios.ActividadRepositorio;
import huesitos_backend.repositorios.ServicioRepositorio;
import huesitos_backend.repositorios.TransaccionRepositorio;
import huesitos_backend.repositorios.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServicio {

    private final ServicioRepositorio servicioRepo;
    private final UsuarioRepositorio usuarioRepo;
    private final TransaccionRepositorio transaccionRepo;
    private final ActividadRepositorio actividadRepo;

    public DashboardDTO obtenerEstadisticas() {
        DashboardDTO dto = new DashboardDTO();
        
        // Extraemos datos reales de la Base de Datos
        dto.setTotalServicios(servicioRepo.count());
        dto.setServiciosActivos(servicioRepo.countByActivoTrue());
        dto.setTotalUsuarios(usuarioRepo.count());
        dto.setIngresosTotales(transaccionRepo.sumarIngresosAprobados());
        dto.setActividades(actividadRepo.findTop5ByOrderByFechaDesc());

        return dto;
    }
}