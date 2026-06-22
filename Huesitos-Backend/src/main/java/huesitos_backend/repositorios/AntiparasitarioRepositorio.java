package huesitos_backend.repositorios;

import huesitos_backend.entidades.Antiparasitario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AntiparasitarioRepositorio extends JpaRepository<Antiparasitario, Long> {
}