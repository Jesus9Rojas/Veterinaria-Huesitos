package huesitos_backend.seguridad;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.auth0.jwt.exceptions.JWTVerificationException;
import huesitos_backend.entidades.Usuario;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class TokenJwtUtil {

    private final String claveSecreta = "HuesitosClaveSecretaSuperSegura2026_VeterinariaIca";
    private final String emisor = "huesitos-backend";

    /**
     * Genera un token JWT para un usuario utilizando la SDK de Auth0.
     *
     * @param usuario El usuario para el cual se genera el token.
     * @return El token JWT generado y firmado.
     */
    public String generarToken(Usuario usuario) {
        Algorithm algoritmo = Algorithm.HMAC256(claveSecreta);
        
        Date ahora = new Date();
        Date fechaExpiracion = new Date(ahora.getTime() + 24L * 60 * 60 * 1000); // 24 horas en el futuro

        return JWT.create()
                .withIssuer(emisor)
                .withSubject(usuario.getCorreo())
                .withClaim("rol", usuario.getRol().name())
                .withIssuedAt(ahora)
                .withExpiresAt(fechaExpiracion)
                .sign(algoritmo);
    }

    /**
     * Verifica la autenticidad de un token JWT recibido.
     * Si el token es válido, retorna el correo (Subject).
     * Si expiró, fue manipulado o es inválido, retorna null.
     *
     * @param token El token JWT a validar.
     * @return El correo del usuario (Subject) o null si es inválido.
     */
    public String validarToken(String token) {
        try {
            Algorithm algoritmo = Algorithm.HMAC256(claveSecreta);
            JWTVerifier verifier = JWT.require(algoritmo)
                    .withIssuer(emisor)
                    .build();
            
            DecodedJWT jwtDecodificado = verifier.verify(token);
            return jwtDecodificado.getSubject();
        } catch (JWTVerificationException e) {
            // Retorna null si el token es inválido, expiró o fue manipulado
            return null;
        }
    }
}
