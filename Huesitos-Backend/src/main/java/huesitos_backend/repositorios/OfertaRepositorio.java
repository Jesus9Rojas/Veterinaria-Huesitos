package huesitos_backend.repositorios;

import huesitos_backend.entidades.Oferta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface OfertaRepositorio extends JpaRepository<Oferta, Long> {
    List<Oferta> findByActivoTrue();
    List<Oferta> findByActivoTrueAndFechaFinBefore(LocalDate fecha);
}
