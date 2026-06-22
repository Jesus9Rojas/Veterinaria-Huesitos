package huesitos_backend.repositorios;

import huesitos_backend.entidades.ArchivoClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArchivoClinicoRepositorio extends JpaRepository<ArchivoClinico, Long> {

    List<ArchivoClinico> findByMascotaIdOrderByFechaSubidaDesc(Long mascotaId);
}
