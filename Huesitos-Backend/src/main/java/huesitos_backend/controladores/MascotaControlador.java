package huesitos_backend.controladores;

import huesitos_backend.entidades.Mascota;
import huesitos_backend.servicios.MascotaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/mascotas")
@RequiredArgsConstructor
public class MascotaControlador {

    private final MascotaServicio mascotaServicio;

    /**
     * Endpoint para registrar una nueva mascota.
     *
     * @param mascota Los datos de la mascota a registrar.
     * @return La mascota registrada o BadRequest si falla.
     */
    @PostMapping
    public ResponseEntity<?> registrarMascota(@RequestBody Mascota mascota) {
        try {
            Mascota resultado = mascotaServicio.registrarMascota(mascota);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Endpoint para listar todas las mascotas de un dueño.
     *
     * @param duenoId El ID del dueño.
     * @return Lista de mascotas asociadas.
     */
    @GetMapping("/dueno/{duenoId}")
    public ResponseEntity<List<Mascota>> listarPorDueño(@PathVariable Long duenoId) {
        List<Mascota> mascotas = mascotaServicio.obtenerMascotasPorDueño(duenoId);
        return ResponseEntity.ok(mascotas);
    }

    /**
     * Endpoint para buscar una mascota por su ID.
     *
     * @param id El ID de la mascota.
     * @return La mascota encontrada o NotFound si no existe.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            Mascota resultado = mascotaServicio.obtenerMascotaPorId(id);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
