package huesitos_backend.controladores;

import huesitos_backend.entidades.Rol;
import huesitos_backend.entidades.Usuario;
import huesitos_backend.servicios.UsuarioServicio;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
// ELIMINAMOS EL @PreAuthorize GLOBAL DE LA CLASE
public class UsuarioControlador {

    private final UsuarioServicio usuarioServicio;

    // Permitimos que ADMIN y RECEPCIONISTA puedan ver la lista de usuarios (Para cargar los veterinarios)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioServicio.listarTodos());
    }

    @GetMapping("/{id}/dueño")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<?> obtenerDatosDueño(@PathVariable Long id) {
        return usuarioServicio.obtenerDatosDueño(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // LOS MÉTODOS DE CREACIÓN Y EDICIÓN SIGUEN PROTEGIDOS SOLO PARA ADMIN
    // ==========================================
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> registrarPersonal(@RequestBody SolicitudRegistro dto) {
        try {
            Usuario resultado = usuarioServicio.registrarPersonal(dto.getCorreo(), dto.getContrasena(), dto.getRol());
            return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/rol")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> cambiarRol(@PathVariable Long id, @RequestParam Rol rol) {
        try {
            Usuario usuarioActualizado = usuarioServicio.cambiarRolUsuario(id, rol);
            return ResponseEntity.ok(usuarioActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam Boolean activo) {
        try {
            Usuario resultado = usuarioServicio.cambiarEstadoUsuario(id, activo);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/credenciales")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> actualizarCredenciales(@PathVariable Long id, @RequestBody SolicitudCredenciales dto) {
        try {
            Usuario resultado = usuarioServicio.actualizarCredenciales(id, dto.getCorreo(), dto.getContrasena());
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Data
    static class SolicitudCredenciales {
        private String correo;
        private String contrasena;
    }

    @Data
    static class SolicitudRegistro {
        private String correo;
        private String contrasena;
        private Rol rol;
    }
}