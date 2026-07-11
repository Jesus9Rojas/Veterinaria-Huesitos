package huesitos_backend.controladores;

import huesitos_backend.dto.RespuestaLogin;
import huesitos_backend.entidades.Dueno;
import huesitos_backend.entidades.Usuario;
import huesitos_backend.entidades.Personal;
import huesitos_backend.repositorios.UsuarioRepositorio;
import huesitos_backend.repositorios.DuenoRepositorio;
import huesitos_backend.repositorios.PersonalRepositorio;
import huesitos_backend.servicios.AutenticacionAvanzadaServicio;
import huesitos_backend.servicios.AutenticacionServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/autenticacion")
@RequiredArgsConstructor
public class AutenticacionControlador {

    private final AutenticacionServicio autenticacionServicio;
    private final AutenticacionAvanzadaServicio autenticacionAvanzadaServicio;
    private final UsuarioRepositorio usuarioRepositorio;

    private final DuenoRepositorio duenoRepositorio;
    private final PersonalRepositorio personalRepositorio;

    @PostMapping("/registro")
    public ResponseEntity<?> registrarCliente(@RequestBody Dueno dueno) {
        try {
            Dueno resultado = autenticacionServicio.registrarCliente(dueno);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> iniciarSesion(@RequestBody Usuario datosLogin) {
        try {
            String token = autenticacionServicio.iniciarSesion(datosLogin.getCorreo(), datosLogin.getContrasena());
            
            Usuario usuario = usuarioRepositorio.findByCorreo(datosLogin.getCorreo())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            String nombreCompleto = "Usuario del Sistema";
            
            if (usuario.getRol() == huesitos_backend.entidades.Rol.CLIENTE) {
                Optional<Dueno> duenoOpt = duenoRepositorio.findByUsuarioId(usuario.getId());
                if (duenoOpt.isPresent() && duenoOpt.get().getNombreCompleto() != null) {
                    nombreCompleto = duenoOpt.get().getNombreCompleto();
                }
            } else {
                Optional<Personal> personalOpt = personalRepositorio.findByUsuarioId(usuario.getId());
                if (personalOpt.isPresent() && personalOpt.get().getNombreCompleto() != null) {
                    nombreCompleto = personalOpt.get().getNombreCompleto();
                }
            }

            RespuestaLogin respuesta = new RespuestaLogin(
                token, 
                usuario.getCorreo(), 
                usuario.getRol().name(),
                usuario.getId(),
                nombreCompleto,         
                usuario.getFotoPerfilUrl()  
            );
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // ACTUALIZADO: Usa @RequestBody para procesar el JSON desde el Frontend de manera segura
    @PostMapping("/olvide-contrasena")
    public ResponseEntity<?> solicitarRestablecimiento(@RequestBody Map<String, String> request) {
        try {
            String correo = request.get("correo");
            autenticacionAvanzadaServicio.solicitarRestablecimiento(correo);
            
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Si el correo está registrado, se ha enviado un enlace de recuperación.");
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ACTUALIZADO: Usa @RequestBody para ocultar la contraseña en el cuerpo de la petición HTTP
    @PostMapping("/restablecer-contrasena")
    public ResponseEntity<?> completarRestablecimiento(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String nuevaContrasena = request.get("nuevaContrasena");
            
            autenticacionAvanzadaServicio.completarRestablecimiento(token, nuevaContrasena);
            
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Contraseña actualizada correctamente");
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}