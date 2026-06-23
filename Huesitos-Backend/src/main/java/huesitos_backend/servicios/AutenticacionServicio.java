package huesitos_backend.servicios;

import huesitos_backend.entidades.Dueño;
import huesitos_backend.entidades.Rol;
import huesitos_backend.entidades.Usuario;
import huesitos_backend.repositorios.DueñoRepositorio;
import huesitos_backend.repositorios.UsuarioRepositorio;
import huesitos_backend.seguridad.TokenJwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AutenticacionServicio {

    private final UsuarioRepositorio usuarioRepositorio;
    private final DueñoRepositorio dueñoRepositorio;
    private final PasswordEncoder passwordEncoder;
    private final TokenJwtUtil tokenJwtUtil;
    private final HorarioPersonalServicio horarioPersonalServicio;

    @Transactional
    public Dueño registrarCliente(Dueño dueño) {
        if (dueño.getUsuario() == null) {
            throw new RuntimeException("El dueño debe tener un usuario asociado");
        }

        Usuario usuario = dueño.getUsuario();

        if (usuarioRepositorio.findByCorreo(usuario.getCorreo()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }

        if (dueñoRepositorio.existsByTelefono(dueño.getTelefono())) {
            throw new RuntimeException("El teléfono ya está registrado");
        }

        usuario.setRol(Rol.CLIENTE);
        usuario.setActivo(true);
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));

        Usuario usuarioGuardado = usuarioRepositorio.save(usuario);
        dueño.setUsuario(usuarioGuardado);

        return dueñoRepositorio.save(dueño);
    }

    /**
     * Inicia la sesión de un usuario verificando sus credenciales y estado.
     * Genera y retorna un Token JWT de acceso si el login es exitoso.
     *
     * @param correo El correo del usuario.
     * @param contrasena La contraseña en texto plano.
     * @return El Token JWT generado.
     */
    @Transactional(readOnly = true)
    public String iniciarSesion(String correo, String contrasena) {
        Usuario usuario = usuarioRepositorio.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));

        if (usuario.getActivo() == null || !usuario.getActivo()) {
            throw new RuntimeException("El usuario se encuentra inactivo");
        }

        if (!passwordEncoder.matches(contrasena, usuario.getContrasena())) {
            throw new RuntimeException("Credenciales incorrectas");
        }

        return tokenJwtUtil.generarToken(usuario);
    }

    /**
     * Cambia el rol de un usuario identificado por su ID.
     *
     * @param usuarioId El ID del usuario.
     * @param nuevoRol El nuevo rol a asignar.
     * @return El usuario actualizado.
     */
    @Transactional
    public Usuario cambiarRolUsuario(Long usuarioId, Rol nuevoRol) {
        Usuario usuario = usuarioRepositorio.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        usuario.setRol(nuevoRol);
        return usuarioRepositorio.save(usuario);
    }

    @Transactional
    public Usuario cambiarEstadoUsuario(Long usuarioId, boolean activo) {
        Usuario usuario = usuarioRepositorio.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setActivo(activo);
        return usuarioRepositorio.save(usuario);
    }


    @Transactional
    public Usuario registrarPersonal(Usuario usuario) {
        if (usuario.getRol() == null) {
            throw new RuntimeException("El rol es obligatorio para registrar personal");
        }
        if (usuario.getRol() == Rol.CLIENTE) {
            throw new RuntimeException("No se puede registrar un cliente como personal desde este endpoint");
        }

        if (usuarioRepositorio.findByCorreo(usuario.getCorreo()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }

        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        usuario.setActivo(true);
        if (usuario.getFotoPerfilUrl() == null) {
            usuario.setFotoPerfilUrl("/uploads/defecto-usuario.png");
        }

        Usuario usuarioGuardado = usuarioRepositorio.save(usuario);

        horarioPersonalServicio.inicializarHorarioDefecto(usuarioGuardado);

        return usuarioGuardado;
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarUsuarios(Rol rol) {
        if (rol != null) {
            return usuarioRepositorio.findByRol(rol);
        }
        return usuarioRepositorio.findAll();
    }
}

