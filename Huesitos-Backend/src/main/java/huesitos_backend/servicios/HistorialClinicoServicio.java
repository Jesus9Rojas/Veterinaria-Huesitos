package huesitos_backend.servicios;

import huesitos_backend.dto.RegistroMedicoRequest;
import huesitos_backend.entidades.*;
import huesitos_backend.repositorios.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class HistorialClinicoServicio {

    // USAMOS TUS REPOSITORIOS ORIGINALES
    private final HistorialVacunacionRepositorio historialVacunacionRepo;
    private final DesparasitacionRepositorio desparasitacionRepo;
    private final RecetaRepositorio recetaRepo;
    private final CitaRepositorio citaRepo;
    private final MascotaRepositorio mascotaRepo;
    private final VacunaRepositorio vacunaRepo;
    private final AntiparasitarioRepositorio antiparasitarioRepo;
    private final TransaccionRepositorio transaccionRepo;
    private final ConsultaMedicaRepositorio consultaRepo;

    @Transactional
    public void aplicarVacuna(Long citaId, Long mascotaId, RegistroMedicoRequest req) {
        Cita cita = citaRepo.findById(citaId).orElseThrow();
        Mascota mascota = mascotaRepo.findById(mascotaId).orElseThrow();
        Vacuna vacuna = vacunaRepo.findById(req.getItemId()).orElseThrow();

        // 1. Guardar en el Historial Clínico (Carnet) usando tu entidad original
        HistorialVacunacion hv = new HistorialVacunacion();
        hv.setMascota(mascota);
        hv.setVacuna(vacuna);
        hv.setDosis(req.getDosisOTipo());
        
        // Manejo seguro de la fecha
        if (req.getFechaAplicacion() != null) {
            hv.setFechaAplicacion(req.getFechaAplicacion());
        } else {
            hv.setFechaAplicacion(LocalDate.now());
        }
        
        hv.setFechaProximaDosis(req.getFechaProxima());
        hv.setObservaciones(req.getObservaciones());
        historialVacunacionRepo.save(hv);

        // 2. Descontar Stock
        if(vacuna.getStock() < 1) throw new RuntimeException("Stock insuficiente para la vacuna");
        vacuna.setStock(vacuna.getStock() - 1);
        vacunaRepo.save(vacuna);

        // 3. Registrar el Cobro en la Cita y Caja
        ItemCobroCita cobro = new ItemCobroCita();
        cobro.setCita(cita);
        cobro.setTipoItem("VACUNA");
        cobro.setItemId(vacuna.getId());
        cobro.setNombreItem(vacuna.getNombre());
        cobro.setCantidad(1);
        cobro.setPrecioUnitario(vacuna.getPrecio());
        cobro.setSubtotal(vacuna.getPrecio());
        cita.getItemsCobro().add(cobro);

        Transaccion tx = transaccionRepo.findByCitaId(citaId).orElse(null);
        if(tx != null) {
            tx.setMonto(tx.getMonto().add(BigDecimal.valueOf(vacuna.getPrecio())));
            transaccionRepo.save(tx);
        }
        citaRepo.save(cita);
    }

    @Transactional
    public void aplicarDesparasitacion(Long citaId, Long mascotaId, RegistroMedicoRequest req) {
        Cita cita = citaRepo.findById(citaId).orElseThrow();
        Mascota mascota = mascotaRepo.findById(mascotaId).orElseThrow();
        Antiparasitario anti = antiparasitarioRepo.findById(req.getItemId()).orElseThrow();

        // 1. Guardar en el Historial Clínico (Carnet)
        Desparasitacion d = new Desparasitacion();
        d.setMascota(mascota);
        d.setProducto(anti.getNombre());
        d.setTipo(anti.getTipo());
        d.setFechaAplicacion(req.getFechaAplicacion());
        d.setFechaProximaAplicacion(req.getFechaProxima());
        d.setObservaciones(req.getObservaciones());
        desparasitacionRepo.save(d);

        // 2. Descontar Stock
        if(anti.getStock() < 1) throw new RuntimeException("Stock insuficiente");
        anti.setStock(anti.getStock() - 1);
        antiparasitarioRepo.save(anti);

        // 3. Registrar el Cobro
        ItemCobroCita cobro = new ItemCobroCita();
        cobro.setCita(cita);
        cobro.setTipoItem("ANTIPARASITARIO");
        cobro.setItemId(anti.getId());
        cobro.setNombreItem(anti.getNombre());
        cobro.setCantidad(1);
        cobro.setPrecioUnitario(anti.getPrecio());
        cobro.setSubtotal(anti.getPrecio());
        cita.getItemsCobro().add(cobro);

        Transaccion tx = transaccionRepo.findByCitaId(citaId).orElse(null);
        if(tx != null) {
            tx.setMonto(tx.getMonto().add(BigDecimal.valueOf(anti.getPrecio())));
            transaccionRepo.save(tx);
        }
        citaRepo.save(cita);
    }

    @Transactional
    public Receta generarReceta(Long consultaId, Receta recetaReq) {
        ConsultaMedica consulta = consultaRepo.findById(consultaId)
            .orElseThrow(() -> new RuntimeException("La consulta médica no existe"));
            
        recetaReq.setConsultaMedica(consulta);
        recetaReq.setFechaEmision(LocalDate.now());
        
        return recetaRepo.save(recetaReq);
    }
}