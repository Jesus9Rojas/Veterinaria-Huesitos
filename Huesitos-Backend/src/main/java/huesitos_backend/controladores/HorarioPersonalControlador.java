package huesitos_backend.controladores;

import huesitos_backend.entidades.HorarioPersonal;
import huesitos_backend.servicios.HorarioPersonalServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios/{usuarioId}/horarios")
@RequiredArgsConstructor
public class HorarioPersonalControlador {

    private final HorarioPersonalServicio horarioPersonalServicio;

    /**
     * Endpoint para obtener el horario semanal del personal.
     */
    @GetMapping
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
    @PostMapping
    public ResponseEntity<?> configurarHorario(@PathVariable Long usuarioId, @RequestBody HorarioPersonal nuevoHorario) {
        try {
            HorarioPersonal guardado = horarioPersonalServicio.guardarOActualizarHorario(usuarioId, nuevoHorario);
            return ResponseEntity.ok(guardado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
