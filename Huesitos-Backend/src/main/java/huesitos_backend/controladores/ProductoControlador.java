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
    private final StorageService storageService; // Inyectamos el servicio para guardar la foto

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> registrarProducto(@RequestBody Producto producto) {
        try {
            return ResponseEntity.ok(productoServicio.guardarProducto(producto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> actualizarProducto(@PathVariable Long id, @RequestBody Producto producto) {
        try {
            producto.setId(id);
            return ResponseEntity.ok(productoServicio.guardarProducto(producto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Producto>> listarActivos() {
        return ResponseEntity.ok(productoServicio.listarActivos());
    }

    // --- NUEVO ENDPOINT: Listar todos (incluye inactivos) ---
    @GetMapping("/todos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<Producto>> listarTodos() {
        return ResponseEntity.ok(productoServicio.listarTodos());
    }

    @GetMapping("/categoria/{categoriaId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Producto>> listarPorCategoria(@PathVariable Long categoriaId) {
        return ResponseEntity.ok(productoServicio.listarPorCategoria(categoriaId));
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Producto>> buscarProductos(@RequestParam(required = false) String nombre) {
        return ResponseEntity.ok(productoServicio.buscarProductos(nombre));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productoServicio.buscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> desactivarProducto(@PathVariable Long id) {
        productoServicio.desactivarProducto(id);
        return ResponseEntity.ok("Producto desactivado con éxito");
    }

    // --- NUEVO ENDPOINT: Reactivar Producto ---
    @PutMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> reactivarProducto(@PathVariable Long id) {
        productoServicio.activarProducto(id);
        return ResponseEntity.ok("Producto reactivado con éxito");
    }

    // --- EL ENDPOINT PARA SUBIR LA FOTO ---
    @PostMapping("/{id}/foto")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> subirFotoProducto(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo) {
        try {
            // 1. Buscamos el producto en BD
            Producto producto = productoServicio.buscarPorId(id);
            // 2. Comprimimos y guardamos la foto (el prefijo será 'producto')
            String urlFoto = storageService.comprimirYGuardarFoto(archivo, "producto");
            // 3. Le asignamos la URL generada al producto y actualizamos
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