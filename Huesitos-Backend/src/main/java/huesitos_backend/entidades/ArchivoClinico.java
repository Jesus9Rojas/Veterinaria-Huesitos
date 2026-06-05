package huesitos_backend.entidades;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "archivos_clinicos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoClinico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mascota_id", nullable = false)
    private Mascota mascota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consulta_medica_id")
    private ConsultaMedica consultaMedica;

    @Column(name = "nombre_original", nullable = false)
    private String nombreOriginal;

    @Column(name = "archivo_url", nullable = false)
    private String archivoUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_examen", nullable = false, length = 20)
    private TipoArchivoClinico tipoExamen;

    @Column(name = "fecha_subida", nullable = false)
    private LocalDate fechaSubida;

    @Column(length = 500)
    private String descripcion;
}
