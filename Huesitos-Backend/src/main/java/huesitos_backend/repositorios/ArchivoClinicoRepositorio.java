package huesitos_backend.repositorios;

import huesitos_backend.entidades.ArchivoClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ArchivoClinicoRepositorio extends JpaRepository<ArchivoClinico, Long> {

    List<ArchivoClinico> findByMascotaIdOrderByFechaSubidaDesc(Long mascotaId);
}
