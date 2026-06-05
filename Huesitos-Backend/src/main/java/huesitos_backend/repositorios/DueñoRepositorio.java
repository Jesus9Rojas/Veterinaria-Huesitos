package huesitos_backend.repositorios;

import huesitos_backend.entidades.Dueño;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DueñoRepositorio extends JpaRepository<Dueño, Long> {
    // Busca los datos de contacto utilizando la relación con el Usuario
    Optional<Dueño> findByUsuarioId(Long usuarioId);
    boolean existsByTelefono(String telefono);
}
