package huesitos_backend.controladores;

import huesitos_backend.entidades.HorarioPersonal;
import huesitos_backend.servicios.HorarioPersonalServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/horarios")
@RequiredArgsConstructor
public class HorarioPersonalControlador {

    private final HorarioPersonalServicio horarioPersonalServicio;

    /**
     * Endpoint para obtener el horario semanal del personal.
     */
    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA')")
    public ResponseEntity<List<HorarioPersonal>> obtenerHorarioSemanal(@PathVariable Long usuarioId) {
        try {
            List<HorarioPersonal> horarios = horarioPersonalServicio.obtenerHorariosPorUsuario(usuarioId);
            return ResponseEntity.ok(horarios);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint para configurar/actualizar un día específico del horario del personal.
     */
    @PostMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> configurarHorario(@PathVariable Long usuarioId, @RequestBody HorarioPersonal nuevoHorario) {
        try {
            HorarioPersonal guardado = horarioPersonalServicio.guardarOActualizarHorario(usuarioId, nuevoHorario);
            return ResponseEntity.ok(guardado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Endpoint para eliminar un bloque de horario por su ID.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> eliminarHorario(@PathVariable Long id) {
        try {
            horarioPersonalServicio.eliminarHorario(id);
            return ResponseEntity.ok("Turno eliminado correctamente de la base de datos.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}