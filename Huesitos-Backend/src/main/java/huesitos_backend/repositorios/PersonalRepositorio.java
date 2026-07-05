package huesitos_backend.repositorios;

import huesitos_backend.entidades.Personal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PersonalRepositorio extends JpaRepository<Personal, Long> {
    Optional<Personal> findByUsuarioId(Long usuarioId);
}