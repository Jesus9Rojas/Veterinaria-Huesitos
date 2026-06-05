package huesitos_backend.controladores;

import huesitos_backend.entidades.*;
import huesitos_backend.repositorios.UsuarioRepositorio;
import huesitos_backend.servicios.TiendaOnlineServicio;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class TiendaOnlineControlador {

    private final TiendaOnlineServicio tiendaOnlineServicio;
    private final UsuarioRepositorio usuarioRepositorio;

    // --- ENDPOINTS DEL CARRITO ---

    @GetMapping("/carrito")
    public ResponseEntity<?> obtenerCarrito(Principal principal) {
        try {
            Usuario usuario = obtenerUsuarioAutenticado(principal);
            List<CarritoItem> items = tiendaOnlineServicio.obtenerCarritoPorCliente(usuario.getId());
            return ResponseEntity.ok(items);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/carrito")
    public ResponseEntity<?> agregarAlCarrito(@RequestBody AgregarAlCarritoDTO request, Principal principal) {
        try {
            Usuario usuario = obtenerUsuarioAutenticado(principal);
            CarritoItem item = tiendaOnlineServicio.agregarProductoAlCarrito(
                    usuario.getId(), 
                    request.getProductoId(), 
                    request.getCantidad()
            );
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/carrito/{itemId}")
    public ResponseEntity<?> modificarCantidadCarrito(@PathVariable Long itemId, @RequestParam Integer cantidad) {
        try {
            CarritoItem item = tiendaOnlineServicio.modificarCantidadCarrito(itemId, cantidad);
            if (item == null) {
                return ResponseEntity.ok("Ítem eliminado del carrito (cantidad <= 0)");
            }
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/carrito/{itemId}")
    public ResponseEntity<?> eliminarItemCarrito(@PathVariable Long itemId) {
        try {
            tiendaOnlineServicio.eliminarItemCarrito(itemId);
            return ResponseEntity.ok("Ítem eliminado del carrito");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/carrito")
    public ResponseEntity<?> vaciarCarrito(Principal principal) {
        try {
            Usuario usuario = obtenerUsuarioAutenticado(principal);
            tiendaOnlineServicio.vaciarCarrito(usuario.getId());
            return ResponseEntity.ok("Carrito vaciado con éxito");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- ENDPOINTS DE PEDIDOS ---

    @PostMapping("/pedidos/checkout")
    public ResponseEntity<?> realizarCheckout(Principal principal) {
        try {
            Usuario usuario = obtenerUsuarioAutenticado(principal);
            Pedido pedido = tiendaOnlineServicio.realizarCheckout(usuario.getId());
            return ResponseEntity.ok(pedido);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/pedidos/cliente/{usuarioId}")
    public ResponseEntity<?> obtenerPedidosPorCliente(@PathVariable Long usuarioId) {
        try {
            List<Pedido> pedidos = tiendaOnlineServicio.obtenerPedidosPorCliente(usuarioId);
            return ResponseEntity.ok(pedidos);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/pedidos")
    public ResponseEntity<?> listarTodosLosPedidos() {
        try {
            List<Pedido> pedidos = tiendaOnlineServicio.listarTodosLosPedidos();
            return ResponseEntity.ok(pedidos);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/pedidos/{id}/estado")
    public ResponseEntity<?> cambiarEstadoPedido(@PathVariable Long id, @RequestParam EstadoPedido estado) {
        try {
            Pedido pedido = tiendaOnlineServicio.cambiarEstadoPedido(id, estado);
            return ResponseEntity.ok(pedido);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- MÉTODO HELPER ---

    private Usuario obtenerUsuarioAutenticado(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Usuario no autenticado");
        }
        return usuarioRepositorio.findByCorreo(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado en base de datos"));
    }

    // --- DTO ESTÁTICO ---

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgregarAlCarritoDTO {
        private Long productoId;
        private Integer cantidad;
    }
}
