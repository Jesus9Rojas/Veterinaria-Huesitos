package huesitos_backend.controladores;

import huesitos_backend.entidades.Pedido;
import huesitos_backend.entidades.EstadoPedido;
import huesitos_backend.entidades.DetallePedido; 
import huesitos_backend.dto.VentaMostradorDTO;
import huesitos_backend.servicios.PedidoServicio;
import huesitos_backend.repositorios.DetallePedidoRepositorio; 
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gestion-pedidos")
@RequiredArgsConstructor
public class PedidoControlador {

    private final PedidoServicio pedidoServicio;
    private final DetallePedidoRepositorio detallePedidoRepositorio; 

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Pedido>> listarPedidos() {
        return ResponseEntity.ok(pedidoServicio.listarTodosLosPedidos());
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam EstadoPedido nuevoEstado) {
        try {
            return ResponseEntity.ok(pedidoServicio.cambiarEstado(id, nuevoEstado));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/mostrador")
    public ResponseEntity<?> procesarVentaMostrador(@RequestBody VentaMostradorDTO ventaDTO) {
        return ResponseEntity.ok(pedidoServicio.procesarVentaMostrador(ventaDTO));
    }

    @GetMapping("/{id}/detalles")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<DetallePedido>> obtenerDetalles(@PathVariable Long id) {
        return ResponseEntity.ok(detallePedidoRepositorio.findByPedidoId(id));
    }
}