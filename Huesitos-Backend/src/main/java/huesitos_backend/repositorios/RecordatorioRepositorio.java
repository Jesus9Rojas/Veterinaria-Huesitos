package huesitos_backend.repositorios;

import huesitos_backend.entidades.Recordatorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecordatorioRepositorio extends JpaRepository<Recordatorio, Long> {
    List<Recordatorio> findByMascotaId(Long mascotaId);
    List<Recordatorio> findByMascotaDueñoUsuarioId(Long usuarioId);
    boolean existsByMascotaIdAndFechaRecordatorioAndTitulo(Long mascotaId, LocalDate fechaRecordatorio, String titulo);
}
