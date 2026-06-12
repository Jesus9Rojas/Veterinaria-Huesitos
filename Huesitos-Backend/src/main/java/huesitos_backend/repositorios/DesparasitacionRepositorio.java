package huesitos_backend.repositorios;

import huesitos_backend.entidades.Desparasitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DesparasitacionRepositorio extends JpaRepository<Desparasitacion, Long> {
    
    // CORRECCIÓN: La ruta es mascota.id
    List<Desparasitacion> findByMascotaId(Long mascotaId);

    // Para la Tarea Programada
    List<Desparasitacion> findByFechaProximaAplicacionBetween(LocalDate inicio, LocalDate fin);
}