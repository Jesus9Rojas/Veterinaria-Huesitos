package huesitos_backend.controladores;

import huesitos_backend.dto.RegistroMedicoRequest;
import huesitos_backend.entidades.Receta;
import huesitos_backend.servicios.HistorialClinicoServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/historial-clinico")
@RequiredArgsConstructor
public class HistorialClinicoControlador {

    private final HistorialClinicoServicio servicio;

    @PostMapping("/mascota/{mascotaId}/cita/{citaId}/vacuna")
    @PreAuthorize("hasRole('VETERINARIO')")
    public ResponseEntity<?> registrarVacuna(@PathVariable Long mascotaId, @PathVariable Long citaId, @RequestBody RegistroMedicoRequest request) {
        try {
            servicio.aplicarVacuna(citaId, mascotaId, request);
            return ResponseEntity.ok("Vacuna registrada y cobrada exitosamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/mascota/{mascotaId}/cita/{citaId}/desparasitacion")
    @PreAuthorize("hasRole('VETERINARIO')")
    public ResponseEntity<?> registrarDesparasitacion(@PathVariable Long mascotaId, @PathVariable Long citaId, @RequestBody RegistroMedicoRequest request) {
        try {
            servicio.aplicarDesparasitacion(citaId, mascotaId, request);
            return ResponseEntity.ok("Desparasitación registrada y cobrada exitosamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/consulta/{consultaId}/receta")
    @PreAuthorize("hasRole('VETERINARIO')")
    public ResponseEntity<?> emitirReceta(@PathVariable Long consultaId, @RequestBody Receta receta) {
        try {
            servicio.generarReceta(consultaId, receta);
            return ResponseEntity.ok("Receta generada correctamente.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al generar la receta. Verifica que no exista una receta previa para esta misma consulta.");
        }
    }
}