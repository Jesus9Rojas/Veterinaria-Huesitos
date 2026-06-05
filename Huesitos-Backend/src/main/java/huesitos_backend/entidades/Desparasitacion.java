package huesitos_backend.entidades;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "desparasitaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Desparasitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mascota_id", nullable = false)
    private Mascota mascota;

    @Column(name = "fecha_aplicacion", nullable = false)
    private LocalDate fechaAplicacion;

    @Column(name = "fecha_proxima_aplicacion")
    private LocalDate fechaProximaAplicacion;

    @Column(nullable = false, length = 100)
    private String producto; // e.g. "Bravecto", "Endogard"

    @Column(nullable = false, length = 50)
    private String tipo; // "INTERNA" o "EXTERNA"

    @Column(length = 500)
    private String observaciones;
}
