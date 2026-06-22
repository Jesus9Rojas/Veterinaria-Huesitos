package huesitos_backend.controladores;

import huesitos_backend.entidades.HistorialVacunacion;
import huesitos_backend.entidades.Vacuna;
import huesitos_backend.servicios.VacunaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vacunas")
@RequiredArgsConstructor
public class VacunaControlador {

    private final VacunaServicio vacunaServicio;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO', 'AUXILIAR_VETERINARIO')")
    public ResponseEntity<List<Vacuna>> obtenerCatalogo() {
        return ResponseEntity.ok(vacunaServicio.obtenerCatalogoVacunas());
    }

    @PostMapping
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> registrarVacuna(@RequestBody Vacuna vacuna) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(vacunaServicio.registrarVacunaCatalogo(vacuna));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> actualizarVacuna(@PathVariable Long id, @RequestBody Vacuna vacuna) {
        try {
            return ResponseEntity.ok(vacunaServicio.actualizarVacunaCatalogo(id, vacuna));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> desactivarVacuna(@PathVariable Long id) {
        try {
            vacunaServicio.desactivarVacuna(id);
            return ResponseEntity.ok("Vacuna suspendida con éxito");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/activar")
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> reactivarVacuna(@PathVariable Long id) {
        try {
            vacunaServicio.reactivarVacuna(id);
            return ResponseEntity.ok("Vacuna habilitada con éxito");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/mascota/{mascotaId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO', 'AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> obtenerHistorialMascota(@PathVariable Long mascotaId) {
        try {
            return ResponseEntity.ok(vacunaServicio.obtenerHistorialPorMascota(mascotaId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/aplicar")
    @PreAuthorize("hasRole('VETERINARIO')")
    public ResponseEntity<?> registrarAplicacion(@RequestBody HistorialVacunacion registro) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(vacunaServicio.registrarAplicacion(registro));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}