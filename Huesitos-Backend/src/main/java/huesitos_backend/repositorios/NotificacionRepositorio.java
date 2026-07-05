package huesitos_backend.repositorios;

import huesitos_backend.entidades.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacionRepositorio extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);
    void deleteByUsuarioId(Long usuarioId);
}