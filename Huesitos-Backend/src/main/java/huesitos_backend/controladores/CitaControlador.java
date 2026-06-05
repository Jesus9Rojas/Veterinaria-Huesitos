package huesitos_backend.controladores;

import huesitos_backend.dto.SolicitudReprogramacion;
import huesitos_backend.entidades.Cita;
import huesitos_backend.entidades.EstadoCita;
import huesitos_backend.servicios.CitaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/citas")
@RequiredArgsConstructor
public class CitaControlador {

    private final CitaServicio citaServicio;

    // 1. OBTENER CITAS POR DÍA (¡CORREGIDO! Vuelve a ser /calendario)
    @GetMapping("/calendario")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO')")
    public ResponseEntity<List<Cita>> listarPorDia(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        List<Cita> citas = citaServicio.listarCitasPorDia(fecha);
        return ResponseEntity.ok(citas);
    }

    // 2. AGENDAR CITA
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<?> agendarCita(@RequestBody Cita cita) {
        try {
            Cita resultado = citaServicio.agendarCita(cita);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. CAMBIAR ESTADO
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO')")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id, 
            @RequestParam EstadoCita nuevoEstado) {
        try {
            Cita resultado = citaServicio.cambiarEstadoCita(id, nuevoEstado);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. CANCELAR CITA
    @PutMapping("/{id}/cancelar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<?> cancelarCita(@PathVariable Long id) {
        try {
            Cita resultado = citaServicio.cancelarCita(id);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 5. CHECK-IN
    @PutMapping("/{id}/check-in")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<?> checkInCita(@PathVariable Long id) {
        try {
            Cita resultado = citaServicio.checkInCita(id);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 6. REPROGRAMAR
    @PutMapping("/{id}/reprogramar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<?> reprogramarCita(@PathVariable Long id, @RequestBody SolicitudReprogramacion solicitud) {
        try {
            if (solicitud == null || solicitud.nuevaFechaHora() == null) {
                return ResponseEntity.badRequest().body("La nueva fecha y hora es requerida");
            }
            Cita resultado = citaServicio.reprogramarCita(id, solicitud.nuevaFechaHora());
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}