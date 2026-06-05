package huesitos_backend.controladores;

import huesitos_backend.entidades.ConsultaMedica;
import huesitos_backend.servicios.ConsultaMedicaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultas")
@RequiredArgsConstructor
public class ConsultaMedicaControlador {

    private final ConsultaMedicaServicio consultaMedicaServicio;

    /**
     * Endpoint para registrar una nueva consulta médica.
     *
     * @param consulta La información de la consulta a registrar.
     * @return La consulta médica guardada o BadRequest en caso de error.
     */
    @PostMapping
    public ResponseEntity<?> registrarConsulta(@RequestBody ConsultaMedica consulta) {
        try {
            ConsultaMedica resultado = consultaMedicaServicio.registrarConsulta(consulta);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Endpoint para obtener el historial clínico de una mascota.
     *
     * @param mascotaId El ID de la mascota.
     * @return Lista de consultas médicas de la mascota.
     */
    @GetMapping("/mascota/{mascotaId}")
    public ResponseEntity<List<ConsultaMedica>> obtenerHistorialMascota(@PathVariable Long mascotaId) {
        List<ConsultaMedica> historial = consultaMedicaServicio.obtenerHistorialMascota(mascotaId);
        return ResponseEntity.ok(historial);
    }
}
