package huesitos_backend.servicios;

import huesitos_backend.entidades.*;
import huesitos_backend.repositorios.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TareaProgramadaServicio {

    private final HistorialVacunacionRepositorio historialVacunacionRepositorio;
    private final DesparasitacionRepositorio desparasitacionRepositorio;
    private final RecordatorioRepositorio recordatorioRepositorio;
    private final CampanaOfertaServicio campanaOfertaServicio;

    /**
     * Tarea programada diaria a la 1:00 AM para escanear y generar recordatorios.
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void ejecutarEscaneoRecordatoriosProgramado() {
        log.info("Tarea Programada: Iniciando escaneo automático de recordatorios...");
        procesarRecordatorios(LocalDate.now());
    }

    /**
     * Tarea programada diaria a la 1:30 AM para inactivar campañas y ofertas expiradas.
     */
    @Scheduled(cron = "0 30 1 * * ?")
    @Transactional
    public void ejecutarInactivacionCampanasProgramado() {
        log.info("Tarea Programada: Iniciando inactivación automática de campañas y ofertas...");
        campanaOfertaServicio.inactivarExpiradas(LocalDate.now());
    }

    /**
     * Método público para ejecutar el escaneo de recordatorios manualmente.
     */
    @Transactional
    public int procesarRecordatorios(LocalDate fechaReferencia) {
        LocalDate limite = fechaReferencia.plusDays(7);
        int totalCreados = 0;

        log.info("Buscando vacunas y desparasitaciones pendientes entre {} y {}", fechaReferencia, limite);

        // 1. Escanear vacunas
        List<HistorialVacunacion> vacunasProximas = historialVacunacionRepositorio.findByFechaProximaDosisBetween(fechaReferencia, limite);
        for (HistorialVacunacion hist : vacunasProximas) {
            Mascota mascota = hist.getMascota();
            Vacuna vacuna = hist.getVacuna();
            LocalDate fechaVenc = hist.getFechaProximaDosis();
            String titulo = "Próxima Vacuna: " + vacuna.getNombre();

            // Evitar duplicados
            boolean existe = recordatorioRepositorio.existsByMascotaIdAndFechaRecordatorioAndTitulo(
                    mascota.getId(), 
                    fechaVenc, 
                    titulo
            );

            if (!existe) {
                Recordatorio rec = new Recordatorio();
                rec.setMascota(mascota);
                rec.setTitulo(titulo);
                rec.setFechaRecordatorio(fechaVenc);
                rec.setLeido(false);
                rec.setFechaCreacion(LocalDateTime.now());
                rec.setMensaje(String.format(
                        "Su mascota %s tiene programada la vacuna %s (%s) para el %s.",
                        mascota.getNombre(), 
                        vacuna.getNombre(), 
                        hist.getDosis(), 
                        fechaVenc
                ));

                recordatorioRepositorio.save(rec);
                totalCreados++;
                log.info("Recordatorio de vacuna creado para mascota: {} (Fecha: {})", mascota.getNombre(), fechaVenc);
            }
        }

        // 2. Escanear desparasitaciones
        List<Desparasitacion> desparasitacionesProximas = desparasitacionRepositorio.findByFechaProximaAplicacionBetween(fechaReferencia, limite);
        for (Desparasitacion desp : desparasitacionesProximas) {
            Mascota mascota = desp.getMascota();
            LocalDate fechaVenc = desp.getFechaProximaAplicacion();
            String titulo = "Próxima Desparasitación: " + desp.getTipo();

            // Evitar duplicados
            boolean existe = recordatorioRepositorio.existsByMascotaIdAndFechaRecordatorioAndTitulo(
                    mascota.getId(), 
                    fechaVenc, 
                    titulo
            );

            if (!existe) {
                Recordatorio rec = new Recordatorio();
                rec.setMascota(mascota);
                rec.setTitulo(titulo);
                rec.setFechaRecordatorio(fechaVenc);
                rec.setLeido(false);
                rec.setFechaCreacion(LocalDateTime.now());
                rec.setMensaje(String.format(
                        "Su mascota %s tiene programada su desparasitación %s con el producto %s para el %s.",
                        mascota.getNombre(), 
                        desp.getTipo().toLowerCase(), 
                        desp.getProducto(), 
                        fechaVenc
                ));

                recordatorioRepositorio.save(rec);
                totalCreados++;
                log.info("Recordatorio de desparasitación creado para mascota: {} (Fecha: {})", mascota.getNombre(), fechaVenc);
            }
        }

        log.info("Escaneo completado. Recordatorios creados: {}", totalCreados);
        return totalCreados;
    }
}
