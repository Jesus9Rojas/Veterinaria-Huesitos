package huesitos_backend.repositorios;

import huesitos_backend.entidades.Medicina;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicinaRepositorio extends JpaRepository<Medicina, Long> {
}