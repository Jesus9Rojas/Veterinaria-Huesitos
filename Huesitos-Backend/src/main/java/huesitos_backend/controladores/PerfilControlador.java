package huesitos_backend.controladores;

import huesitos_backend.entidades.Mascota;
import huesitos_backend.entidades.Usuario;
import huesitos_backend.repositorios.MascotaRepositorio;
import huesitos_backend.repositorios.UsuarioRepositorio;
import huesitos_backend.servicios.StorageService;
import lombok.RequiredArgsConstructor;
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

    /**
     * Sube y comprime la foto de perfil de un usuario.
     */
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

    /**
     * Sube y comprime la foto de una mascota.
     */
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
}
