package huesitos_backend.controladores;

import huesitos_backend.entidades.HistorialVacunacion;
import huesitos_backend.entidades.Vacuna;
import huesitos_backend.servicios.VacunaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vacunas")
@RequiredArgsConstructor
public class VacunaControlador {

    private final VacunaServicio vacunaServicio;

    /**
     * Endpoint para obtener todas las vacunas del catálogo.
     */
    @GetMapping
    public ResponseEntity<List<Vacuna>> obtenerCatalogo() {
        List<Vacuna> catalogo = vacunaServicio.obtenerCatalogoVacunas();
        return ResponseEntity.ok(catalogo);
    }

    /**
     * Endpoint para registrar una nueva vacuna en el catálogo de la clínica.
     */
    @PostMapping
    public ResponseEntity<?> registrarVacuna(@RequestBody Vacuna vacuna) {
        try {
            Vacuna guardada = vacunaServicio.registrarVacunaCatalogo(vacuna);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Endpoint para obtener el historial de vacunas aplicadas a una mascota.
     */
    @GetMapping("/mascota/{mascotaId}")
    public ResponseEntity<?> obtenerHistorialMascota(@PathVariable Long mascotaId) {
        try {
            List<HistorialVacunacion> historial = vacunaServicio.obtenerHistorialPorMascota(mascotaId);
            return ResponseEntity.ok(historial);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Endpoint para registrar la aplicación de una vacuna a una mascota.
     */
    @PostMapping("/aplicar")
    public ResponseEntity<?> registrarAplicacion(@RequestBody HistorialVacunacion registro) {
        try {
            HistorialVacunacion guardado = vacunaServicio.registrarAplicacion(registro);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
