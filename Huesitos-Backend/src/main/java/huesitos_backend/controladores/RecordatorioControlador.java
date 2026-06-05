package huesitos_backend.controladores;

import huesitos_backend.entidades.Recordatorio;
import huesitos_backend.entidades.Usuario;
import huesitos_backend.repositorios.RecordatorioRepositorio;
import huesitos_backend.repositorios.UsuarioRepositorio;
import huesitos_backend.servicios.TareaProgramadaServicio;
import huesitos_backend.servicios.CampanaOfertaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recordatorios")
public class RecordatorioControlador {

    private final RecordatorioRepositorio recordatorioRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final TareaProgramadaServicio tareaProgramadaServicio;
    private final CampanaOfertaServicio campanaOfertaServicio;

    @GetMapping
    public ResponseEntity<?> listarRecordatorios(Principal principal) {
        try {
            Usuario usuario = obtenerUsuarioAutenticado(principal);
            List<Recordatorio> recordatorios = recordatorioRepositorio.findByMascotaDueñoUsuarioId(usuario.getId());
            return ResponseEntity.ok(recordatorios);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/leido")
    public ResponseEntity<?> marcarComoLeido(@PathVariable Long id) {
        try {
            Recordatorio rec = recordatorioRepositorio.findById(id)
                    .orElseThrow(() -> new RuntimeException("Recordatorio no encontrado con ID: " + id));
            rec.setLeido(true);
            Recordatorio actualizado = recordatorioRepositorio.save(rec);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Endpoint para ejecutar manualmente la tarea de escaneo de vacunas y desparasitaciones pendientes.
     * Facilita las pruebas de QA sin tener que esperar por la hora programada.
     */
    @PostMapping("/procesar-manual")
    public ResponseEntity<?> procesarRecordatoriosManualmente() {
        try {
            int totalCreados = tareaProgramadaServicio.procesarRecordatorios(LocalDate.now());
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Escaneo de recordatorios manual ejecutado con éxito");
            respuesta.put("recordatoriosCreados", totalCreados);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Endpoint para ejecutar manualmente la inactivación de campañas y ofertas expiradas.
     */
    @PostMapping("/inactivar-campanas-manual")
    public ResponseEntity<?> procesarInactivacionCampanasManualmente() {
        try {
            campanaOfertaServicio.inactivarExpiradas(LocalDate.now());
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Inactivación de campañas y ofertas expiradas ejecutada con éxito");
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private Usuario obtenerUsuarioAutenticado(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Usuario no autenticado");
        }
        return usuarioRepositorio.findByCorreo(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado en base de datos"));
    }
}
