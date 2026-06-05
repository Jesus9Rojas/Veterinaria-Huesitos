package huesitos_backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ReporteFinanciero {
    private BigDecimal totalIngresos;
    private BigDecimal ingresosEfectivo;
    private BigDecimal ingresosTarjeta;
    private BigDecimal ingresosTransferencia;
    private long transaccionesCompletadas;
    private long transaccionesPendientes;
}