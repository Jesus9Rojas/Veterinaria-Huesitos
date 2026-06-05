package huesitos_backend.servicios;

import huesitos_backend.entidades.Actividad;
import huesitos_backend.entidades.Servicio;
import huesitos_backend.repositorios.ActividadRepositorio;
import huesitos_backend.repositorios.ServicioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicioServicio {

    private final ServicioRepositorio servicioRepositorio;

    private final ActividadRepositorio actividadRepositorio;

@Transactional
public Servicio crearServicio(Servicio servicio) {
    servicio.setActivo(true);
    Servicio guardado = servicioRepositorio.save(servicio);
    Actividad act = new Actividad();
    act.setMensaje("Se registró un nuevo servicio: " + guardado.getNombre());
    act.setTipo("SERVICIO");
    act.setFecha(java.time.LocalDateTime.now());
    actividadRepositorio.save(act);
    
    return guardado;
}

    @Transactional(readOnly = true)
    public List<Servicio> listarServiciosActivos() {
        // Modificado de findByActivoTrue() a findAll() para que el Administrador 
        // pueda listar y gestionar todos los servicios de la base de datos
        return servicioRepositorio.findAll(); 
    }

    @Transactional
    public void desactivarServicio(Long id) {
        Servicio servicio = servicioRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
        servicio.setActivo(false);
        servicioRepositorio.save(servicio);
    }

    @Transactional
    public void cambiarEstadoServicio(Long id, Boolean activo) {
        Servicio servicio = servicioRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado con ID: " + id));
        servicio.setActivo(activo);
        servicioRepositorio.save(servicio);
    }

    /**
     * Actualiza los datos editables de un servicio existente preservando la consistencia en MySQL.
     */
    @Transactional
    public Servicio actualizarServicio(Long id, Servicio datosNuevos) {
        Servicio servicioExistente = servicioRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado con ID: " + id));
        
        servicioExistente.setNombre(datosNuevos.getNombre());
        servicioExistente.setPrecio(datosNuevos.getPrecio());
        servicioExistente.setDescripcion(datosNuevos.getDescripcion());
        servicioExistente.setDuracionMinutos(datosNuevos.getDuracionMinutos());
        
        return servicioRepositorio.save(servicioExistente);
    }
}