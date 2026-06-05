package huesitos_backend.servicios;

import huesitos_backend.dto.ReporteFinanciero;
import huesitos_backend.entidades.Cita;
import huesitos_backend.entidades.EstadoPago;
import huesitos_backend.entidades.MedioPago;
import huesitos_backend.entidades.Transaccion;
import huesitos_backend.repositorios.TransaccionRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransaccionServicio {

    private final TransaccionRepositorio transaccionRepositorio;

    @Transactional(readOnly = true)
    public List<Transaccion> listarTodas() {
        return transaccionRepositorio.findAllByOrderByFechaCreacionDesc();
    }

    @Transactional(readOnly = true)
    public ReporteFinanciero generarReporteDiario(LocalDate fecha) {
        LocalDateTime inicioDia = fecha.atStartOfDay();
        LocalDateTime finDia = fecha.atTime(LocalTime.MAX);

        BigDecimal total = transaccionRepositorio.sumarIngresosPorRangoFecha(inicioDia, finDia);
        
        BigDecimal efectivo = transaccionRepositorio.sumarIngresosPorMediosYFecha(
            Arrays.asList(MedioPago.EFECTIVO), inicioDia, finDia);
            
        BigDecimal tarjetas = transaccionRepositorio.sumarIngresosPorMediosYFecha(
            Arrays.asList(MedioPago.TARJETA_CREDITO, MedioPago.TARJETA_DEBITO), inicioDia, finDia);
            
        BigDecimal transferencia = transaccionRepositorio.sumarIngresosPorMediosYFecha(
            Arrays.asList(MedioPago.TRANSFERENCIA, MedioPago.YAPE, MedioPago.PLIN), inicioDia, finDia);

        long completadas = transaccionRepositorio.countByEstadoPagoAndFechaCreacionBetween(EstadoPago.APROBADO, inicioDia, finDia);
        long pendientes = transaccionRepositorio.countByEstadoPagoAndFechaCreacionBetween(EstadoPago.PENDIENTE, inicioDia, finDia);

        ReporteFinanciero reporte = new ReporteFinanciero();
        reporte.setTotalIngresos(total != null ? total : BigDecimal.ZERO);
        reporte.setIngresosEfectivo(efectivo != null ? efectivo : BigDecimal.ZERO);
        reporte.setIngresosTarjeta(tarjetas != null ? tarjetas : BigDecimal.ZERO);
        reporte.setIngresosTransferencia(transferencia != null ? transferencia : BigDecimal.ZERO);
        reporte.setTransaccionesCompletadas(completadas);
        reporte.setTransaccionesPendientes(pendientes);

        return reporte;
    }

    @Transactional
    public Transaccion procesarPagoCaja(Long id, MedioPago medio, String referencia) {
        Transaccion t = transaccionRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Transacción no encontrada"));
        
        t.setMedioPago(medio);
        t.setEstadoPago(EstadoPago.APROBADO);
        t.setReferenciaPago(referencia);
        t.setFechaPago(LocalDateTime.now()); // <-- AÑADIDO: Vital para que la Boleta PDF muestre la fecha
        
        return transaccionRepositorio.save(t);
    }

    @Transactional
    public void crearOrdenPago(Cita cita) {
        Transaccion transaccion = new Transaccion();
        transaccion.setCita(cita);
        transaccion.setEstadoPago(EstadoPago.PENDIENTE);
        transaccion.setReferenciaPago("SISTEMA_CITA");
        
        // Verifica si el servicio tiene un precio asignado, sino le pone 0
        if (cita.getServicio() != null && cita.getServicio().getPrecio() != null) {
            transaccion.setMonto(cita.getServicio().getPrecio());
        } else {
            transaccion.setMonto(BigDecimal.ZERO);
        }
        
        transaccionRepositorio.save(transaccion);
    }
}