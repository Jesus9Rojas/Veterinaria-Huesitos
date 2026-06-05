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

    /**
     * Registra un nuevo cliente en el sistema.
     * Guarda el usuario asociado y luego el dueño.
     */
    @Transactional
    public Dueño registrarCliente(Dueño dueño) {
        if (dueño.getUsuario() == null) {
            throw new RuntimeException("El dueño debe tener un usuario asociado");
        }

        Usuario usuario = dueño.getUsuario();

        // 1. Verificar si el correo ya está registrado
        if (usuarioRepositorio.findByCorreo(usuario.getCorreo()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }

        // 2. Verificar si el teléfono ya está registrado
        if (dueñoRepositorio.existsByTelefono(dueño.getTelefono())) {
            throw new RuntimeException("El teléfono ya está registrado");
        }

        // 3. Forzar rol CLIENTE, estado activo = true y encriptar contraseña
        usuario.setRol(Rol.CLIENTE);
        usuario.setActivo(true);
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));

        // 4. Guardar primero el Usuario en su repositorio
        Usuario usuarioGuardado = usuarioRepositorio.save(usuario);
        dueño.setUsuario(usuarioGuardado);

        // 5. Guardar el Dueño en su repositorio
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
        // 1. Buscar al usuario por correo
        Usuario usuario = usuarioRepositorio.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));

        // 2. Verificar si está activo
        if (usuario.getActivo() == null || !usuario.getActivo()) {
            throw new RuntimeException("El usuario se encuentra inactivo");
        }

        // 3. Verificar la contraseña encriptada
        if (!passwordEncoder.matches(contrasena, usuario.getContrasena())) {
            throw new RuntimeException("Credenciales incorrectas");
        }

        // 4. Generar y retornar el token JWT
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

    /**
     * Activa o desactiva la cuenta de un usuario.
     */
    @Transactional
    public Usuario cambiarEstadoUsuario(Long usuarioId, boolean activo) {
        Usuario usuario = usuarioRepositorio.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setActivo(activo);
        return usuarioRepositorio.save(usuario);
    }

    /**
     * Registra un nuevo miembro del personal (Administrador, Veterinario o Recepcionista).
     */
    @Transactional
    public Usuario registrarPersonal(Usuario usuario) {
        if (usuario.getRol() == null) {
            throw new RuntimeException("El rol es obligatorio para registrar personal");
        }
        if (usuario.getRol() == Rol.CLIENTE) {
            throw new RuntimeException("No se puede registrar un cliente como personal desde este endpoint");
        }

        // 1. Verificar si el correo ya está registrado
        if (usuarioRepositorio.findByCorreo(usuario.getCorreo()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }

        // 2. Encriptar contraseña, marcar activo y establecer foto por defecto si no tiene
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        usuario.setActivo(true);
        if (usuario.getFotoPerfilUrl() == null) {
            usuario.setFotoPerfilUrl("/uploads/defecto-usuario.png");
        }

        Usuario usuarioGuardado = usuarioRepositorio.save(usuario);

        // 3. Inicializar el horario por defecto para el nuevo personal
        horarioPersonalServicio.inicializarHorarioDefecto(usuarioGuardado);

        return usuarioGuardado;
    }

    /**
     * Lista todos los usuarios. Permite filtrar opcionalmente por rol.
     */
    @Transactional(readOnly = true)
    public List<Usuario> listarUsuarios(Rol rol) {
        if (rol != null) {
            return usuarioRepositorio.findByRol(rol);
        }
        return usuarioRepositorio.findAll();
    }
}

