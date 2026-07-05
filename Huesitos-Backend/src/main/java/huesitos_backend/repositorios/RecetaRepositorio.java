package huesitos_backend.repositorios;

import huesitos_backend.entidades.Receta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RecetaRepositorio extends JpaRepository<Receta, Long> {
    Optional<Receta> findByConsultaMedicaId(Long consultaId);
    
    List<Receta> findByConsultaMedicaMascotaId(Long mascotaId);
}