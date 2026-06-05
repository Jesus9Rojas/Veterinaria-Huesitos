package huesitos_backend.servicios;

import huesitos_backend.entidades.Usuario;
import huesitos_backend.entidades.Rol;
import huesitos_backend.entidades.Dueño;
import huesitos_backend.entidades.Actividad;
import huesitos_backend.repositorios.UsuarioRepositorio;
import huesitos_backend.repositorios.DueñoRepositorio;
import huesitos_backend.repositorios.ActividadRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioServicio {

    private final UsuarioRepositorio usuarioRepositorio;
    private final DueñoRepositorio dueñoRepositorio;
    private final ActividadRepositorio actividadRepositorio;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return usuarioRepositorio.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Dueño> obtenerDatosDueño(Long usuarioId) {
        return dueñoRepositorio.findByUsuarioId(usuarioId);
    }

    // ==========================================
    // NUEVO MÉTODO: REGISTRO DE PERSONAL INTERNO
    // ==========================================
    @Transactional
    public Usuario registrarPersonal(String correo, String contrasena, Rol rol) {
        if (rol == Rol.CLIENTE) {
            throw new RuntimeException("No se pueden crear cuentas de clientes desde este módulo.");
        }
        
        if (usuarioRepositorio.findByCorreo(correo).isPresent()) {
            throw new RuntimeException("El correo electrónico ya se encuentra registrado en el sistema.");
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setCorreo(correo);
        nuevoUsuario.setContrasena(passwordEncoder.encode(contrasena)); // Encriptación obligatoria
        nuevoUsuario.setRol(rol);
        nuevoUsuario.setActivo(true); // Se crea activo por defecto

        Usuario guardado = usuarioRepositorio.save(nuevoUsuario);

        // Registro en auditoría
        Actividad actividad = new Actividad();
        actividad.setMensaje("Se dio de alta un nuevo personal: " + correo + " con el rol de " + rol);
        actividad.setTipo("USUARIO");
        actividad.setFecha(LocalDateTime.now());
        actividadRepositorio.save(actividad);

        return guardado;
    }

    @Transactional
    public Usuario cambiarRolUsuario(Long id, Rol nuevoRol) {
        Usuario usuario = usuarioRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        Rol rolAnterior = usuario.getRol();
        usuario.setRol(nuevoRol);
        Usuario actualizado = usuarioRepositorio.save(usuario);

        Actividad actividad = new Actividad();
        actividad.setMensaje("Se actualizó el rol de " + actualizado.getCorreo() + " de " + rolAnterior + " a " + nuevoRol);
        actividad.setTipo("USUARIO");
        actividad.setFecha(LocalDateTime.now());
        actividadRepositorio.save(actividad);

        return actualizado;
    }

    @Transactional
    public Usuario cambiarEstadoUsuario(Long id, Boolean activo) {
        Usuario usuario = usuarioRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        usuario.setActivo(activo);
        Usuario actualizado = usuarioRepositorio.save(usuario);

        Actividad actividad = new Actividad();
        actividad.setMensaje("Se modificó el estado de acceso para el usuario: " + actualizado.getCorreo() + " a " + (activo ? "ACTIVO" : "INACTIVO"));
        actividad.setTipo("USUARIO");
        actividad.setFecha(LocalDateTime.now());
        actividadRepositorio.save(actividad);

        return actualizado;
    }

    @Transactional
    public Usuario actualizarCredenciales(Long id, String nuevoCorreo, String nuevaContrasena) {
        Usuario usuario = usuarioRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        boolean huboCambios = false;

        if (nuevoCorreo != null && !nuevoCorreo.trim().isEmpty() && !nuevoCorreo.equals(usuario.getCorreo())) {
            usuario.setCorreo(nuevoCorreo);
            huboCambios = true;
        }

        if (nuevaContrasena != null && !nuevaContrasena.trim().isEmpty()) {
            usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
            huboCambios = true;
        }

        if (huboCambios) {
            Usuario guardado = usuarioRepositorio.save(usuario);
            Actividad actividad = new Actividad();
            actividad.setMensaje("Se actualizaron las credenciales de acceso de: " + guardado.getCorreo());
            actividad.setTipo("USUARIO");
            actividad.setFecha(LocalDateTime.now());
            actividadRepositorio.save(actividad);
            return guardado;
        }

        return usuario;
    }
}