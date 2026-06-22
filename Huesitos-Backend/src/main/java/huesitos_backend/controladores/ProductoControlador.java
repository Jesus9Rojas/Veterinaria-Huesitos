package huesitos_backend.controladores;

import huesitos_backend.entidades.Producto;
import huesitos_backend.servicios.ProductoServicio;
import huesitos_backend.servicios.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoControlador {

    private final ProductoServicio productoServicio;
    private final StorageService storageService; 

    @PostMapping
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> registrarProducto(@RequestBody Producto producto) {
        try {
            return ResponseEntity.ok(productoServicio.guardarProducto(producto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> actualizarProducto(@PathVariable Long id, @RequestBody Producto producto) {
        try {
            producto.setId(id);
            return ResponseEntity.ok(productoServicio.guardarProducto(producto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'AUXILIAR_VETERINARIO')")
    public ResponseEntity<List<Producto>> listarActivos() {
        return ResponseEntity.ok(productoServicio.listarActivos());
    }

    @GetMapping("/todos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'AUXILIAR_VETERINARIO')")
    public ResponseEntity<List<Producto>> listarTodos() {
        return ResponseEntity.ok(productoServicio.listarTodos());
    }

    @GetMapping("/categoria/{categoriaId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'AUXILIAR_VETERINARIO')")
    public ResponseEntity<List<Producto>> listarPorCategoria(@PathVariable Long categoriaId) {
        return ResponseEntity.ok(productoServicio.listarPorCategoria(categoriaId));
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'AUXILIAR_VETERINARIO')")
    public ResponseEntity<List<Producto>> buscarProductos(@RequestParam(required = false) String nombre) {
        return ResponseEntity.ok(productoServicio.buscarProductos(nombre));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productoServicio.buscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> desactivarProducto(@PathVariable Long id) {
        productoServicio.desactivarProducto(id);
        return ResponseEntity.ok("Producto desactivado con éxito");
    }

    @PutMapping("/{id}/activar")
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> reactivarProducto(@PathVariable Long id) {
        productoServicio.activarProducto(id);
        return ResponseEntity.ok("Producto reactivado con éxito");
    }

    @PostMapping("/{id}/foto")
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> subirFotoProducto(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo) {
        try {
            Producto producto = productoServicio.buscarPorId(id);
            String urlFoto = storageService.comprimirYGuardarFoto(archivo, "producto");
            producto.setFotoUrl(urlFoto);
            productoServicio.guardarProducto(producto);
            
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("fotoUrl", urlFoto);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}