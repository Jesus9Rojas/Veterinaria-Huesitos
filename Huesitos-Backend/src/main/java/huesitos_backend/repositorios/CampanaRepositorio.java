package huesitos_backend.repositorios;

import huesitos_backend.entidades.Campana;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface CampanaRepositorio extends JpaRepository<Campana, Long> {
    List<Campana> findByActivoTrue();
    List<Campana> findByActivoTrueAndFechaFinBefore(LocalDate fecha);
}
