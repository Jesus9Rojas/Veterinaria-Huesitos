package huesitos_backend.repositorios;

import huesitos_backend.entidades.EstadoPago;
import huesitos_backend.entidades.MedioPago;
import huesitos_backend.entidades.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransaccionRepositorio extends JpaRepository<Transaccion, Long> {
    
    List<Transaccion> findAllByOrderByFechaCreacionDesc();

    @Query("SELECT COALESCE(SUM(t.monto), 0) FROM Transaccion t WHERE t.estadoPago = 'APROBADO'")
    BigDecimal sumarIngresosAprobados();

    @Query("SELECT COALESCE(SUM(t.monto), 0) FROM Transaccion t WHERE t.estadoPago = 'APROBADO' AND t.fechaActualizacion BETWEEN :inicio AND :fin")
    BigDecimal sumarIngresosPorRangoFecha(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    @Query("SELECT COALESCE(SUM(t.monto), 0) FROM Transaccion t WHERE t.estadoPago = 'APROBADO' AND t.medioPago IN :medios AND t.fechaActualizacion BETWEEN :inicio AND :fin")
    BigDecimal sumarIngresosPorMediosYFecha(@Param("medios") List<MedioPago> medios, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    // Corregido: countBy... debe coincidir con los nombres de campos de tu entidad
    long countByEstadoPagoAndFechaCreacionBetween(EstadoPago estado, LocalDateTime inicio, LocalDateTime fin);
}