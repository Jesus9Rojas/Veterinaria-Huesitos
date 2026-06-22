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
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioControlador {

    private final UsuarioServicio usuarioServicio;

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
            map.put("fotoPerfilUrl", u.getFotoPerfilUrl()); 
            
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
    // CORRECCIÓN MAESTRA: Se añade 'CLIENTE' para que el modal no dé error 403
    // ==============================================================================
    @GetMapping("/{id}/dueño")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE')")
    public ResponseEntity<?> obtenerDatosDueño(@PathVariable Long id) {
        return usuarioServicio.obtenerDatosDueño(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==============================================================================
    // PERMISO ACTUALIZADO: Se añade 'AUXILIAR_VETERINARIO' para ver su propio perfil
    // ==============================================================================
    @GetMapping("/{id}/personal")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO', 'AUXILIAR_VETERINARIO')")
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

    // ==============================================================================
    // PERMISO ACTUALIZADO: Se añade 'AUXILIAR_VETERINARIO' para editar su propio perfil
    // ==============================================================================
    @PutMapping("/{id}/personal")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO', 'AUXILIAR_VETERINARIO')")
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

    @GetMapping("/veterinarios")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE')")
    public ResponseEntity<List<Map<String, Object>>> listarVeterinariosParaCitas() {
        List<Usuario> usuarios = usuarioServicio.listarTodos();
        List<Map<String, Object>> respuesta = new java.util.ArrayList<>();
        
        for (Usuario u : usuarios) {
            // Filtramos estricta y únicamente a los veterinarios activos
            if (u.getRol() == Rol.VETERINARIO && u.getActivo()) {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", u.getId());
                
                Map<String, String> p = usuarioServicio.obtenerDetallesPersonal(u.getId());
                String nombreVisible = p.get("nombreCompleto") != null ? p.get("nombreCompleto") : "Veterinario";
                
                map.put("nombreVisible", nombreVisible);
                respuesta.add(map);
            }
        }
        
        return ResponseEntity.ok(respuesta);
    }
}