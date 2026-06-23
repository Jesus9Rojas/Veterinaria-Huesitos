package huesitos_backend.servicios;

import huesitos_backend.entidades.Usuario;
import huesitos_backend.entidades.Rol;
import huesitos_backend.entidades.Dueño;
import huesitos_backend.entidades.Personal;
import huesitos_backend.entidades.Actividad;
import huesitos_backend.repositorios.UsuarioRepositorio;
import huesitos_backend.repositorios.DueñoRepositorio;
import huesitos_backend.repositorios.PersonalRepositorio;
import huesitos_backend.repositorios.ActividadRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class UsuarioServicio {

    private final UsuarioRepositorio usuarioRepositorio;
    private final DueñoRepositorio dueñoRepositorio;
    private final PersonalRepositorio personalRepositorio;
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

    @Transactional(readOnly = true)
    public Map<String, String> obtenerDetallesPersonal(Long usuarioId) {
        Personal p = personalRepositorio.findByUsuarioId(usuarioId).orElse(null);
        Map<String, String> datos = new HashMap<>();
        if (p != null) {
            datos.put("nombreCompleto", p.getNombreCompleto());
            datos.put("telefono", p.getTelefono());
            datos.put("dni", p.getDni());
        }
        return datos;
    }

    @Transactional
    public Usuario registrarPersonal(String correo, String contrasena, Rol rol, String nombreCompleto, String telefono, String dni) {
        if (rol == Rol.CLIENTE) {
            throw new RuntimeException("No se pueden crear cuentas de clientes desde este módulo.");
        }
        
        if (usuarioRepositorio.findByCorreo(correo).isPresent()) {
            throw new RuntimeException("El correo electrónico ya se encuentra registrado en el sistema.");
        }

        if (telefono != null && !telefono.trim().isEmpty() && !telefono.matches("\\d{1,9}")) {
            throw new RuntimeException("El teléfono debe contener solo números y un máximo de 9 dígitos.");
        }
        if (dni != null && !dni.trim().isEmpty() && !dni.matches("\\d{8}")) {
            throw new RuntimeException("El DNI debe contener exactamente 8 dígitos numéricos.");
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setCorreo(correo);
        nuevoUsuario.setContrasena(passwordEncoder.encode(contrasena));
        nuevoUsuario.setRol(rol);
        nuevoUsuario.setActivo(true);
        nuevoUsuario.setFotoPerfilUrl("/uploads/defecto-usuario.png");
        Usuario guardado = usuarioRepositorio.save(nuevoUsuario);

        Personal personal = new Personal();
        personal.setNombreCompleto(nombreCompleto);
        personal.setTelefono(telefono);
        personal.setDni(dni);
        personal.setUsuario(guardado);
        personalRepositorio.save(personal);

        Actividad actividad = new Actividad();
        actividad.setMensaje("Se registró un nuevo personal técnico: " + nombreCompleto + " (" + correo + ") con el rol de " + rol);
        actividad.setTipo("USUARIO");
        actividad.setFecha(LocalDateTime.now());
        actividadRepositorio.save(actividad);

        return guardado;
    }

    @Transactional
    public void actualizarPersonal(Long usuarioId, String correo, String contrasena, String nombreCompleto, String telefono, String dni) {
        Usuario usuario = usuarioRepositorio.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));

        if (correo != null && !correo.trim().isEmpty() && !usuario.getCorreo().equals(correo)) {
            if (usuarioRepositorio.findByCorreo(correo).isPresent()) {
                throw new RuntimeException("El correo electrónico especificado ya se encuentra registrado por otro usuario.");
            }
            usuario.setCorreo(correo);
        }

        if (telefono != null && !telefono.trim().isEmpty() && !telefono.matches("\\d{1,9}")) {
            throw new RuntimeException("El teléfono debe contener solo números y un máximo de 9 dígitos.");
        }
        if (dni != null && !dni.trim().isEmpty() && !dni.matches("\\d{8}")) {
            throw new RuntimeException("El DNI debe contener exactamente 8 dígitos numéricos.");
        }

        if (contrasena != null && !contrasena.trim().isEmpty()) {
            usuario.setContrasena(passwordEncoder.encode(contrasena));
        }
        usuarioRepositorio.save(usuario);

        Personal personal = personalRepositorio.findByUsuarioId(usuarioId)
                .orElse(new Personal());
        
        personal.setUsuario(usuario);
        personal.setNombreCompleto(nombreCompleto);
        personal.setTelefono(telefono);
        personal.setDni(dni);
        personalRepositorio.save(personal);

        Actividad actividad = new Actividad();
        actividad.setMensaje("Se modificó la ficha informativa y de acceso del colaborador: " + nombreCompleto);
        actividad.setTipo("USUARIO");
        actividad.setFecha(LocalDateTime.now());
        actividadRepositorio.save(actividad);
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
            if (usuarioRepositorio.findByCorreo(nuevoCorreo).isPresent()) {
                throw new RuntimeException("El correo ya está en uso");
            }
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