package huesitos_backend.controladores;

import huesitos_backend.dto.RespuestaLogin;
import huesitos_backend.entidades.Dueño;
import huesitos_backend.entidades.Usuario;
import huesitos_backend.repositorios.UsuarioRepositorio;
import huesitos_backend.servicios.AutenticacionAvanzadaServicio;
import huesitos_backend.servicios.AutenticacionServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/autenticacion")
@RequiredArgsConstructor
public class AutenticacionControlador {

    private final AutenticacionServicio autenticacionServicio;
    private final AutenticacionAvanzadaServicio autenticacionAvanzadaServicio;
    private final UsuarioRepositorio usuarioRepositorio;

    /**
     * Endpoint para registrar un nuevo cliente (Dueño + Usuario).
     */
    @PostMapping("/registro")
    public ResponseEntity<?> registrarCliente(@RequestBody Dueño dueño) {
        try {
            Dueño resultado = autenticacionServicio.registrarCliente(dueño);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Endpoint para iniciar sesión.
     */
    @PostMapping("/login")
    public ResponseEntity<?> iniciarSesion(@RequestBody Usuario datosLogin) {
        try {
            String token = autenticacionServicio.iniciarSesion(datosLogin.getCorreo(), datosLogin.getContrasena());
            
            Usuario usuario = usuarioRepositorio.findByCorreo(datosLogin.getCorreo())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            RespuestaLogin respuesta = new RespuestaLogin(token, usuario.getCorreo(), usuario.getRol().name());
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    /**
     * Endpoint público para solicitar el restablecimiento de contraseña.
     */
    @PostMapping("/olvide-contrasena")
    public ResponseEntity<?> solicitarRestablecimiento(@RequestParam String correo) {
        try {
            autenticacionAvanzadaServicio.solicitarRestablecimiento(correo);
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Se ha generado el enlace de recuperación (revisa la consola del backend)");
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Endpoint público para completar el restablecimiento de contraseña.
     */
    @PostMapping("/restablecer-contrasena")
    public ResponseEntity<?> completarRestablecimiento(@RequestParam String token, @RequestParam String nuevaContrasena) {
        try {
            autenticacionAvanzadaServicio.completarRestablecimiento(token, nuevaContrasena);
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Contraseña actualizada correctamente");
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

