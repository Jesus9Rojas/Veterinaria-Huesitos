package huesitos_backend.controladores;

import huesitos_backend.entidades.Inventario;
import huesitos_backend.servicios.InventarioServicio;
import huesitos_backend.servicios.ProductoServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventarios")
@RequiredArgsConstructor
public class InventarioControlador {

    private final InventarioServicio inventarioServicio;
    private final ProductoServicio productoServicio;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> registrarLote(@RequestBody Inventario lote) {
        try {
            Inventario resultado = inventarioServicio.registrarIngresoStock(lote);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/ajuste")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> ajustarStock(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            if (!body.containsKey("stock") || body.get("stock") == null) {
                return ResponseEntity.badRequest().body("El campo stock es obligatorio");
            }
            Integer nuevoStock = Integer.valueOf(body.get("stock").toString());
            Inventario resultado = inventarioServicio.ajustarStockLote(id, nuevoStock);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/producto/{productoId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Inventario>> listarPorProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(inventarioServicio.listarLotesPorProducto(productoId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Inventario>> listarLotes() {
        return ResponseEntity.ok(inventarioServicio.listarLotesActivos());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> desactivarLote(@PathVariable Long id) {
        try {
            inventarioServicio.desactivarLote(id);
            return ResponseEntity.ok("Lote de inventario desactivado con éxito");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/alertas/bajo-stock")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<huesitos_backend.entidades.Producto>> listarBajoStock() {
        return ResponseEntity.ok(productoServicio.obtenerProductosBajoStock());
    }

    @GetMapping("/alertas/vencimientos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Inventario>> listarVencimientos(
            @RequestParam(required = false, defaultValue = "30") Integer dias) {
        return ResponseEntity.ok(inventarioServicio.obtenerLotesProximosAVencer(dias));
    }
}