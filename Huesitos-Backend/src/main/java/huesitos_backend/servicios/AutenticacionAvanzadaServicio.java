package huesitos_backend.servicios;

import huesitos_backend.entidades.Usuario;
import huesitos_backend.repositorios.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
    
    // Inyectamos la clase encargada de enviar correos reales
    private final JavaMailSender mailSender;

    /**
     * Inicia el proceso de restablecimiento de contraseña para un usuario.
     * Genera un token UUID temporal válido por 15 minutos y envía el correo.
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

        // Llamamos al método que envía el correo real
        enviarCorreoRecuperacion(usuario.getCorreo(), token);
    }
    
    // Método privado para estructurar y enviar el correo
    private void enviarCorreoRecuperacion(String destino, String token) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destino);
        mensaje.setSubject("Recuperación de Contraseña - Veterinaria Huesitos");
        
        // Enlace que redirigirá al Frontend (React)
        String urlRecuperacion = "http://localhost:5173/restablecer-password?token=" + token;
        
        mensaje.setText("Hola,\n\nHas solicitado restablecer tu contraseña en el sistema Huesitos.\n"
                + "Haz clic en el siguiente enlace para ingresar tu nueva contraseña:\n" 
                + urlRecuperacion + "\n\n"
                + "Este enlace es válido por 15 minutos.\nSi no solicitaste este cambio, puedes ignorar este correo.");

        mailSender.send(mensaje);
    }

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