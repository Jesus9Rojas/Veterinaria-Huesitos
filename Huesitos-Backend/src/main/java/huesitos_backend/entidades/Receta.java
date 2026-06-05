package huesitos_backend.entidades;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "recetas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Receta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "consulta_medica_id", nullable = false, unique = true)
    private ConsultaMedica consultaMedica;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String medicamentos;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String indicaciones;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDate fechaEmision;
}
