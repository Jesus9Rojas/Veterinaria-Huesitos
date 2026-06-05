package huesitos_backend.dto;

import huesitos_backend.entidades.Actividad;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class DashboardDTO {
    private long totalServicios;
    private long serviciosActivos;
    private long totalUsuarios;
    private BigDecimal ingresosTotales;
    private List<Actividad> actividades;
}