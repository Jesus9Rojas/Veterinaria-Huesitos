package huesitos_backend.servicios;

import huesitos_backend.entidades.Cita;
import huesitos_backend.entidades.ConsultaMedica;
import huesitos_backend.entidades.EstadoCita;
import huesitos_backend.repositorios.CitaRepositorio;
import huesitos_backend.repositorios.ConsultaMedicaRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultaMedicaServicio {

    private final ConsultaMedicaRepositorio consultaMedicaRepositorio;
    private final CitaRepositorio citaRepositorio;

    /**
     * Registra una nueva consulta médica para una mascota.
     * Si la consulta está asociada a una cita, cambia el estado de la cita a COMPLETADA.
     *
     * @param consulta Los datos de la consulta a registrar.
     * @return La consulta médica guardada.
     */
    @Transactional
    public ConsultaMedica registrarConsulta(ConsultaMedica consulta) {
        consulta.setFecha(LocalDateTime.now());
        ConsultaMedica guardada = consultaMedicaRepositorio.save(consulta);

        // Si la consulta viene vinculada a una cita, buscarla y marcarla como COMPLETADA
        if (consulta.getCita() != null && consulta.getCita().getId() != null) {
            Cita cita = citaRepositorio.findById(consulta.getCita().getId())
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
            cita.setEstado(EstadoCita.COMPLETADA);
            citaRepositorio.save(cita);
        }

        return guardada;
    }

    /**
     * Obtiene el historial clínico de una mascota ordenado desde la más reciente.
     *
     * @param mascotaId El ID de la mascota.
     * @return Lista de consultas médicas asociadas.
     */
    @Transactional(readOnly = true)
    public List<ConsultaMedica> obtenerHistorialMascota(Long mascotaId) {
        return consultaMedicaRepositorio.findByMascotaIdOrderByFechaDesc(mascotaId);
    }
}
