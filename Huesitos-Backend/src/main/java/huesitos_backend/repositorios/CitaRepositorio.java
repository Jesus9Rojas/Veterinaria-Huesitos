package huesitos_backend.repositorios;

import huesitos_backend.entidades.Cita;
import huesitos_backend.entidades.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List; 

@Repository
public interface CitaRepositorio extends JpaRepository<Cita, Long> {

    List<Cita> findByVeterinarioIdAndFechaHoraBetween(Long veterinarioId, LocalDateTime inicio, LocalDateTime fin);

    List<Cita> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    boolean existsByVeterinarioIdAndFechaHoraAndEstadoNot(Long veterinarioId, LocalDateTime fechaHora, EstadoCita estado);

    boolean existsByVeterinarioIdAndFechaHoraAndEstadoNotAndIdNot(Long veterinarioId, LocalDateTime fechaHora, EstadoCita estado, Long id);

    @Query("SELECT c FROM Cita c WHERE (:inicio IS NULL OR c.fechaHora >= :inicio) " +
           "AND (:fin IS NULL OR c.fechaHora <= :fin) " +
           "AND (:veterinarioId IS NULL OR c.veterinario.id = :veterinarioId) " +
           "AND (:estado IS NULL OR c.estado = :estado)")
    List<Cita> buscarCitasConFiltros(@Param("inicio") LocalDateTime inicio, 
                                     @Param("fin") LocalDateTime fin, 
                                     @Param("veterinarioId") Long veterinarioId, 
                                     @Param("estado") EstadoCita estado);

    @Query("SELECT c FROM Cita c WHERE c.fechaHora <= :limite AND c.estado IN :estados")
    List<Cita> buscarCitasExpiradas(@Param("limite") LocalDateTime limite, @Param("estados") List<EstadoCita> estados);

    List<Cita> findByMascotaDueñoIdOrderByFechaHoraDesc(Long duenoId);
}