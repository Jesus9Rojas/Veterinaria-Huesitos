package huesitos_backend.dto;

import lombok.Data;

@Data
public class ItemCobroRequest {
    private String tipoItem; 
    private Long itemId;
    private Integer cantidad;
}