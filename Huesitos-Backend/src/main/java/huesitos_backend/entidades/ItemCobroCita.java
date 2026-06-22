package huesitos_backend.entidades;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "items_cobro_cita")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemCobroCita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cita_id", nullable = false)
    @JsonIgnore
    private Cita cita;

    @Column(nullable = false)
    private String tipoItem; 

    @Column(nullable = false)
    private Long itemId;

    @Column(nullable = false)
    private String nombreItem;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private Double precioUnitario;

    @Column(nullable = false)
    private Double subtotal;
}