package huesitos_backend.repositorios;

import huesitos_backend.entidades.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepositorio extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCorreo(String correo);

    Optional<Usuario> findByTokenRecuperacion(String tokenRecuperacion);

    java.util.List<Usuario> findByRol(huesitos_backend.entidades.Rol rol);
}
