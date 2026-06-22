package huesitos_backend.controladores;

import huesitos_backend.entidades.Antiparasitario;
import huesitos_backend.servicios.AntiparasitarioServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/antiparasitarios")
@RequiredArgsConstructor
public class AntiparasitarioControlador {

    private final AntiparasitarioServicio antiparasitarioServicio;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO', 'AUXILIAR_VETERINARIO')")
    public ResponseEntity<List<Antiparasitario>> listar() {
        return ResponseEntity.ok(antiparasitarioServicio.listarTodos());
    }

    @PostMapping
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO') or hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> crear(@RequestBody Antiparasitario antiparasitario) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(antiparasitarioServicio.guardar(antiparasitario));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO') or hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Antiparasitario antiparasitario) {
        try {
            return ResponseEntity.ok(antiparasitarioServicio.actualizar(id, antiparasitario));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO') or hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> desactivar(@PathVariable Long id) {
        try {
            antiparasitarioServicio.desactivar(id);
            return ResponseEntity.ok("Antiparasitario suspendido con éxito");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/activar")
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO') or hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> reactivar(@PathVariable Long id) {
        try {
            antiparasitarioServicio.reactivar(id);
            return ResponseEntity.ok("Antiparasitario habilitado con éxito");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}