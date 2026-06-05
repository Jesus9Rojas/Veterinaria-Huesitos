package huesitos_backend.repositorios;

import huesitos_backend.entidades.Desparasitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DesparasitacionRepositorio extends JpaRepository<Desparasitacion, Long> {
    List<Desparasitacion> findByMascotaId(Long mascotaId);
    List<Desparasitacion> findByFechaProximaAplicacionBetween(LocalDate inicio, LocalDate fin);
}
