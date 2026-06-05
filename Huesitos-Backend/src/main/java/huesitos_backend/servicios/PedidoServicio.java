package huesitos_backend.servicios;

import huesitos_backend.dto.VentaMostradorDTO;
import huesitos_backend.entidades.*;
import huesitos_backend.repositorios.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoServicio {

    private final PedidoRepositorio pedidoRepositorio;
    private final DetallePedidoRepositorio detallePedidoRepositorio;
    private final ProductoRepositorio productoRepositorio;
    private final TransaccionRepositorio transaccionRepositorio;
    private final InventarioRepositorio inventarioRepositorio; 
    private final UsuarioRepositorio usuarioRepositorio; // INYECTADO PARA CLIENTES

    @Transactional(readOnly = true)
    public List<Pedido> listarTodosLosPedidos() {
        return pedidoRepositorio.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @Transactional
    public Pedido cambiarEstado(Long id, EstadoPedido nuevoEstado) {
        Pedido pedido = pedidoRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        pedido.setEstadoPedido(nuevoEstado); 
        return pedidoRepositorio.save(pedido);
    }

    @Transactional
    public Pedido procesarVentaMostrador(VentaMostradorDTO ventaDTO) {
        Pedido pedido = new Pedido();
        pedido.setEstadoPedido(EstadoPedido.ENTREGADO); 
        pedido.setFechaPedido(LocalDateTime.now());
        
        // ¡SOLUCIÓN AL ERROR 400! Ponemos el total en 0 temporalmente
        pedido.setTotal(BigDecimal.ZERO); 
        
        // ¡SOLUCIÓN PARA ANÓNIMOS VS REGISTRADOS!
        if (ventaDTO.getUsuarioId() != null) {
            Usuario cliente = usuarioRepositorio.findById(ventaDTO.getUsuarioId())
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
            pedido.setCliente(cliente);
        }

        // Se guarda el pedido base
        pedido = pedidoRepositorio.save(pedido);
        BigDecimal totalVenta = BigDecimal.ZERO;

        for (VentaMostradorDTO.ItemVentaDTO item : ventaDTO.getItems()) {
            Producto producto = productoRepositorio.findById(item.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            int cantidadRequerida = item.getCantidad();
            Integer stockTotal = inventarioRepositorio.obtenerStockDisponible(producto.getId());
            if (stockTotal < cantidadRequerida) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
            }

            List<Inventario> lotes = inventarioRepositorio.buscarLotesDisponiblesParaDescuento(producto.getId());
            int pendienteDescontar = cantidadRequerida;
            
            for (Inventario lote : lotes) {
                int stockLote = lote.getStock();
                int aDescontar = Math.min(pendienteDescontar, stockLote);
                
                lote.setStock(stockLote - aDescontar);
                pendienteDescontar -= aDescontar;
                inventarioRepositorio.save(lote);
                
                if (pendienteDescontar == 0) break;
            }

            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(cantidadRequerida);
            detalle.setPrecioUnitario(producto.getPrecio());
            detallePedidoRepositorio.save(detalle);

            BigDecimal subtotal = producto.getPrecio().multiply(new BigDecimal(cantidadRequerida));
            totalVenta = totalVenta.add(subtotal);
        }

        // Ahora sí, guardamos el Total real definitivo
        pedido.setTotal(totalVenta);
        pedido = pedidoRepositorio.save(pedido);

        Transaccion transaccion = new Transaccion();
        transaccion.setMonto(totalVenta);
        transaccion.setEstadoPago(EstadoPago.APROBADO);
        transaccion.setMedioPago(ventaDTO.getMedioPago());
        
        String refFinal = "Venta POS #" + pedido.getId();
        if (ventaDTO.getReferencia() != null && !ventaDTO.getReferencia().isEmpty()) {
            refFinal += " | Ref: " + ventaDTO.getReferencia();
        }
        transaccion.setReferenciaPago(refFinal); 
        transaccion.setFechaPago(LocalDateTime.now());
        transaccion.setPedido(pedido);
        transaccionRepositorio.save(transaccion);

        return pedido;
    }
}