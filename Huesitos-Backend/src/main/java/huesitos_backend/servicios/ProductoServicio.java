package huesitos_backend.servicios;

import huesitos_backend.entidades.Producto;
import huesitos_backend.repositorios.ProductoRepositorio;
import huesitos_backend.repositorios.InventarioRepositorio;
import huesitos_backend.repositorios.CategoriaRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoServicio {

    private final ProductoRepositorio productoRepositorio;
    private final InventarioRepositorio inventarioRepositorio;
    private final CategoriaRepositorio categoriaRepositorio;

    @Transactional
    public Producto guardarProducto(Producto producto) {
        if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre del producto es obligatorio");
        }
        if (producto.getPrecio() == null || producto.getPrecio().doubleValue() < 0) {
            throw new RuntimeException("El precio del producto debe ser mayor o igual a cero");
        }
        if (producto.getCategoria() == null || producto.getCategoria().getId() == null) {
            throw new RuntimeException("La categoría asociada es obligatoria");
        }

        categoriaRepositorio.findById(producto.getCategoria().getId())
                .filter(c -> c.getActivo())
                .orElseThrow(() -> new RuntimeException("La categoría asociada no existe o no está activa"));

        producto.setNombre(producto.getNombre().trim());
        
        if(producto.getActivo() == null) {
            producto.setActivo(true);
        }

        Producto nuevoProducto = productoRepositorio.save(producto);
        
        nuevoProducto.setStockDisponible(inventarioRepositorio.obtenerStockDisponible(nuevoProducto.getId()));
        return nuevoProducto;
    }

    @Transactional(readOnly = true)
    public List<Producto> listarActivos() {
        List<Producto> productos = productoRepositorio.findByActivoTrue();
        productos.forEach(p -> p.setStockDisponible(inventarioRepositorio.obtenerStockDisponible(p.getId())));
        return productos;
    }

    @Transactional(readOnly = true)
    public List<Producto> listarTodos() {
        List<Producto> productos = productoRepositorio.findAll();
        productos.forEach(p -> p.setStockDisponible(inventarioRepositorio.obtenerStockDisponible(p.getId())));
        return productos;
    }

    @Transactional(readOnly = true)
    public List<Producto> listarPorCategoria(Long categoriaId) {
        List<Producto> productos = productoRepositorio.findByCategoriaIdAndActivoTrue(categoriaId);
        productos.forEach(p -> p.setStockDisponible(inventarioRepositorio.obtenerStockDisponible(p.getId())));
        return productos;
    }

    @Transactional(readOnly = true)
    public Producto buscarPorId(Long id) {
        Producto producto = productoRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.setStockDisponible(inventarioRepositorio.obtenerStockDisponible(producto.getId()));
        return producto;
    }

    @Transactional
    public void desactivarProducto(Long id) {
        Producto producto = buscarPorId(id);
        producto.setActivo(false);
        productoRepositorio.save(producto);
    }

    @Transactional
    public void activarProducto(Long id) {
        Producto producto = buscarPorId(id);
        producto.setActivo(true);
        productoRepositorio.save(producto);
    }

    @Transactional(readOnly = true)
    public List<Producto> obtenerProductosBajoStock() {
        List<Producto> productos = productoRepositorio.buscarProductosBajoStock();
        productos.forEach(p -> p.setStockDisponible(inventarioRepositorio.obtenerStockDisponible(p.getId())));
        return productos;
    }

    @Transactional(readOnly = true)
    public List<Producto> buscarProductos(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            return listarActivos();
        }
        List<Producto> productos = productoRepositorio.findByNombreContainingIgnoreCaseAndActivoTrue(nombre.trim());
        productos.forEach(p -> p.setStockDisponible(inventarioRepositorio.obtenerStockDisponible(p.getId())));
        return productos;
    }
}