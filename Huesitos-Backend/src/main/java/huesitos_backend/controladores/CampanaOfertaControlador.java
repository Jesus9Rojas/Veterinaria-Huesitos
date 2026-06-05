package huesitos_backend.controladores;

import huesitos_backend.entidades.Campana;
import huesitos_backend.entidades.Oferta;
import huesitos_backend.servicios.CampanaOfertaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class CampanaOfertaControlador {

    private final CampanaOfertaServicio campanaOfertaServicio;

    // --- ENDPOINTS DE CAMPAÑAS ---

    @GetMapping("/campanas")
    public ResponseEntity<List<Campana>> listarCampanasActivas() {
        return ResponseEntity.ok(campanaOfertaServicio.listarCampanasActivas());
    }

    @GetMapping("/campanas/todas")
    public ResponseEntity<List<Campana>> listarTodasCampanas() {
        return ResponseEntity.ok(campanaOfertaServicio.listarTodasCampanas());
    }

    @GetMapping("/campanas/{id}")
    public ResponseEntity<?> buscarCampanaPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(campanaOfertaServicio.buscarCampanaPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/campanas")
    public ResponseEntity<?> registrarCampana(@RequestBody Campana campana) {
        try {
            Campana resultado = campanaOfertaServicio.guardarCampana(campana);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/campanas/{id}")
    public ResponseEntity<?> actualizarCampana(@PathVariable Long id, @RequestBody Campana campana) {
        try {
            campana.setId(id);
            Campana resultado = campanaOfertaServicio.guardarCampana(campana);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/campanas/{id}")
    public ResponseEntity<?> eliminarCampana(@PathVariable Long id) {
        try {
            campanaOfertaServicio.eliminarCampana(id);
            return ResponseEntity.ok("Campaña eliminada/desactivada con éxito");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- ENDPOINTS DE OFERTAS ---

    @GetMapping("/ofertas")
    public ResponseEntity<List<Oferta>> listarOfertasActivas() {
        return ResponseEntity.ok(campanaOfertaServicio.listarOfertasActivas());
    }

    @GetMapping("/ofertas/todas")
    public ResponseEntity<List<Oferta>> listarTodasOfertas() {
        return ResponseEntity.ok(campanaOfertaServicio.listarTodasOfertas());
    }

    @GetMapping("/ofertas/{id}")
    public ResponseEntity<?> buscarOfertaPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(campanaOfertaServicio.buscarOfertaPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/ofertas")
    public ResponseEntity<?> registrarOferta(@RequestBody Oferta oferta) {
        try {
            Oferta resultado = campanaOfertaServicio.guardarOferta(oferta);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/ofertas/{id}")
    public ResponseEntity<?> actualizarOferta(@PathVariable Long id, @RequestBody Oferta oferta) {
        try {
            oferta.setId(id);
            Oferta resultado = campanaOfertaServicio.guardarOferta(oferta);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/ofertas/{id}")
    public ResponseEntity<?> eliminarOferta(@PathVariable Long id) {
        try {
            campanaOfertaServicio.eliminarOferta(id);
            return ResponseEntity.ok("Oferta eliminada/desactivada con éxito");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
