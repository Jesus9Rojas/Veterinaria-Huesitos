package huesitos_backend.controladores;

import huesitos_backend.entidades.Categoria;
import huesitos_backend.servicios.CategoriaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaControlador {

    private final CategoriaServicio categoriaServicio;

    @PostMapping
    // El Auxiliar ahora es el encargado de registrar categorías
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> registrarCategoria(@RequestBody Categoria categoria) {
        try {
            Categoria resultado = categoriaServicio.guardarCategoria(categoria);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    // Se añade el Auxiliar para que pueda cargar la lista al entrar a Inventario
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'AUXILIAR_VETERINARIO')")
    public ResponseEntity<List<Categoria>> listarCategorias() {
        return ResponseEntity.ok(categoriaServicio.listarActivas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(categoriaServicio.buscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    // El Auxiliar ahora es el encargado de desactivar categorías
    @PreAuthorize("hasRole('AUXILIAR_VETERINARIO')")
    public ResponseEntity<?> desactivarCategoria(@PathVariable Long id) {
        try {
            categoriaServicio.desactivarCategoria(id);
            return ResponseEntity.ok("Categoría desactivada con éxito");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}