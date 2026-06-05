package huesitos_backend.config;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class ServicioDetallesUsuario implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Implementación inicial en memoria para validar la arquitectura base.
        // En fases posteriores se consultará a la base de datos a través de la entidad Usuario.
        if ("admin".equals(username)) {
            return new User(
                    "admin",
                    // Contraseña encriptada correspondiente a "admin" (BCrypt)
                    "$2a$10$8.UnVuG9HHgffUDAlk8qMuyShR3hD68c./2yO645bGN.1Y.212vJq",
                    new ArrayList<>()
            );
        }
        throw new UsernameNotFoundException("Usuario no encontrado con nombre: " + username);
    }
}
