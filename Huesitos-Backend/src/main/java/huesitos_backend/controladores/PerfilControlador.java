package huesitos_backend.controladores;

import huesitos_backend.entidades.Mascota;
import huesitos_backend.entidades.Usuario;
import huesitos_backend.repositorios.MascotaRepositorio;
import huesitos_backend.repositorios.UsuarioRepositorio;
import huesitos_backend.servicios.StorageService;
import huesitos_backend.servicios.UsuarioServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/perfiles")
@RequiredArgsConstructor
public class PerfilControlador {

    private final StorageService storageService;
    private final UsuarioRepositorio usuarioRepositorio;
    private final MascotaRepositorio mascotaRepositorio;
    private final UsuarioServicio usuarioServicio;


    @PostMapping("/usuario/{id}/foto")
    public ResponseEntity<?> subirFotoUsuario(@PathVariable Long id, @RequestParam("archivo") MultipartFile archivo) {
        try {
            Usuario usuario = usuarioRepositorio.findById(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

            String urlFoto = storageService.comprimirYGuardarFoto(archivo, "usuario");
            usuario.setFotoPerfilUrl(urlFoto);
            usuarioRepositorio.save(usuario);

            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("fotoPerfilUrl", urlFoto);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/mascota/{id}/foto")
    public ResponseEntity<?> subirFotoMascota(@PathVariable Long id, @RequestParam("archivo") MultipartFile archivo) {
        try {
            Mascota mascota = mascotaRepositorio.findById(id)
                    .orElseThrow(() -> new RuntimeException("Mascota no encontrada con ID: " + id));

            String urlFoto = storageService.comprimirYGuardarFoto(archivo, "mascota");
            mascota.setFotoUrl(urlFoto);
            mascotaRepositorio.save(mascota);

            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("fotoUrl", urlFoto);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/usuario/{id}")
    public ResponseEntity<?> obtenerPerfilUsuario(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioRepositorio.findById(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            Map<String, Object> perfil = new HashMap<>();
            perfil.put("id", usuario.getId());
            perfil.put("correo", usuario.getCorreo());
            perfil.put("rol", usuario.getRol().name());
            perfil.put("fotoPerfilUrl", usuario.getFotoPerfilUrl());
            
            return ResponseEntity.ok(perfil);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }


    @PatchMapping("/usuario/{id}/contrasena")
    public ResponseEntity<?> cambiarMiContrasena(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String nuevaContrasena = payload.get("nuevaContrasena");
            if (nuevaContrasena == null || nuevaContrasena.trim().isEmpty()) {
                throw new RuntimeException("La nueva contraseña no puede estar vacía");
            }
            
            usuarioServicio.actualizarCredenciales(id, null, nuevaContrasena);
            
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Contraseña actualizada exitosamente");
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}