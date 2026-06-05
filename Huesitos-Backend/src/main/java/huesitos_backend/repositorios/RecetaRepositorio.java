package huesitos_backend.repositorios;

import huesitos_backend.entidades.Receta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RecetaRepositorio extends JpaRepository<Receta, Long> {

    /**
     * Busca la receta asociada a una consulta médica específica.
     */
    Optional<Receta> findByConsultaMedicaId(Long consultaMedicaId);
}
