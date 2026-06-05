package huesitos_backend.controladores;

import huesitos_backend.entidades.Servicio;
import huesitos_backend.servicios.ServicioServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/servicios")
@RequiredArgsConstructor
public class ServicioControlador {

    private final ServicioServicio servicioServicio;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<?> crearServicio(@RequestBody Servicio servicio) {
        try {
            Servicio resultado = servicioServicio.crearServicio(servicio);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Servicio>> listarServiciosActivos() {
        List<Servicio> servicios = servicioServicio.listarServiciosActivos();
        return ResponseEntity.ok(servicios);
    }

    /**
     * Endpoint para actualizar los datos completos de un servicio (Nombre, Precio, Descripción, Duración).
     * Vinculado al Modal de Edición del Frontend.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<?> actualizarServicio(@PathVariable Long id, @RequestBody Servicio servicio) {
        try {
            Servicio resultado = servicioServicio.actualizarServicio(id, servicio);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam Boolean activo) {
        try {
            servicioServicio.cambiarEstadoServicio(id, activo);
            return ResponseEntity.ok("Estado del servicio actualizado con éxito");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}