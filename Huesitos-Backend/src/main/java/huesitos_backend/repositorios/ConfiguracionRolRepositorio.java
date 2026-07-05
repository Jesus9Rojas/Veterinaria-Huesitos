package huesitos_backend.repositorios;

import huesitos_backend.entidades.ConfiguracionRol;
import huesitos_backend.entidades.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConfiguracionRolRepositorio extends JpaRepository<ConfiguracionRol, Long> {
    Optional<ConfiguracionRol> findByRol(Rol rol);
}
