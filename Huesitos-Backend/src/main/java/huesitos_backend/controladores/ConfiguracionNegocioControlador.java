package huesitos_backend.controladores;

import huesitos_backend.entidades.ConfiguracionNegocio;
import huesitos_backend.servicios.ConfiguracionNegocioServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuracion-negocio")
@RequiredArgsConstructor
public class ConfiguracionNegocioControlador {

    private final ConfiguracionNegocioServicio configuracionServicio;

    @GetMapping
    public ResponseEntity<ConfiguracionNegocio> obtenerConfiguracion() {
        return ResponseEntity.ok(configuracionServicio.obtenerConfiguracion());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')") // Solo la actualización requiere permisos
    public ResponseEntity<ConfiguracionNegocio> actualizarConfiguracion(@RequestBody ConfiguracionNegocio config) {
        return ResponseEntity.ok(configuracionServicio.actualizarConfiguracion(config));
    }
}