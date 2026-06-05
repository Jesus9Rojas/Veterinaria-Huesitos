package huesitos_backend.controladores;

import huesitos_backend.entidades.Receta;
import huesitos_backend.servicios.RecetaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recetas")
@RequiredArgsConstructor
public class RecetaControlador {

    private final RecetaServicio recetaServicio;

    /**
     * Endpoint para registrar o actualizar una receta médica.
     */
    @PostMapping
    public ResponseEntity<?> registrarReceta(@RequestBody Receta receta) {
        try {
            Receta guardada = recetaServicio.registrarReceta(receta);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Endpoint para obtener los datos JSON de la receta asociada a una consulta.
     */
    @GetMapping("/consulta/{consultaId}")
    public ResponseEntity<?> obtenerRecetaPorConsulta(@PathVariable Long consultaId) {
        try {
            Receta receta = recetaServicio.obtenerRecetaPorConsulta(consultaId);
            return ResponseEntity.ok(receta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Endpoint para descargar/visualizar la receta médica en formato PDF.
     */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<?> descargarPdfReceta(@PathVariable Long id) {
        try {
            byte[] pdfBytes = recetaServicio.generarPdfReceta(id);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            // inline permite mostrar el PDF directamente en el navegador/tablet
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=receta_" + id + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
