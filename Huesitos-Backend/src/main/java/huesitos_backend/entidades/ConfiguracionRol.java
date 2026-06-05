package huesitos_backend.entidades;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "configuraciones_roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionRol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 30)
    private Rol rol;

    @Column(name = "clave_configuracion", nullable = false, length = 100)
    private String claveConfiguracion;

    @Column(name = "valor_configuracion", nullable = false, length = 255)
    private String valorConfiguracion;
}
