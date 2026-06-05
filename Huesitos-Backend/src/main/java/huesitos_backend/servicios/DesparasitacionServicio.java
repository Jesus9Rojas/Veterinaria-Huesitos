package huesitos_backend.servicios;

import huesitos_backend.entidades.Desparasitacion;
import huesitos_backend.entidades.Mascota;
import huesitos_backend.repositorios.DesparasitacionRepositorio;
import huesitos_backend.repositorios.MascotaRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DesparasitacionServicio {

    private final DesparasitacionRepositorio desparasitacionRepositorio;
    private final MascotaRepositorio mascotaRepositorio;

    @Transactional
    public Desparasitacion registrarDesparasitacion(Desparasitacion desparasitacion) {
        if (desparasitacion.getMascota() == null || desparasitacion.getMascota().getId() == null) {
            throw new RuntimeException("La mascota asociada es obligatoria");
        }
        if (desparasitacion.getFechaAplicacion() == null) {
            throw new RuntimeException("La fecha de aplicación es obligatoria");
        }
        if (desparasitacion.getProducto() == null || desparasitacion.getProducto().trim().isEmpty()) {
            throw new RuntimeException("El producto es obligatorio");
        }
        if (desparasitacion.getTipo() == null || desparasitacion.getTipo().trim().isEmpty()) {
            throw new RuntimeException("El tipo de desparasitación es obligatorio");
        }

        Mascota mascota = mascotaRepositorio.findById(desparasitacion.getMascota().getId())
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        desparasitacion.setMascota(mascota);
        desparasitacion.setProducto(desparasitacion.getProducto().trim());
        desparasitacion.setTipo(desparasitacion.getTipo().trim().toUpperCase());

        return desparasitacionRepositorio.save(desparasitacion);
    }

    @Transactional(readOnly = true)
    public List<Desparasitacion> obtenerPorMascota(Long mascotaId) {
        if (!mascotaRepositorio.existsById(mascotaId)) {
            throw new RuntimeException("Mascota no encontrada");
        }
        return desparasitacionRepositorio.findByMascotaId(mascotaId);
    }
}
