package huesitos_backend.repositorios;

import huesitos_backend.entidades.Medicina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicinaRepositorio extends JpaRepository<Medicina, Long> {
}