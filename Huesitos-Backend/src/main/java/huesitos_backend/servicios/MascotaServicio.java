package huesitos_backend.servicios;

import huesitos_backend.entidades.Mascota;
import huesitos_backend.repositorios.MascotaRepositorio;
import huesitos_backend.repositorios.DueñoRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MascotaServicio {

    private final MascotaRepositorio mascotaRepositorio;
    private final DueñoRepositorio dueñoRepositorio;

    /**
     * Registra una nueva mascota en el sistema, previa verificación de la existencia de su dueño.
     *
     * @param mascota La mascota a registrar.
     * @return La mascota guardada en la base de datos.
     */
    @Transactional
    public Mascota registrarMascota(Mascota mascota) {
        if (mascota.getDueño() == null || mascota.getDueño().getId() == null || 
            !dueñoRepositorio.existsById(mascota.getDueño().getId())) {
            throw new RuntimeException("El dueño especificado no existe");
        }
        return mascotaRepositorio.save(mascota);
    }

    /**
     * Obtiene todas las mascotas asociadas a un dueño.
     *
     * @param dueñoId El ID del dueño.
     * @return La lista de mascotas del dueño.
     */
    @Transactional(readOnly = true)
    public List<Mascota> obtenerMascotasPorDueño(Long dueñoId) {
        return mascotaRepositorio.findByDueñoId(dueñoId);
    }

    /**
     * Busca una mascota por su identificador único.
     *
     * @param id El ID de la mascota.
     * @return La mascota encontrada.
     * @throws RuntimeException si la mascota no existe.
     */
    @Transactional(readOnly = true)
    public Mascota obtenerMascotaPorId(Long id) {
        return mascotaRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));
    }
}
