package huesitos_backend.controladores;

import huesitos_backend.dto.RespuestaLogin;
import huesitos_backend.entidades.Dueño;
import huesitos_backend.entidades.Usuario;
import huesitos_backend.entidades.Personal;
import huesitos_backend.repositorios.UsuarioRepositorio;
import huesitos_backend.repositorios.DueñoRepositorio;
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
    
    // Inyectamos estos dos repositorios para poder buscar el nombre real del usuario al hacer login
    private final DueñoRepositorio dueñoRepositorio;
    private final PersonalRepositorio personalRepositorio;

    @PostMapping("/registro")
    public ResponseEntity<?> registrarCliente(@RequestBody Dueño dueño) {
        try {
            Dueño resultado = autenticacionServicio.registrarCliente(dueño);
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
            
            // Lógica para buscar el nombre real de la persona
            String nombreCompleto = "Usuario del Sistema";
            
            if (usuario.getRol() == huesitos_backend.entidades.Rol.CLIENTE) {
                Optional<Dueño> dueñoOpt = dueñoRepositorio.findByUsuarioId(usuario.getId());
                if (dueñoOpt.isPresent() && dueñoOpt.get().getNombreCompleto() != null) {
                    nombreCompleto = dueñoOpt.get().getNombreCompleto();
                }
            } else {
                Optional<Personal> personalOpt = personalRepositorio.findByUsuarioId(usuario.getId());
                if (personalOpt.isPresent() && personalOpt.get().getNombreCompleto() != null) {
                    nombreCompleto = personalOpt.get().getNombreCompleto();
                }
            }

            // Ahora sí, enviamos los 6 parámetros completos que exige la RespuestaLogin
            RespuestaLogin respuesta = new RespuestaLogin(
                token, 
                usuario.getCorreo(), 
                usuario.getRol().name(),
                usuario.getId(),
                nombreCompleto,             // El nombre real que acabamos de buscar
                usuario.getFotoPerfilUrl()  // La URL de su foto de perfil
            );
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

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