package huesitos_backend.repositorios;

import huesitos_backend.entidades.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventarioRepositorio extends JpaRepository<Inventario, Long> {
    List<Inventario> findByProductoIdAndActivoTrue(Long productoId);
    List<Inventario> findByActivoTrue();

    @Query("SELECT COALESCE(SUM(i.stock), 0) FROM Inventario i WHERE i.producto.id = :productoId AND i.activo = true AND (i.fechaVencimiento IS NULL OR i.fechaVencimiento >= CURRENT_DATE)")
    Integer obtenerStockDisponible(@Param("productoId") Long productoId);

    @Query("SELECT i FROM Inventario i WHERE i.activo = true AND i.stock > 0 AND i.fechaVencimiento IS NOT NULL AND i.fechaVencimiento <= :fechaLimite")
    List<Inventario> buscarLotesProximosAVencer(@Param("fechaLimite") java.time.LocalDate fechaLimite);

    @Query("SELECT i FROM Inventario i WHERE i.producto.id = :productoId AND i.activo = true AND i.stock > 0 AND (i.fechaVencimiento IS NULL OR i.fechaVencimiento >= CURRENT_DATE) ORDER BY COALESCE(i.fechaVencimiento, '9999-12-31') ASC, i.fechaIngreso ASC")
    List<Inventario> buscarLotesDisponiblesParaDescuento(@Param("productoId") Long productoId);
}
