package huesitos_backend.repositorios;

import huesitos_backend.entidades.ArchivoClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArchivoClinicoRepositorio extends JpaRepository<ArchivoClinico, Long> {

    /**
     * Busca los archivos clínicos asociados a una mascota ordenados por fecha de subida descendente.
     */
    List<ArchivoClinico> findByMascotaIdOrderByFechaSubidaDesc(Long mascotaId);
}
