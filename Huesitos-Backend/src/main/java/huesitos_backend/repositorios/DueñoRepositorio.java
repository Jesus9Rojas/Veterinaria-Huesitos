package huesitos_backend.repositorios;

import huesitos_backend.entidades.Dueño;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DueñoRepositorio extends JpaRepository<Dueño, Long> {
    Optional<Dueño> findByUsuarioId(Long usuarioId);
    boolean existsByTelefono(String telefono);
}
