package huesitos_backend.servicios;

import huesitos_backend.entidades.Cita;
import huesitos_backend.entidades.EstadoCita;
import huesitos_backend.entidades.Servicio;
import huesitos_backend.entidades.EstadoPago;
import huesitos_backend.entidades.Transaccion;
import huesitos_backend.repositorios.CitaRepositorio;
import huesitos_backend.repositorios.MascotaRepositorio;
import huesitos_backend.repositorios.UsuarioRepositorio;
import huesitos_backend.repositorios.ServicioRepositorio;
import huesitos_backend.repositorios.TransaccionRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import huesitos_backend.entidades.HorarioPersonal;
import huesitos_backend.repositorios.HorarioPersonalRepositorio;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CitaServicio {

    private final CitaRepositorio citaRepositorio;
    private final MascotaRepositorio mascotaRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final ServicioRepositorio servicioRepositorio;
    private final TransaccionServicio transaccionServicio;
    private final TransaccionRepositorio transaccionRepositorio; // Agregado para acceder a Finanzas
    private final HorarioPersonalRepositorio horarioPersonalRepositorio;

    @Transactional
    public Cita agendarCita(Cita cita) {
        if (cita.getServicio() == null || cita.getServicio().getId() == null) {
            throw new RuntimeException("El servicio especificado no existe o no está disponible");
        }

        Servicio servicioReal = servicioRepositorio.findById(cita.getServicio().getId())
            .orElseThrow(() -> new RuntimeException("El servicio especificado no existe o no está disponible"));
        cita.setServicio(servicioReal);

        if (cita.getMascota() == null || cita.getMascota().getId() == null ||
            !mascotaRepositorio.existsById(cita.getMascota().getId())) {
            throw new RuntimeException("La mascota especificada no existe");
        }

        if (cita.getVeterinario() != null && cita.getVeterinario().getId() != null) {
            if (!usuarioRepositorio.existsById(cita.getVeterinario().getId())) {
                throw new RuntimeException("El veterinario especificado no existe");
            }
            boolean existeCruce = citaRepositorio.existsByVeterinarioIdAndFechaHoraAndEstadoNot(
                    cita.getVeterinario().getId(),
                    cita.getFechaHora(),
                    EstadoCita.CANCELADA
            );

            if (existeCruce) {
                throw new RuntimeException("El veterinario ya tiene una cita programada en ese horario");
            }

            validarHorarioAtencion(cita.getVeterinario().getId(), cita.getFechaHora());
        }

        if (cita.getEstado() == null) {
            cita.setEstado(EstadoCita.PENDIENTE);
        }

        Cita citaNueva = citaRepositorio.save(cita);
        transaccionServicio.crearOrdenPago(citaNueva);

        return citaNueva;
    }

    @Transactional
    public Cita cambiarEstadoCita(Long citaId, EstadoCita nuevoEstado) {
        Cita cita = citaRepositorio.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        cita.setEstado(nuevoEstado);
        
        // =========================================================
        // SINCRONIZACIÓN CON FINANZAS (CAJA)
        // =========================================================
        if (nuevoEstado == EstadoCita.CANCELADA) {
            // Buscamos si esta cita tiene una orden de pago
            Optional<Transaccion> transaccionOpt = transaccionRepositorio.findByCitaId(citaId);
            
            if (transaccionOpt.isPresent()) {
                Transaccion transaccion = transaccionOpt.get();
                // Si la persona aún no había pagado, cancelamos la deuda
                if (transaccion.getEstadoPago() == EstadoPago.PENDIENTE) {
                    transaccion.setEstadoPago(EstadoPago.RECHAZADO);
                    transaccionRepositorio.save(transaccion);
                }
            }
        }
        
        return citaRepositorio.save(cita);
    }

    @Transactional
    public List<Cita> listarCitasPorDia(LocalDate fecha) {
        cancelarCitasVencidas();

        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.of(23, 59, 59));
        return citaRepositorio.findByFechaHoraBetween(inicio, fin);
    }

    @Transactional
    public Cita cancelarCita(Long citaId) {
        return cambiarEstadoCita(citaId, EstadoCita.CANCELADA);
    }

    @Transactional
    public Cita checkInCita(Long citaId) {
        return cambiarEstadoCita(citaId, EstadoCita.EN_ESPERA);
    }

    @Transactional
    public Cita reprogramarCita(Long citaId, LocalDateTime nuevaFechaHora) {
        Cita cita = citaRepositorio.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (nuevaFechaHora.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("No se puede reprogramar una cita a una fecha y hora pasada");
        }

        if (cita.getVeterinario() != null && cita.getVeterinario().getId() != null) {
            boolean existeCruce = citaRepositorio.existsByVeterinarioIdAndFechaHoraAndEstadoNotAndIdNot(
                    cita.getVeterinario().getId(),
                    nuevaFechaHora,
                    EstadoCita.CANCELADA,
                    citaId
            );

            if (existeCruce) {
                throw new RuntimeException("El veterinario ya tiene otra cita programada en ese horario");
            }
            validarHorarioAtencion(cita.getVeterinario().getId(), nuevaFechaHora);
        }

        cita.setFechaHora(nuevaFechaHora);
        return citaRepositorio.save(cita);
    }

    private void validarHorarioAtencion(Long veterinarioId, LocalDateTime fechaHora) {
        if (veterinarioId == null) return;

        List<HorarioPersonal> horarios = horarioPersonalRepositorio.findByUsuarioId(veterinarioId);
        if (horarios.isEmpty()) {
            return; 
        }

        DayOfWeek diaCita = fechaHora.getDayOfWeek();
        LocalTime horaCita = fechaHora.toLocalTime();

        HorarioPersonal horario = horarios.stream()
                .filter(h -> h.getDiaSemana() == diaCita)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("El veterinario no atiende los días " + traducirDiaSemana(diaCita)));

        if (!horario.getActivo() || horario.getHoraEntrada() == null || horario.getHoraSalida() == null) {
            throw new RuntimeException("El veterinario no labora el día " + traducirDiaSemana(diaCita));
        }

        if (horaCita.isBefore(horario.getHoraEntrada()) || horaCita.isAfter(horario.getHoraSalida())) {
            throw new RuntimeException("La cita está fuera del horario de atención del veterinario (" + horario.getHoraEntrada() + " a " + horario.getHoraSalida() + ")");
        }
    }

    @Transactional
    public List<Cita> listarCitasConFiltros(LocalDate inicio, LocalDate fin, Long veterinarioId, EstadoCita estado) {
        cancelarCitasVencidas(); 

        LocalDateTime inicioLDT = (inicio != null) ? inicio.atStartOfDay() : null;
        LocalDateTime finLDT = (fin != null) ? fin.atTime(LocalTime.of(23, 59, 59)) : null;

        return citaRepositorio.buscarCitasConFiltros(inicioLDT, finLDT, veterinarioId, estado);
    }

    /**
     * Cancela automáticamente las citas que superaron su hora programada 
     * por más de 1 hora de tolerancia y que nadie llegó a atender.
     */
    @Transactional
    public void cancelarCitasVencidas() {
        // Tolerancia de 1 hora
        LocalDateTime limite = LocalDateTime.now().minusHours(1);
        
        List<EstadoCita> estadosVulnerables = java.util.Arrays.asList(EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA);
        List<Cita> vencidas = citaRepositorio.buscarCitasExpiradas(limite, estadosVulnerables);
        
        if (!vencidas.isEmpty()) {
            for (Cita c : vencidas) {
                c.setEstado(EstadoCita.CANCELADA);
                
                // Aplicamos la misma lógica de finanzas para las cancelaciones automáticas
                Optional<Transaccion> tx = transaccionRepositorio.findByCitaId(c.getId());
                if (tx.isPresent() && tx.get().getEstadoPago() == EstadoPago.PENDIENTE) {
                    tx.get().setEstadoPago(EstadoPago.RECHAZADO);
                    transaccionRepositorio.save(tx.get());
                }
            }
            citaRepositorio.saveAll(vencidas);
        }
    }

    private String traducirDiaSemana(DayOfWeek day) {
        return switch (day) {
            case MONDAY -> "Lunes";
            case TUESDAY -> "Martes";
            case WEDNESDAY -> "Miércoles";
            case THURSDAY -> "Jueves";
            case FRIDAY -> "Viernes";
            case SATURDAY -> "Sábado";
            case SUNDAY -> "Domingo";
        };
    }
}