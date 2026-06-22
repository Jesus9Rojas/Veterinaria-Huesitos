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

    @Transactional(readOnly = true)
    public List<Vacuna> obtenerCatalogoVacunas() {
        return vacunaRepositorio.findAll();
    }

    @Transactional
    public Vacuna registrarVacunaCatalogo(Vacuna vacuna) {
        if (vacuna.getNombre() == null || vacuna.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre de la vacuna es obligatorio");
        }
        if (vacuna.getEspecieDestino() == null || vacuna.getEspecieDestino().trim().isEmpty()) {
            throw new RuntimeException("La especie de destino es obligatoria");
        }
        if (vacuna.getPrecio() == null) vacuna.setPrecio(0.0);
        if (vacuna.getStock() == null) vacuna.setStock(0);
        if (vacuna.getActivo() == null) vacuna.setActivo(true);
        
        return vacunaRepositorio.save(vacuna);
    }

    @Transactional
    public Vacuna actualizarVacunaCatalogo(Long id, Vacuna datosNuevos) {
        Vacuna vacuna = vacunaRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Vacuna no encontrada en el catálogo"));

        vacuna.setNombre(datosNuevos.getNombre());
        vacuna.setDescripcion(datosNuevos.getDescripcion());
        vacuna.setEspecieDestino(datosNuevos.getEspecieDestino());
        vacuna.setProveedor(datosNuevos.getProveedor());
        
        // Evitamos NullPointerExceptions asignando valores por defecto si vienen vacíos
        vacuna.setPrecio(datosNuevos.getPrecio() != null ? datosNuevos.getPrecio() : 0.0);
        vacuna.setStock(datosNuevos.getStock() != null ? datosNuevos.getStock() : 0);
        
        if (datosNuevos.getActivo() != null) {
            vacuna.setActivo(datosNuevos.getActivo());
        } else if (vacuna.getActivo() == null) {
            vacuna.setActivo(true);
        }

        return vacunaRepositorio.save(vacuna);
    }

    @Transactional
    public void desactivarVacuna(Long id) {
        Vacuna vacuna = vacunaRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Vacuna no encontrada"));
        vacuna.setActivo(false);
        vacunaRepositorio.save(vacuna);
    }

    @Transactional
    public void reactivarVacuna(Long id) {
        Vacuna vacuna = vacunaRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Vacuna no encontrada"));
        vacuna.setActivo(true);
        vacunaRepositorio.save(vacuna);
    }

    @Transactional(readOnly = true)
    public List<HistorialVacunacion> obtenerHistorialPorMascota(Long mascotaId) {
        if (!mascotaRepositorio.existsById(mascotaId)) {
            throw new RuntimeException("Mascota no encontrada");
        }
        return historialVacunacionRepositorio.findByMascotaIdOrderByFechaAplicacionDesc(mascotaId);
    }

    @Transactional
    public HistorialVacunacion registrarAplicacion(HistorialVacunacion registro) {
        if (registro.getMascota() == null || registro.getMascota().getId() == null) {
            throw new RuntimeException("La mascota es obligatoria");
        }
        if (registro.getVacuna() == null || registro.getVacuna().getId() == null) {
            throw new RuntimeException("La vacuna es obligatoria");
        }
        if (registro.getDosis() == null || registro.getDosis().trim().isEmpty()) {
            throw new RuntimeException("La dosis es obligatoria");
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