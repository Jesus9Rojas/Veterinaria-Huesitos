package huesitos_backend.entidades;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "medicinas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Medicina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre; 

    @Column(length = 150)
    private String proveedor; 

    @Column(length = 500)
    private String descripcion; 

    @Column(nullable = false)
    private Double precio = 0.0; 
    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false)
    private Boolean activo = true;
}