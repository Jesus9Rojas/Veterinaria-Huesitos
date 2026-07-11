package huesitos_backend.controladores;

import huesitos_backend.dto.ItemCobroRequest;
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

    @GetMapping("/calendario")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO')")
    public ResponseEntity<List<Cita>> listarPorDia(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        List<Cita> citas = citaServicio.listarCitasPorDia(fecha);
        return ResponseEntity.ok(citas);
    }

    @GetMapping("/hoy")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO', 'AUXILIAR_VETERINARIO')")
    public ResponseEntity<List<Cita>> obtenerCitasHoy() {
        List<Cita> citas = citaServicio.listarCitasPorDia(LocalDate.now());
        return ResponseEntity.ok(citas);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE')")
    public ResponseEntity<?> agendarCita(@RequestBody Cita cita) {
        try {
            Cita resultado = citaServicio.agendarCita(cita);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

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

    @PatchMapping("/{id}/asignar-veterinario")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<?> asignarVeterinario(
            @PathVariable Long id, 
            @RequestParam Long veterinarioId) {
        try {
            Cita resultado = citaServicio.asignarVeterinario(id, veterinarioId);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

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

    @PostMapping("/{citaId}/recetar-items")
    @PreAuthorize("hasAnyRole('VETERINARIO', 'ADMINISTRADOR')")
    public ResponseEntity<?> recetarYCobrarItems(@PathVariable Long citaId, @RequestBody List<ItemCobroRequest> items) {
        try {
            return ResponseEntity.ok(citaServicio.registrarItemsRecetadosYCobrar(citaId, items));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/dueno/{duenoId}")
    @PreAuthorize("hasAnyRole('CLIENTE', 'ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Cita>> obtenerCitasPorDueno(@PathVariable Long duenoId) {
        return ResponseEntity.ok(citaServicio.obtenerCitasPorDueno(duenoId));
    }
}