package huesitos_backend.repositorios;

import huesitos_backend.entidades.HistorialVacunacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface HistorialVacunacionRepositorio extends JpaRepository<HistorialVacunacion, Long> {
    List<HistorialVacunacion> findByMascotaIdOrderByFechaAplicacionDesc(Long mascotaId);

    List<HistorialVacunacion> findByFechaProximaDosisBetween(LocalDate inicio, LocalDate fin);
}