package huesitos_backend.servicios;

import huesitos_backend.dto.ItemCobroRequest;
import huesitos_backend.entidades.*;
import huesitos_backend.repositorios.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
    private final TransaccionRepositorio transaccionRepositorio;
    private final HorarioPersonalRepositorio horarioPersonalRepositorio;
    
    private final MedicinaRepositorio medicinaRepositorio;
    private final VacunaRepositorio vacunaRepositorio;
    private final AntiparasitarioRepositorio antiparasitarioRepositorio;
    private final NotificacionRepositorio notificacionRepositorio;

    @Transactional
    public Cita agendarCita(Cita cita) {
        if (cita.getServicio() == null || cita.getServicio().getId() == null) {
            throw new RuntimeException("El servicio especificado no existe o no está disponible");
        }

        Servicio servicioReal = servicioRepositorio.findById(cita.getServicio().getId())
            .orElseThrow(() -> new RuntimeException("El servicio especificado no existe o no está disponible"));
        cita.setServicio(servicioReal);

        if (cita.getMascota() == null || cita.getMascota().getId() == null) {
            throw new RuntimeException("La mascota especificada no es válida");
        }
        Mascota mascotaReal = mascotaRepositorio.findById(cita.getMascota().getId())
            .orElseThrow(() -> new RuntimeException("La mascota especificada no existe"));
        cita.setMascota(mascotaReal);

        if (cita.getVeterinario() != null && cita.getVeterinario().getId() != null) {
            if (!usuarioRepositorio.existsById(cita.getVeterinario().getId())) {
                throw new RuntimeException("El veterinario especificado no existe");
            }
            validarHorarioAtencion(cita.getVeterinario().getId(), cita.getFechaHora());
            validarCruceDeHorarios(cita.getVeterinario().getId(), cita.getFechaHora(), servicioReal, null);
        }

        if (cita.getEstado() == null) {
            cita.setEstado(EstadoCita.PENDIENTE);
        }

        Cita citaNueva = citaRepositorio.save(cita);
        transaccionServicio.crearOrdenPago(citaNueva);

        try {
            List<Usuario> recepcionistas = usuarioRepositorio.findByRol(Rol.RECEPCIONISTA);
            for (Usuario recepcionista : recepcionistas) {
                Notificacion nuevaNotif = new Notificacion();
                nuevaNotif.setUsuario(recepcionista);
                nuevaNotif.setMensaje("🔔 NUEVA CITA WEB: " + mascotaReal.getNombre() + 
                                      " reservó para el " + citaNueva.getFechaHora().toLocalDate() + 
                                      " a las " + citaNueva.getFechaHora().toLocalTime() + " hs.");
                nuevaNotif.setLeida(false);
                nuevaNotif.setFechaCreacion(LocalDateTime.now());
                notificacionRepositorio.save(nuevaNotif);
            }
        } catch (Exception e) {
            System.err.println("Aviso: No se pudo generar la notificación para recepción: " + e.getMessage());
        }

        return citaNueva;
    }

    @Transactional
    public Cita cambiarEstadoCita(Long citaId, EstadoCita nuevoEstado) {
        Cita cita = citaRepositorio.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        cita.setEstado(nuevoEstado);
        
        if (nuevoEstado == EstadoCita.CANCELADA) {
            Optional<Transaccion> transaccionOpt = transaccionRepositorio.findByCitaId(citaId);
            if (transaccionOpt.isPresent()) {
                Transaccion transaccion = transaccionOpt.get();
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
        Cita cita = cambiarEstadoCita(citaId, EstadoCita.EN_ESPERA);

        if (cita.getVeterinario() != null) {
            Notificacion alerta = new Notificacion();
            alerta.setUsuario(cita.getVeterinario());
            alerta.setMensaje("🚨 PACIENTE EN ESPERA: " + cita.getMascota().getNombre() + 
                              " acaba de llegar para su " + cita.getServicio().getNombre() + 
                              " de las " + cita.getFechaHora().toLocalTime() + ".");
            alerta.setLeida(false);
            alerta.setFechaCreacion(LocalDateTime.now());
            notificacionRepositorio.save(alerta);
        }

        return cita;
    }

    @Transactional
    public Cita reprogramarCita(Long citaId, LocalDateTime nuevaFechaHora) {
        Cita cita = citaRepositorio.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (nuevaFechaHora.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("No se puede reprogramar a una fecha pasada");
        }

        if (cita.getVeterinario() != null && cita.getVeterinario().getId() != null) {
            validarHorarioAtencion(cita.getVeterinario().getId(), nuevaFechaHora);
            validarCruceDeHorarios(cita.getVeterinario().getId(), nuevaFechaHora, cita.getServicio(), citaId);
        }

        cita.setFechaHora(nuevaFechaHora);
        return citaRepositorio.save(cita);
    }

    @Transactional
    public Cita asignarVeterinario(Long citaId, Long veterinarioId) {
        Cita cita = citaRepositorio.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita médica no encontrada"));

        Usuario veterinario = usuarioRepositorio.findById(veterinarioId)
                .orElseThrow(() -> new RuntimeException("Veterinario no encontrado"));

        if (veterinario.getRol() != Rol.VETERINARIO) {
            throw new RuntimeException("El usuario seleccionado no es un médico veterinario");
        }

        validarHorarioAtencion(veterinarioId, cita.getFechaHora());
        validarCruceDeHorarios(veterinarioId, cita.getFechaHora(), cita.getServicio(), citaId);

        cita.setVeterinario(veterinario);
        
        Notificacion alerta = new Notificacion();
        alerta.setUsuario(veterinario);
        alerta.setMensaje("📅 CITA ASIGNADA: Te han asignado al paciente " + cita.getMascota().getNombre() + 
                          " para el día " + cita.getFechaHora().toLocalDate() + 
                          " a las " + cita.getFechaHora().toLocalTime());
        alerta.setLeida(false);
        alerta.setFechaCreacion(LocalDateTime.now());
        notificacionRepositorio.save(alerta);

        return citaRepositorio.save(cita);
    }

    private void validarCruceDeHorarios(Long veterinarioId, LocalDateTime nuevoInicio, Servicio servicio, Long citaIdExcluida) {
        int duracionMinutos = (servicio.getDuracionMinutos() != null && servicio.getDuracionMinutos() > 0) 
                              ? servicio.getDuracionMinutos() : 30;
        
        LocalDateTime nuevoFin = nuevoInicio.plusMinutes(duracionMinutos);

        LocalDateTime inicioDelDia = nuevoInicio.toLocalDate().atStartOfDay();
        LocalDateTime finDelDia = nuevoInicio.toLocalDate().atTime(LocalTime.MAX);
        
        List<Cita> citasDelDia = citaRepositorio.findByVeterinarioIdAndFechaHoraBetween(veterinarioId, inicioDelDia, finDelDia);

        for (Cita citaExistente : citasDelDia) {
            if (citaIdExcluida != null && citaExistente.getId().equals(citaIdExcluida)) continue;
            
            if (citaExistente.getEstado() == EstadoCita.CANCELADA || citaExistente.getEstado() == EstadoCita.COMPLETADA) {
                continue;
            }

            int duracionExistente = (citaExistente.getServicio() != null && citaExistente.getServicio().getDuracionMinutos() != null) 
                                  ? citaExistente.getServicio().getDuracionMinutos() : 30;
            
            LocalDateTime existenteInicio = citaExistente.getFechaHora();
            LocalDateTime existenteFin = existenteInicio.plusMinutes(duracionExistente);

            if (nuevoInicio.isBefore(existenteFin) && nuevoFin.isAfter(existenteInicio)) {
                throw new RuntimeException("El doctor ya atiende una '" + citaExistente.getServicio().getNombre() + 
                                           "' desde las " + existenteInicio.toLocalTime() + " hasta las " + existenteFin.toLocalTime());
            }
        }
    }

    private void validarHorarioAtencion(Long veterinarioId, LocalDateTime fechaHora) {
        if (veterinarioId == null) return;

        List<HorarioPersonal> horarios = horarioPersonalRepositorio.findByUsuarioId(veterinarioId);
        if (horarios.isEmpty()) return; 

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
            throw new RuntimeException("Fuera del horario de atención del médico (" + horario.getHoraEntrada() + " a " + horario.getHoraSalida() + ")");
        }
    }

    @Transactional
    public List<Cita> listarCitasConFiltros(LocalDate inicio, LocalDate fin, Long veterinarioId, EstadoCita estado) {
        cancelarCitasVencidas(); 
        LocalDateTime inicioLDT = (inicio != null) ? inicio.atStartOfDay() : null;
        LocalDateTime finLDT = (fin != null) ? fin.atTime(LocalTime.of(23, 59, 59)) : null;
        return citaRepositorio.buscarCitasConFiltros(inicioLDT, finLDT, veterinarioId, estado);
    }

    @Transactional
    public void cancelarCitasVencidas() {
        LocalDateTime limite = LocalDateTime.now();
        List<EstadoCita> estadosVulnerables = java.util.Arrays.asList(EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA);
        List<Cita> vencidas = citaRepositorio.buscarCitasExpiradas(limite, estadosVulnerables);
        
        if (!vencidas.isEmpty()) {
            for (Cita c : vencidas) {
                c.setEstado(EstadoCita.CANCELADA);
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

    @Transactional
    public Cita registrarItemsRecetadosYCobrar(Long citaId, List<ItemCobroRequest> items) {
        Cita cita = citaRepositorio.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita médica no encontrada"));
        Double costoAdicionalTotal = 0.0;
        for (ItemCobroRequest req : items) {
            ItemCobroCita item = new ItemCobroCita();
            item.setCita(cita);
            item.setTipoItem(req.getTipoItem());
            item.setItemId(req.getItemId());
            item.setCantidad(req.getCantidad());
            if (req.getTipoItem().equals("MEDICINA")) {
                Medicina m = medicinaRepositorio.findById(req.getItemId()).orElseThrow();
                if (m.getStock() < req.getCantidad()) throw new RuntimeException("Stock insuficiente para: " + m.getNombre());
                m.setStock(m.getStock() - req.getCantidad());
                item.setNombreItem(m.getNombre());
                item.setPrecioUnitario(m.getPrecio());
                medicinaRepositorio.save(m);
            } else if (req.getTipoItem().equals("VACUNA")) {
                Vacuna v = vacunaRepositorio.findById(req.getItemId()).orElseThrow();
                if (v.getStock() < req.getCantidad()) throw new RuntimeException("Stock insuficiente para: " + v.getNombre());
                v.setStock(v.getStock() - req.getCantidad());
                item.setNombreItem(v.getNombre());
                item.setPrecioUnitario(v.getPrecio());
                vacunaRepositorio.save(v);
            } else if (req.getTipoItem().equals("ANTIPARASITARIO")) {
                Antiparasitario a = antiparasitarioRepositorio.findById(req.getItemId()).orElseThrow();
                if (a.getStock() < req.getCantidad()) throw new RuntimeException("Stock insuficiente para: " + a.getNombre());
                a.setStock(a.getStock() - req.getCantidad());
                item.setNombreItem(a.getNombre());
                item.setPrecioUnitario(a.getPrecio());
                antiparasitarioRepositorio.save(a);
            }
            item.setSubtotal(item.getPrecioUnitario() * item.getCantidad());
            costoAdicionalTotal += item.getSubtotal();
            cita.getItemsCobro().add(item);
        }
        Transaccion transaccion = transaccionRepositorio.findByCitaId(citaId).orElse(null);
        if (transaccion != null) {
            BigDecimal montoActual = transaccion.getMonto() != null ? transaccion.getMonto() : BigDecimal.ZERO;
            BigDecimal montoAdicional = BigDecimal.valueOf(costoAdicionalTotal);
            transaccion.setMonto(montoActual.add(montoAdicional));
            transaccionRepositorio.save(transaccion);
        }
        return citaRepositorio.save(cita);
    }

    @Transactional(readOnly = true)
    public List<Cita> obtenerCitasPorDueno(Long duenoId) {
        return citaRepositorio.findByMascotaDuenoIdOrderByFechaHoraDesc(duenoId);
    }
}