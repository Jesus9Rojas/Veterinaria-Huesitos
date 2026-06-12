package huesitos_backend.repositorios;

import huesitos_backend.entidades.Vacuna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
// import java.util.List;

@Repository
public interface VacunaRepositorio extends JpaRepository<Vacuna, Long> {
    // List<Vacuna> findByMascotaId(Long mascotaId);
}