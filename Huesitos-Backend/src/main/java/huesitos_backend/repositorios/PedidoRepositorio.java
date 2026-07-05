package huesitos_backend.repositorios;

import huesitos_backend.entidades.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PedidoRepositorio extends JpaRepository<Pedido, Long> {
    List<Pedido> findByClienteId(Long clienteId);
    List<Pedido> findByClienteIdOrderByFechaPedidoDesc(Long clienteId);
}
