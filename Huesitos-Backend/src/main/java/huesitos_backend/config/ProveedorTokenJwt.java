package huesitos_backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class ProveedorTokenJwt {

    // Clave secreta para firmar los tokens, definida en propiedades o por defecto
    private final SecretKey claveFirma;
    
    // Tiempo de expiración del token en milisegundos (por defecto 24 horas)
    private final long tiempoExpiracionMs;

    public ProveedorTokenJwt(
            @Value("${jwt.secret:ClaveSecretaSuperSeguraYMuyLargaParaFirmarLosTokensDeHuesitos2026!}") String secreto,
            @Value("${jwt.expiration:86400000}") long tiempoExpiracionMs) {
        this.claveFirma = Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
        this.tiempoExpiracionMs = tiempoExpiracionMs;
    }

    /**
     * Genera un token JWT a partir del nombre de usuario.
     */
    public String generarToken(String nombreUsuario) {
        Date ahora = new Date();
        Date fechaExpiracion = new Date(ahora.getTime() + tiempoExpiracionMs);

        return Jwts.builder()
                .subject(nombreUsuario)
                .issuedAt(ahora)
                .expiration(fechaExpiracion)
                .signWith(claveFirma)
                .compact();
    }

    /**
     * Obtiene el nombre de usuario a partir de un token JWT.
     */
    public String obtenerUsuarioDeToken(String token) {
        Claims reclamos = Jwts.parser()
                .verifyWith(claveFirma)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return reclamos.getSubject();
    }

    /**
     * Valida si un token JWT es correcto y no ha expirado.
     */
    public boolean validarToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(claveFirma)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            // Token inválido, expirado o mal firmado
            return false;
        }
    }
}
