package huesitos_backend.servicios;

import huesitos_backend.entidades.Inventario;
import huesitos_backend.entidades.Producto;
import huesitos_backend.repositorios.InventarioRepositorio;
import huesitos_backend.repositorios.ProductoRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventarioServicio {

    private final InventarioRepositorio inventarioRepositorio;
    private final ProductoRepositorio productoRepositorio;

    @Transactional
    public Inventario registrarIngresoStock(Inventario lote) {
        if (lote.getProducto() == null || lote.getProducto().getId() == null) {
            throw new RuntimeException("El producto asociado al lote es obligatorio");
        }
        
        if (lote.getStock() == null || lote.getStock() < 0) {
            throw new RuntimeException("El stock inicial del lote debe ser mayor o igual a cero");
        }

        // Validar que el producto exista y esté activo
        Producto producto = productoRepositorio.findById(lote.getProducto().getId())
                .filter(p -> p.getActivo())
                .orElseThrow(() -> new RuntimeException("El producto asociado no existe o no está activo"));

        lote.setProducto(producto);
        lote.setFechaIngreso(LocalDate.now()); // Autogenera la fecha de ingreso actual

        // Si no envían código de lote, el sistema lo autogenera
        if (lote.getCodigoLote() == null || lote.getCodigoLote().trim().isEmpty()) {
            lote.setCodigoLote("LOTE-" + System.currentTimeMillis());
        } else {
            lote.setCodigoLote(lote.getCodigoLote().trim());
        }

        if (lote.getActivo() == null) {
            lote.setActivo(true);
        }

        return inventarioRepositorio.save(lote);
    }

    @Transactional
    public Inventario ajustarStockLote(Long loteId, Integer nuevoStock) {
        if (nuevoStock == null || nuevoStock < 0) {
            throw new RuntimeException("El stock de lote debe ser mayor o igual a cero");
        }

        Inventario lote = inventarioRepositorio.findById(loteId)
                .orElseThrow(() -> new RuntimeException("Lote de inventario no encontrado"));

        lote.setStock(nuevoStock);
        return inventarioRepositorio.save(lote);
    }

    @Transactional(readOnly = true)
    public List<Inventario> listarLotesPorProducto(Long productoId) {
        return inventarioRepositorio.findByProductoIdAndActivoTrue(productoId);
    }

    @Transactional(readOnly = true)
    public List<Inventario> listarLotesActivos() {
        return inventarioRepositorio.findByActivoTrue();
    }

    @Transactional
    public void desactivarLote(Long id) {
        Inventario lote = inventarioRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Lote no encontrado"));
        lote.setActivo(false);
        inventarioRepositorio.save(lote);
    }

    @Transactional(readOnly = true)
    public List<Inventario> obtenerLotesProximosAVencer(int dias) {
        java.time.LocalDate fechaLimite = java.time.LocalDate.now().plusDays(dias);
        return inventarioRepositorio.buscarLotesProximosAVencer(fechaLimite);
    }
}