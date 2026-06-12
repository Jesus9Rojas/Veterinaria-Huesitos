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
import java.util.Map; // Importación necesaria para el Map

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioControlador {

    private final UsuarioServicio usuarioServicio;

    // ==============================================================================
    // MÉTODO CORREGIDO: Ahora busca y envía el nombre real de cada usuario Y SU FOTO
    // ==============================================================================
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Map<String, Object>>> listarUsuarios() {
        List<Usuario> usuarios = usuarioServicio.listarTodos();
        List<Map<String, Object>> respuesta = new java.util.ArrayList<>();
        
        for (Usuario u : usuarios) {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", u.getId());
            map.put("correo", u.getCorreo());
            map.put("rol", u.getRol().name());
            map.put("activo", u.getActivo());
            
            // ¡LÍNEA AÑADIDA PARA QUE EL FRONTEND PUEDA MOSTRAR LAS FOTOS!
            map.put("fotoPerfilUrl", u.getFotoPerfilUrl()); 
            
            // LÓGICA MÁGICA: Buscar el nombre real según su rol
            String nombreVisible = "Usuario del Sistema";
            if (u.getRol() == Rol.CLIENTE) {
                huesitos_backend.entidades.Dueño d = usuarioServicio.obtenerDatosDueño(u.getId()).orElse(null);
                if (d != null && d.getNombreCompleto() != null) {
                    nombreVisible = d.getNombreCompleto();
                }
            } else {
                Map<String, String> p = usuarioServicio.obtenerDetallesPersonal(u.getId());
                if (p.get("nombreCompleto") != null) {
                    nombreVisible = p.get("nombreCompleto");
                }
            }
            map.put("nombreVisible", nombreVisible);
            respuesta.add(map);
        }
        
        return ResponseEntity.ok(respuesta);
    }

    // ==============================================================================
    // TODO EL RESTO DEL CÓDIGO SE MANTIENE EXACTAMENTE IGUAL AL TUYO
    // ==============================================================================

    @GetMapping("/{id}/dueño")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<?> obtenerDatosDueño(@PathVariable Long id) {
        return usuarioServicio.obtenerDatosDueño(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/personal")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> obtenerDetallesPersonal(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioServicio.obtenerDetallesPersonal(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> registrarPersonal(@RequestBody SolicitudRegistro dto) {
        try {
            Usuario resultado = usuarioServicio.registrarPersonal(
                dto.getCorreo(), dto.getContrasena(), dto.getRol(),
                dto.getNombreCompleto(), dto.getTelefono(), dto.getDni()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/personal")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> actualizarPersonal(@PathVariable Long id, @RequestBody SolicitudEdicionPersonal dto) {
        try {
            usuarioServicio.actualizarPersonal(
                id, dto.getCorreo(), dto.getContrasena(),
                dto.getNombreCompleto(), dto.getTelefono(), dto.getDni()
            );
            return ResponseEntity.ok("Ficha técnica e informativa del personal guardada con éxito");
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

    @Data
    static class SolicitudRegistro {
        private String correo;
        private String contrasena;
        private Rol rol;
        private String nombreCompleto;
        private String telefono;
        private String dni;
    }

    @Data
    static class SolicitudEdicionPersonal {
        private String correo;
        private String contrasena;
        private String nombreCompleto;
        private String telefono;
        private String dni;
    }
}