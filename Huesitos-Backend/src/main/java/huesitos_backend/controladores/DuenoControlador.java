package huesitos_backend.controladores;

import huesitos_backend.servicios.DuenoServicio;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/duenos")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
public class DuenoControlador {

    private final DuenoServicio duenoServicio;

    @GetMapping
    public ResponseEntity<?> obtenerTodos() {
        return ResponseEntity.ok(duenoServicio.listarTodosDuenos());
    }

    @PostMapping
    public ResponseEntity<?> crearDueno(@RequestBody DuenoRequest request) {
        try {
            DuenoResponse guardado = duenoServicio.guardarDueno(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarDueno(@PathVariable Long id, @RequestBody DuenoRequest request) {
        try {
            DuenoResponse actualizado = duenoServicio.actualizarDueno(id, request);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Data
    public static class DuenoRequest {
        private String correo;
        private String contrasena;
        private String nombreCompleto;
        private String telefono;
        private String direccion;
    }

    @Data
    public static class DuenoResponse {
        private Long id;
        private Long usuarioId;
        private String correo;
        private String nombreCompleto;
        private String telefono;
        private String direccion;
        private Boolean activo;
    }
}