package huesitos_backend.repositorios;

import huesitos_backend.entidades.Dueno;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DuenoRepositorio extends JpaRepository<Dueno, Long> {
    Optional<Dueno> findByUsuarioId(Long usuarioId);
    boolean existsByTelefono(String telefono);
}
