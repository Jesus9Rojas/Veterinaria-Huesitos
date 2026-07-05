package huesitos_backend.repositorios;

import huesitos_backend.entidades.ConfiguracionNegocio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfiguracionNegocioRepositorio extends JpaRepository<ConfiguracionNegocio, Long> {
}