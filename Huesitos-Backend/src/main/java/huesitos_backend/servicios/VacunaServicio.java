package huesitos_backend.servicios;

import huesitos_backend.entidades.HistorialVacunacion;
import huesitos_backend.entidades.Mascota;
import huesitos_backend.entidades.Vacuna;
import huesitos_backend.repositorios.HistorialVacunacionRepositorio;
import huesitos_backend.repositorios.MascotaRepositorio;
import huesitos_backend.repositorios.VacunaRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VacunaServicio {

    private final VacunaRepositorio vacunaRepositorio;
    private final HistorialVacunacionRepositorio historialVacunacionRepositorio;
    private final MascotaRepositorio mascotaRepositorio;

    /**
     * Obtiene todas las vacunas del catálogo.
     */
    @Transactional(readOnly = true)
    public List<Vacuna> obtenerCatalogoVacunas() {
        return vacunaRepositorio.findAll();
    }

    /**
     * Registra una nueva vacuna en el catálogo de la clínica.
     */
    @Transactional
    public Vacuna registrarVacunaCatalogo(Vacuna vacuna) {
        if (vacuna.getNombre() == null || vacuna.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre de la vacuna es obligatorio");
        }
        if (vacuna.getEspecieDestino() == null || vacuna.getEspecieDestino().trim().isEmpty()) {
            throw new RuntimeException("La especie de destino es obligatoria");
        }
        return vacunaRepositorio.save(vacuna);
    }

    /**
     * Obtiene el historial de vacunas aplicadas a una mascota.
     */
    @Transactional(readOnly = true)
    public List<HistorialVacunacion> obtenerHistorialPorMascota(Long mascotaId) {
        if (!mascotaRepositorio.existsById(mascotaId)) {
            throw new RuntimeException("Mascota no encontrada");
        }
        return historialVacunacionRepositorio.findByMascotaIdOrderByFechaAplicacionDesc(mascotaId);
    }

    /**
     * Registra la aplicación de una vacuna a una mascota.
     */
    @Transactional
    public HistorialVacunacion registrarAplicacion(HistorialVacunacion registro) {
        if (registro.getMascota() == null || registro.getMascota().getId() == null) {
            throw new RuntimeException("La mascota es obligatoria para registrar la aplicación de una vacuna");
        }
        if (registro.getVacuna() == null || registro.getVacuna().getId() == null) {
            throw new RuntimeException("La vacuna es obligatoria");
        }
        if (registro.getDosis() == null || registro.getDosis().trim().isEmpty()) {
            throw new RuntimeException("La dosis (ej: Primera, Refuerzo) es obligatoria");
        }

        Mascota mascota = mascotaRepositorio.findById(registro.getMascota().getId())
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));
        Vacuna vacuna = vacunaRepositorio.findById(registro.getVacuna().getId())
                .orElseThrow(() -> new RuntimeException("Vacuna no encontrada"));

        registro.setMascota(mascota);
        registro.setVacuna(vacuna);

        if (registro.getFechaAplicacion() == null) {
            registro.setFechaAplicacion(LocalDate.now());
        }

        return historialVacunacionRepositorio.save(registro);
    }
}
