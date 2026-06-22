package huesitos_backend.entidades;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "antiparasitarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Antiparasitario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre; 

    @Column(length = 150)
    private String proveedor; 

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false, length = 50)
    private String tipo; 

    @Column(name = "especie_destino", nullable = false, length = 50)
    private String especieDestino; 

    @Column(nullable = false)
    private Double precio = 0.0; 

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false)
    private Boolean activo = true;
}