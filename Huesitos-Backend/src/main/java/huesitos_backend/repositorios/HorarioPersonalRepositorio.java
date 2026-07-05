package huesitos_backend.repositorios;

import huesitos_backend.entidades.HorarioPersonal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface HorarioPersonalRepositorio extends JpaRepository<HorarioPersonal, Long> {
    List<HorarioPersonal> findByUsuarioId(Long usuarioId);

    Optional<HorarioPersonal> findByUsuarioIdAndDiaSemana(Long usuarioId, DayOfWeek diaSemana);
}
