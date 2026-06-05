package huesitos_backend.repositorios;

import huesitos_backend.entidades.Campana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CampanaRepositorio extends JpaRepository<Campana, Long> {
    List<Campana> findByActivoTrue();
    List<Campana> findByActivoTrueAndFechaFinBefore(LocalDate fecha);
}
