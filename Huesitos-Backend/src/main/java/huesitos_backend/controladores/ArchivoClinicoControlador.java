package huesitos_backend.controladores;

import huesitos_backend.entidades.ArchivoClinico;
import huesitos_backend.entidades.TipoArchivoClinico;
import huesitos_backend.servicios.ArchivoClinicoServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/archivos-clinicos")
@RequiredArgsConstructor
public class ArchivoClinicoControlador {

    private final ArchivoClinicoServicio archivoClinicoServicio;

    /**
     * Endpoint para obtener todos los archivos clínicos de una mascota.
     */
    @GetMapping("/mascota/{mascotaId}")
    public ResponseEntity<List<ArchivoClinico>> obtenerArchivosMascota(@PathVariable Long mascotaId) {
        List<ArchivoClinico> archivos = archivoClinicoServicio.obtenerArchivosPorMascota(mascotaId);
        return ResponseEntity.ok(archivos);
    }

    /**
     * Endpoint para subir un archivo clínico (PDF, imágenes, etc.) asociado a una mascota y consulta.
     */
    @PostMapping(value = "/subir", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> subirArchivo(
            @RequestParam("mascotaId") Long mascotaId,
            @RequestParam(value = "consultaId", required = false) Long consultaId,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam("tipoExamen") String tipoExamen,
            @RequestParam("archivo") MultipartFile archivo) {
        try {
            TipoArchivoClinico tipo = TipoArchivoClinico.valueOf(tipoExamen.toUpperCase());
            ArchivoClinico guardado = archivoClinicoServicio.guardarArchivo(mascotaId, consultaId, descripcion, tipo, archivo);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("El tipo de examen especificado no es válido (Debe ser: LABORATORIO, ECOGRAFIA, RAYOS_X u OTROS)");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
