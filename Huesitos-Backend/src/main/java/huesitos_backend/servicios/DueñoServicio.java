package huesitos_backend.servicios;

import huesitos_backend.controladores.DueñoControlador.DueñoRequest;
import huesitos_backend.controladores.DueñoControlador.DueñoResponse;
import huesitos_backend.entidades.Dueño;
import huesitos_backend.entidades.Usuario;
import huesitos_backend.entidades.Rol;
import huesitos_backend.entidades.Actividad;
import huesitos_backend.repositorios.DueñoRepositorio;
import huesitos_backend.repositorios.UsuarioRepositorio;
import huesitos_backend.repositorios.ActividadRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DueñoServicio {

    private final DueñoRepositorio dueñoRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final ActividadRepositorio actividadRepositorio;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<DueñoResponse> listarTodosDuenos() {
        return dueñoRepositorio.findAll().stream().map(d -> {
            DueñoResponse res = new DueñoResponse();
            res.setId(d.getId());
            res.setNombreCompleto(d.getNombreCompleto());
            res.setTelefono(d.getTelefono());
            res.setDireccion(d.getDireccion());
            
            // Extrae los datos de la cuenta vinculada si existe
            if (d.getUsuario() != null) {
                res.setUsuarioId(d.getUsuario().getId());
                res.setCorreo(d.getUsuario().getCorreo());
                res.setActivo(d.getUsuario().getActivo());
            }
            return res;
        }).collect(Collectors.toList());
    }

    @Transactional
    public DueñoResponse guardarDueño(DueñoRequest request) {
        if (usuarioRepositorio.findByCorreo(request.getCorreo()).isPresent()) {
            throw new RuntimeException("El correo ya se encuentra registrado en el sistema.");
        }

        // 1. Crea la cuenta de inicio de sesión
        Usuario usuario = new Usuario();
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        usuario.setRol(Rol.CLIENTE);
        usuario.setActivo(true);
        usuario = usuarioRepositorio.save(usuario);

        // 2. Crea el perfil físico de contacto y lo enlaza
        Dueño dueño = new Dueño();
        dueño.setUsuario(usuario);
        dueño.setNombreCompleto(request.getNombreCompleto());
        dueño.setTelefono(request.getTelefono());
        dueño.setDireccion(request.getDireccion());
        dueño = dueñoRepositorio.save(dueño);

        Actividad actividad = new Actividad();
        actividad.setMensaje("Se registró un nuevo cliente de forma presencial: " + dueño.getNombreCompleto());
        actividad.setTipo("USUARIO");
        actividad.setFecha(LocalDateTime.now());
        actividadRepositorio.save(actividad);

        DueñoResponse res = new DueñoResponse();
        res.setId(dueño.getId());
        res.setUsuarioId(usuario.getId());
        res.setCorreo(usuario.getCorreo());
        res.setNombreCompleto(dueño.getNombreCompleto());
        res.setTelefono(dueño.getTelefono());
        res.setDireccion(dueño.getDireccion());
        res.setActivo(usuario.getActivo());
        return res;
    }

    @Transactional
    public DueñoResponse actualizarDueño(Long id, DueñoRequest request) {
        Dueño dueño = dueñoRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        dueño.setNombreCompleto(request.getNombreCompleto());
        dueño.setTelefono(request.getTelefono());
        dueño.setDireccion(request.getDireccion());

        // Actualiza el acceso si proporcionó credenciales nuevas
        Usuario usuario = dueño.getUsuario();
        if (usuario != null) {
            if (request.getCorreo() != null && !request.getCorreo().isBlank() && !usuario.getCorreo().equals(request.getCorreo())) {
                if (usuarioRepositorio.findByCorreo(request.getCorreo()).isPresent()) {
                    throw new RuntimeException("El correo modificado ya está en uso por otra cuenta.");
                }
                usuario.setCorreo(request.getCorreo());
            }
            if (request.getContrasena() != null && !request.getContrasena().isBlank()) {
                usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
            }
            usuarioRepositorio.save(usuario);
        }

        dueño = dueñoRepositorio.save(dueño);

        Actividad actividad = new Actividad();
        actividad.setMensaje("Se modificó la ficha de contacto del cliente: " + dueño.getNombreCompleto());
        actividad.setTipo("USUARIO");
        actividad.setFecha(LocalDateTime.now());
        actividadRepositorio.save(actividad);

        DueñoResponse res = new DueñoResponse();
        res.setId(dueño.getId());
        if (usuario != null) {
            res.setUsuarioId(usuario.getId());
            res.setCorreo(usuario.getCorreo());
            res.setActivo(usuario.getActivo());
        }
        res.setNombreCompleto(dueño.getNombreCompleto());
        res.setTelefono(dueño.getTelefono());
        res.setDireccion(dueño.getDireccion());
        return res;
    }
}