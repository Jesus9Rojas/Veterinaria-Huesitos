package huesitos_backend.dto;

import huesitos_backend.entidades.MedioPago;
import lombok.Data;
import java.util.List;

@Data
public class VentaMostradorDTO {
    private List<ItemVentaDTO> items;
    private MedioPago medioPago;
    private String referencia;
    private Long usuarioId;
    @Data
    public static class ItemVentaDTO {
        private Long productoId;
        private Integer cantidad;
    }
}