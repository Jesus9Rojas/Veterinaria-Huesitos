package huesitos_backend.controladores;

import huesitos_backend.entidades.Medicina;
import huesitos_backend.servicios.MedicinaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicinas")
@RequiredArgsConstructor
public class MedicinaControlador {

    private final MedicinaServicio medicinaServicio;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO', 'AUXILIAR_VETERINARIO')")
    public ResponseEntity<List<Medicina>> listar() {
        return ResponseEntity.ok(medicinaServicio.listarTodas());
    }

    @PostMapping
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> crear(@RequestBody Medicina medicina) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(medicinaServicio.guardar(medicina));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Medicina medicina) {
        try {
            return ResponseEntity.ok(medicinaServicio.actualizar(id, medicina));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> desactivar(@PathVariable Long id) {
        try {
            medicinaServicio.desactivar(id);
            return ResponseEntity.ok("Medicina suspendida con éxito");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/activar")
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> reactivar(@PathVariable Long id) {
        try {
            medicinaServicio.reactivar(id);
            return ResponseEntity.ok("Medicina habilitada con éxito");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}