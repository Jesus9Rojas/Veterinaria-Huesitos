package huesitos_backend.repositorios;

import huesitos_backend.entidades.Personal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonalRepositorio extends JpaRepository<Personal, Long> {
    Optional<Personal> findByUsuarioId(Long usuarioId);
}