package huesitos_backend.entidades;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "configuracion_negocio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionNegocio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String correoElectronico;
    private String direccionFisica;
    private String telefonoRegular;
    private String celularEmergencias;
    private String horarioSemana;
    private String horarioDomingo;
    private String moneda = "PEN";
    private Double impuestoIgv = 18.0;
}