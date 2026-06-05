package huesitos_backend.repositorios;

import huesitos_backend.entidades.ConfiguracionNegocio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfiguracionNegocioRepositorio extends JpaRepository<ConfiguracionNegocio, Long> {
}