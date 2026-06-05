package huesitos_backend.repositorios;

import huesitos_backend.entidades.CarritoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarritoItemRepositorio extends JpaRepository<CarritoItem, Long> {
    List<CarritoItem> findByClienteId(Long clienteId);
    Optional<CarritoItem> findByClienteIdAndProductoId(Long clienteId, Long productoId);
    void deleteByClienteId(Long clienteId);
}
