package huesitos_backend.servicios;

import huesitos_backend.controladores.DuenoControlador.DuenoRequest;
import huesitos_backend.controladores.DuenoControlador.DuenoResponse;
import huesitos_backend.entidades.Dueno;
import huesitos_backend.entidades.Usuario;
import huesitos_backend.entidades.Rol;
import huesitos_backend.entidades.Actividad;
import huesitos_backend.repositorios.DuenoRepositorio;
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
public class DuenoServicio {

    private final DuenoRepositorio duenoRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final ActividadRepositorio actividadRepositorio;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<DuenoResponse> listarTodosDuenos() {
        return duenoRepositorio.findAll().stream().map(d -> {
            DuenoResponse res = new DuenoResponse();
            res.setId(d.getId());
            res.setNombreCompleto(d.getNombreCompleto());
            res.setTelefono(d.getTelefono());
            res.setDireccion(d.getDireccion());
            
            if (d.getUsuario() != null) {
                res.setUsuarioId(d.getUsuario().getId());
                res.setCorreo(d.getUsuario().getCorreo());
                res.setActivo(d.getUsuario().getActivo());
            }
            return res;
        }).collect(Collectors.toList());
    }

    @Transactional
    public DuenoResponse guardarDueno(DuenoRequest request) {
        if (usuarioRepositorio.findByCorreo(request.getCorreo()).isPresent()) {
            throw new RuntimeException("El correo ya se encuentra registrado en el sistema.");
        }

        Usuario usuario = new Usuario();
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        usuario.setRol(Rol.CLIENTE);
        usuario.setActivo(true);
        usuario = usuarioRepositorio.save(usuario);

        Dueno dueno = new Dueno();
        dueno.setUsuario(usuario);
        dueno.setNombreCompleto(request.getNombreCompleto());
        dueno.setTelefono(request.getTelefono());
        dueno.setDireccion(request.getDireccion());
        dueno = duenoRepositorio.save(dueno);

        Actividad actividad = new Actividad();
        actividad.setMensaje("Se registró un nuevo cliente de forma presencial: " + dueno.getNombreCompleto());
        actividad.setTipo("USUARIO");
        actividad.setFecha(LocalDateTime.now());
        actividadRepositorio.save(actividad);

        DuenoResponse res = new DuenoResponse();
        res.setId(dueno.getId());
        res.setUsuarioId(usuario.getId());
        res.setCorreo(usuario.getCorreo());
        res.setNombreCompleto(dueno.getNombreCompleto());
        res.setTelefono(dueno.getTelefono());
        res.setDireccion(dueno.getDireccion());
        res.setActivo(usuario.getActivo());
        return res;
    }

    @Transactional
    public DuenoResponse actualizarDueno(Long id, DuenoRequest request) {
        Dueno dueno = duenoRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        dueno.setNombreCompleto(request.getNombreCompleto());
        dueno.setTelefono(request.getTelefono());
        dueno.setDireccion(request.getDireccion());

        Usuario usuario = dueno.getUsuario();
        if (usuario != null) {
            if (request.getCorreo() != null && !request.getCorreo().isBlank() && !usuario.getCorreo().equals(request.getCorreo())) {
                if (usuarioRepositorio.findByCorreo(request.getCorreo()).isPresent()) {
                    throw new RuntimeException("El correo modificado ya está en uso por otra cuenta.");
                }
                usuario.setCorreo(request.getCorreo());
                usuarioRepositorio.save(usuario);
            }
        }

        dueno = duenoRepositorio.save(dueno);

        Actividad actividad = new Actividad();
        actividad.setMensaje("Se modificó la ficha de contacto del cliente: " + dueno.getNombreCompleto());
        actividad.setTipo("USUARIO");
        actividad.setFecha(LocalDateTime.now());
        actividadRepositorio.save(actividad);

        DuenoResponse res = new DuenoResponse();
        res.setId(dueno.getId());
        if (usuario != null) {
            res.setUsuarioId(usuario.getId());
            res.setCorreo(usuario.getCorreo());
            res.setActivo(usuario.getActivo());
        }
        res.setNombreCompleto(dueno.getNombreCompleto());
        res.setTelefono(dueno.getTelefono());
        res.setDireccion(dueno.getDireccion());
        return res;
    }
}