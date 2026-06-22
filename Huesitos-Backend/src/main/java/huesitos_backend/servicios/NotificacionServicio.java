package huesitos_backend.servicios;

import huesitos_backend.entidades.Notificacion;
import huesitos_backend.repositorios.NotificacionRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionServicio {

    private final NotificacionRepositorio notificacionRepositorio;

    @Transactional(readOnly = true)
    public List<Notificacion> obtenerPorUsuario(Long usuarioId) {
        List<Notificacion> lista = notificacionRepositorio.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId);
        // Si no hay resultados, devolvemos una lista vacía en vez de null para evitar el 404
        if (lista == null) {
            return new java.util.ArrayList<>();
        }
        return lista;
    }

    @Transactional
    public void marcarComoLeida(Long id) {
        Notificacion notificacion = notificacionRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        notificacion.setLeida(true);
        notificacionRepositorio.save(notificacion);
    }

    @Transactional
    public void eliminarNotificacion(Long id) {
        if (notificacionRepositorio.existsById(id)) {
            notificacionRepositorio.deleteById(id);
        }
    }

    @Transactional
    public void limpiarTodas(Long usuarioId) {
        notificacionRepositorio.deleteByUsuarioId(usuarioId);
    }
}