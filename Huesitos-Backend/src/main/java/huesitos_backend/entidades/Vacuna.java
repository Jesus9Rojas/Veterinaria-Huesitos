package huesitos_backend.entidades;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "vacunas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Vacuna {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(name = "especie_destino", nullable = false, length = 50)
    private String especieDestino; // e.g. "PERRO", "GATO", "TODOS"

    @Column(length = 150)
    private String proveedor; // Preventista / Laboratorio

    @Column
    private Double precio; // Permite null para registros antiguos

    @Column
    private Integer stock; // Permite null para registros antiguos

    @Column
    private Boolean activo; // Permite null para registros antiguos
}