package huesitos_backend.repositorios;

import huesitos_backend.entidades.ConfiguracionRol;
import huesitos_backend.entidades.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionRolRepositorio extends JpaRepository<ConfiguracionRol, Long> {

    /**
     * Busca la configuración asociada a un rol específico.
     */
    Optional<ConfiguracionRol> findByRol(Rol rol);
}
