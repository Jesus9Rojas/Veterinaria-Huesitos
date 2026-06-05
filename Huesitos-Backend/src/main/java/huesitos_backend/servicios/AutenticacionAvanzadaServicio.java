package huesitos_backend.servicios;

import huesitos_backend.entidades.Usuario;
import huesitos_backend.repositorios.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AutenticacionAvanzadaServicio {

    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder passwordEncoder;

    /**
     * Inicia el proceso de restablecimiento de contraseña para un usuario.
     * Genera un token UUID temporal válido por 15 minutos.
     */
    @Transactional
    public void solicitarRestablecimiento(String correo) {
        Usuario usuario = usuarioRepositorio.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("No existe un usuario registrado con ese correo electrónico"));

        String token = UUID.randomUUID().toString();
        LocalDateTime expiracion = LocalDateTime.now().plusMinutes(15);

        usuario.setTokenRecuperacion(token);
        usuario.setExpiracionToken(expiracion);
        usuarioRepositorio.save(usuario);

        // Simulación de envío de correo en consola
        System.out.println("[EMAIL SIMULADOR] Para restablecer tu contraseña de Huesitos, usa el siguiente token: http://localhost:8080/api/autenticacion/restablecer?token=" + token);
    }

    /**
     * Completa el proceso de restablecimiento de contraseña actualizando la contraseña del usuario.
     * El token se limpia para que sea de un solo uso.
     */
    @Transactional
    public void completarRestablecimiento(String token, String nuevaContrasena) {
        Usuario usuario = usuarioRepositorio.findByTokenRecuperacion(token)
                .orElseThrow(() -> new RuntimeException("El token de recuperación no es válido"));

        if (usuario.getExpiracionToken() == null || usuario.getExpiracionToken().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El enlace de recuperación ha expirado. Solicita uno nuevo.");
        }

        usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        usuario.setTokenRecuperacion(null);
        usuario.setExpiracionToken(null);
        usuarioRepositorio.save(usuario);
    }
}
