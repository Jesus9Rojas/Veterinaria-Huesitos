package huesitos_backend.controladores;

import huesitos_backend.servicios.DueñoServicio;
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
public class DueñoControlador {

    private final DueñoServicio dueñoServicio;

    @GetMapping
    public ResponseEntity<?> obtenerTodos() {
        return ResponseEntity.ok(dueñoServicio.listarTodosDuenos());
    }

    @PostMapping
    public ResponseEntity<?> crearDueño(@RequestBody DueñoRequest request) {
        try {
            DueñoResponse guardado = dueñoServicio.guardarDueño(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarDueño(@PathVariable Long id, @RequestBody DueñoRequest request) {
        try {
            DueñoResponse actualizado = dueñoServicio.actualizarDueño(id, request);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ========================================================
    // CLASES AUXILIARES (DTO) PARA COMBINAR USUARIO + DUEÑO
    // ========================================================
    @Data
    public static class DueñoRequest {
        private String correo;
        private String contrasena;
        private String nombreCompleto;
        private String telefono;
        private String direccion;
    }

    @Data
    public static class DueñoResponse {
        private Long id;
        private Long usuarioId;
        private String correo;
        private String nombreCompleto;
        private String telefono;
        private String direccion;
        private Boolean activo;
    }
}