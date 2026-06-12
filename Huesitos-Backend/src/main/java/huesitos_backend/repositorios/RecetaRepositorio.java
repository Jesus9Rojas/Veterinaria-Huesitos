package huesitos_backend.repositorios;

import huesitos_backend.entidades.Receta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecetaRepositorio extends JpaRepository<Receta, Long> {
    
    // Tu método original para buscar receta de una consulta específica
    Optional<Receta> findByConsultaMedicaId(Long consultaId);
    
    // ¡CORREGIDO! Busca navegando de Receta -> ConsultaMedica -> Mascota
    List<Receta> findByConsultaMedicaMascotaId(Long mascotaId);
}