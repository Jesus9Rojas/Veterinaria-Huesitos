package huesitos_backend.servicios;

import huesitos_backend.entidades.Medicina;
import huesitos_backend.repositorios.MedicinaRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicinaServicio {

    private final MedicinaRepositorio medicinaRepositorio;

    @Transactional(readOnly = true)
    public List<Medicina> listarTodas() {
        return medicinaRepositorio.findAll();
    }

    @Transactional
    public Medicina guardar(Medicina medicina) {
        if (medicina.getNombre() == null || medicina.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre del medicamento es obligatorio");
        }
        if (medicina.getPrecio() == null) medicina.setPrecio(0.0);
        if (medicina.getStock() == null) medicina.setStock(0);
        if (medicina.getActivo() == null) medicina.setActivo(true);
        
        return medicinaRepositorio.save(medicina);
    }

    @Transactional
    public Medicina actualizar(Long id, Medicina datosNuevos) {
        Medicina medicina = medicinaRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicina no encontrada"));

        medicina.setNombre(datosNuevos.getNombre());
        medicina.setProveedor(datosNuevos.getProveedor());
        medicina.setDescripcion(datosNuevos.getDescripcion());
        medicina.setPrecio(datosNuevos.getPrecio() != null ? datosNuevos.getPrecio() : 0.0);
        medicina.setStock(datosNuevos.getStock() != null ? datosNuevos.getStock() : 0);
        
        if (datosNuevos.getActivo() != null) {
            medicina.setActivo(datosNuevos.getActivo());
        }

        return medicinaRepositorio.save(medicina);
    }

    @Transactional
    public void desactivar(Long id) {
        Medicina medicina = medicinaRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicina no encontrada"));
        medicina.setActivo(false);
        medicinaRepositorio.save(medicina);
    }

    @Transactional
    public void reactivar(Long id) {
        Medicina medicina = medicinaRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicina no encontrada"));
        medicina.setActivo(true);
        medicinaRepositorio.save(medicina);
    }
}