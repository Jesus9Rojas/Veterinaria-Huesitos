package huesitos_backend.controladores;

import huesitos_backend.entidades.ConfiguracionRol;
import huesitos_backend.entidades.Rol;
import huesitos_backend.repositorios.ConfiguracionRolRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/configuraciones")
@RequiredArgsConstructor
public class ConfiguracionRolControlador {

    private final ConfiguracionRolRepositorio configuracionRolRepositorio;

    /**
     * Retorna la configuración de un rol específico.
     */
    @GetMapping("/rol/{rol}")
    public ResponseEntity<?> obtenerConfiguracionPorRol(@PathVariable String rol) {
        try {
            Rol rolEnum = Rol.valueOf(rol.toUpperCase());
            return configuracionRolRepositorio.findByRol(rolEnum)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Rol no válido: " + rol);
        }
    }

    /**
     * Guarda o actualiza una variable de configuración por rol.
     */
    @PostMapping
    public ResponseEntity<?> guardarOActualizarConfiguracion(@RequestBody ConfiguracionRol configuracion) {
        try {
            if (configuracion.getRol() == null) {
                throw new RuntimeException("El rol es obligatorio");
            }
            
            // Buscar si ya existe para este rol
            Optional<ConfiguracionRol> configExistente = configuracionRolRepositorio.findByRol(configuracion.getRol());
            if (configExistente.isPresent()) {
                ConfiguracionRol config = configExistente.get();
                config.setClaveConfiguracion(configuracion.getClaveConfiguracion());
                config.setValorConfiguracion(configuracion.getValorConfiguracion());
                ConfiguracionRol guardada = configuracionRolRepositorio.save(config);
                return ResponseEntity.ok(guardada);
            } else {
                configuracion.setId(null);
                ConfiguracionRol guardada = configuracionRolRepositorio.save(configuracion);
                return ResponseEntity.ok(guardada);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
