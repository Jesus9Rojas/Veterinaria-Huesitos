package huesitos_backend.servicios;

import huesitos_backend.entidades.*;
import huesitos_backend.repositorios.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TiendaOnlineServicio {

    private final CarritoItemRepositorio carritoItemRepositorio;
    private final PedidoRepositorio pedidoRepositorio;
    private final DetallePedidoRepositorio detallePedidoRepositorio;
    private final InventarioRepositorio inventarioRepositorio;
    private final ProductoRepositorio productoRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;

    // --- MÉTODOS DEL CARRITO ---

    @Transactional
    public CarritoItem agregarProductoAlCarrito(Long usuarioId, Long productoId, Integer cantidad) {
        if (cantidad == null || cantidad <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a cero");
        }

        Usuario cliente = usuarioRepositorio.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Producto producto = productoRepositorio.findById(productoId)
                .filter(Producto::getActivo)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado o inactivo"));

        // Validar stock disponible general antes de agregar
        Integer stockDisponible = inventarioRepositorio.obtenerStockDisponible(productoId);
        if (stockDisponible < cantidad) {
            throw new RuntimeException("Stock insuficiente para el producto: " + producto.getNombre() + " (Disponible: " + stockDisponible + ")");
        }

        Optional<CarritoItem> itemExistente = carritoItemRepositorio.findByClienteIdAndProductoId(usuarioId, productoId);

        CarritoItem item;
        if (itemExistente.isPresent()) {
            item = itemExistente.get();
            int nuevaCantidad = item.getCantidad() + cantidad;
            if (stockDisponible < nuevaCantidad) {
                throw new RuntimeException("No se puede agregar esa cantidad. Stock total insuficiente (Disponible: " + stockDisponible + ")");
            }
            item.setCantidad(nuevaCantidad);
        } else {
            item = new CarritoItem();
            item.setCliente(cliente);
            item.setProducto(producto);
            item.setCantidad(cantidad);
        }

        return carritoItemRepositorio.save(item);
    }

    @Transactional
    public CarritoItem modificarCantidadCarrito(Long itemId, Integer cantidad) {
        CarritoItem item = carritoItemRepositorio.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Ítem del carrito no encontrado"));

        if (cantidad == null || cantidad <= 0) {
            carritoItemRepositorio.delete(item);
            return null;
        }

        // Validar stock disponible general
        Integer stockDisponible = inventarioRepositorio.obtenerStockDisponible(item.getProducto().getId());
        if (stockDisponible < cantidad) {
            throw new RuntimeException("Stock insuficiente para el producto: " + item.getProducto().getNombre() + " (Disponible: " + stockDisponible + ")");
        }

        item.setCantidad(cantidad);
        return carritoItemRepositorio.save(item);
    }

    @Transactional(readOnly = true)
    public List<CarritoItem> obtenerCarritoPorCliente(Long usuarioId) {
        return carritoItemRepositorio.findByClienteId(usuarioId);
    }

    @Transactional
    public void eliminarItemCarrito(Long itemId) {
        if (!carritoItemRepositorio.existsById(itemId)) {
            throw new RuntimeException("Ítem del carrito no encontrado");
        }
        carritoItemRepositorio.deleteById(itemId);
    }

    @Transactional
    public void vaciarCarrito(Long usuarioId) {
        carritoItemRepositorio.deleteByClienteId(usuarioId);
    }

    // --- MÉTODOS DE PEDIDOS Y CHECKOUT ---

    @Transactional
    public Pedido realizarCheckout(Long usuarioId) {
        List<CarritoItem> items = carritoItemRepositorio.findByClienteId(usuarioId);
        if (items.isEmpty()) {
            throw new RuntimeException("El carrito está vacío. No se puede realizar el checkout");
        }

        Usuario cliente = usuarioRepositorio.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        BigDecimal total = BigDecimal.ZERO;

        // 1. Validar y descontar stock por cada producto usando lógica FEFO
        for (CarritoItem item : items) {
            Producto producto = item.getProducto();
            int cantidadRequerida = item.getCantidad();

            // Validar stock total disponible
            Integer stockTotal = inventarioRepositorio.obtenerStockDisponible(producto.getId());
            if (stockTotal < cantidadRequerida) {
                throw new RuntimeException("Stock insuficiente para el producto '" + producto.getNombre() + "'. Requerido: " + cantidadRequerida + ", Disponible: " + stockTotal);
            }

            // Descontar por lotes (FEFO: vencimiento más cercano primero, luego fecha de ingreso más antigua)
            List<Inventario> lotes = inventarioRepositorio.buscarLotesDisponiblesParaDescuento(producto.getId());
            int pendienteDescontar = cantidadRequerida;

            for (Inventario lote : lotes) {
                int stockLote = lote.getStock();
                int aDescontar = Math.min(pendienteDescontar, stockLote);

                lote.setStock(stockLote - aDescontar);
                pendienteDescontar -= aDescontar;

                inventarioRepositorio.save(lote);

                if (pendienteDescontar == 0) {
                    break;
                }
            }

            if (pendienteDescontar > 0) {
                throw new RuntimeException("Error al descontar stock por lotes para el producto: " + producto.getNombre());
            }

            // Acumular al total del pedido
            BigDecimal precioUnitario = producto.getPrecio();
            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad()));
            total = total.add(subtotal);
        }

        // 2. Crear y guardar el Pedido
        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setFechaPedido(LocalDateTime.now());
        pedido.setTotal(total);
        pedido.setEstadoPedido(EstadoPedido.PENDIENTE);
        Pedido pedidoGuardado = pedidoRepositorio.save(pedido);

        // 3. Crear y guardar los detalles del pedido
        for (CarritoItem item : items) {
            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedidoGuardado);
            detalle.setProducto(item.getProducto());
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(item.getProducto().getPrecio());
            detallePedidoRepositorio.save(detalle);
        }

        // 4. Vaciar el carrito
        carritoItemRepositorio.deleteByClienteId(usuarioId);

        return pedidoGuardado;
    }

    @Transactional(readOnly = true)
    public List<Pedido> obtenerPedidosPorCliente(Long usuarioId) {
        return pedidoRepositorio.findByClienteIdOrderByFechaPedidoDesc(usuarioId);
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarTodosLosPedidos() {
        return pedidoRepositorio.findAll();
    }

    @Transactional
    public Pedido cambiarEstadoPedido(Long pedidoId, EstadoPedido nuevoEstado) {
        Pedido pedido = pedidoRepositorio.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        pedido.setEstadoPedido(nuevoEstado);
        return pedidoRepositorio.save(pedido);
    }
}
