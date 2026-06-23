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

    @Transactional
    public ConsultaMedica registrarConsulta(ConsultaMedica consulta) {
        if (consulta.getFecha() == null) {
            consulta.setFecha(LocalDateTime.now());
        }
        ConsultaMedica guardada = consultaMedicaRepositorio.save(consulta);

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
     */
    @Transactional(readOnly = true)
    public List<ConsultaMedica> obtenerHistorialMascota(Long mascotaId) {
        return consultaMedicaRepositorio.findByMascotaIdOrderByFechaDesc(mascotaId);
    }
}