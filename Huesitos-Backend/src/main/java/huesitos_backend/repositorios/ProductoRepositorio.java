package huesitos_backend.repositorios;

import huesitos_backend.entidades.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductoRepositorio extends JpaRepository<Producto, Long> {
    List<Producto> findByActivoTrue();
    List<Producto> findByCategoriaIdAndActivoTrue(Long categoriaId);

    List<Producto> findByNombreContainingIgnoreCaseAndActivoTrue(String nombre);

    @org.springframework.data.jpa.repository.Query(
        "SELECT p FROM Producto p WHERE p.activo = true AND " +
        "(SELECT COALESCE(SUM(i.stock), 0) FROM Inventario i WHERE i.producto.id = p.id AND i.activo = true AND (i.fechaVencimiento IS NULL OR i.fechaVencimiento >= CURRENT_DATE)) <= p.stockMinimo"
    )
    List<Producto> buscarProductosBajoStock();
}
