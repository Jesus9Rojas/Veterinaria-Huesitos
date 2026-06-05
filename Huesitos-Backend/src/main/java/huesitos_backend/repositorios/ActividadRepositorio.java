package huesitos_backend.repositorios;

import huesitos_backend.entidades.Actividad;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActividadRepositorio extends JpaRepository<Actividad, Long> {
    // Obtiene las últimas 5 actividades ordenadas por fecha descendente
    List<Actividad> findTop5ByOrderByFechaDesc();
}