package huesitos_backend.repositorios;

import huesitos_backend.entidades.ConsultaMedica;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConsultaMedicaRepositorio extends JpaRepository<ConsultaMedica, Long> {
    List<ConsultaMedica> findByMascotaIdOrderByFechaDesc(Long mascotaId);
}