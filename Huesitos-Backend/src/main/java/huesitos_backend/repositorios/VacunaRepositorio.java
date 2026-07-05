package huesitos_backend.repositorios;

import huesitos_backend.entidades.Vacuna;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VacunaRepositorio extends JpaRepository<Vacuna, Long> {
}