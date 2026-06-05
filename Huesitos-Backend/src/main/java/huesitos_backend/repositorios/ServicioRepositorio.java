package huesitos_backend.repositorios;

import huesitos_backend.entidades.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServicioRepositorio extends JpaRepository<Servicio, Long> {
    List<Servicio> findByActivoTrue();
    long countByActivoTrue();
}
