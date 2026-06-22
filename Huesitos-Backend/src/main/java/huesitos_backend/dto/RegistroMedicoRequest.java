package huesitos_backend.dto;
import lombok.Data;
import java.time.LocalDate;

@Data
public class RegistroMedicoRequest {
    private Long itemId; 
    private String dosisOTipo;
    private LocalDate fechaAplicacion;
    private LocalDate fechaProxima;
    private String observaciones;
}