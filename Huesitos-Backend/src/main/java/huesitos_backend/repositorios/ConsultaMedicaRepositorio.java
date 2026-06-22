package huesitos_backend.repositorios;

import huesitos_backend.entidades.ConsultaMedica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConsultaMedicaRepositorio extends JpaRepository<ConsultaMedica, Long> {
    List<ConsultaMedica> findByMascotaIdOrderByFechaDesc(Long mascotaId);
}