package huesitos_backend.servicios;

import huesitos_backend.entidades.Antiparasitario;
import huesitos_backend.repositorios.AntiparasitarioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AntiparasitarioServicio {

    private final AntiparasitarioRepositorio antiparasitarioRepositorio;

    @Transactional(readOnly = true)
    public List<Antiparasitario> listarTodos() {
        return antiparasitarioRepositorio.findAll();
    }

    @Transactional
    public Antiparasitario guardar(Antiparasitario antiparasitario) {
        if (antiparasitario.getNombre() == null || antiparasitario.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre es obligatorio");
        }
        if (antiparasitario.getPrecio() == null) antiparasitario.setPrecio(0.0);
        if (antiparasitario.getStock() == null) antiparasitario.setStock(0);
        if (antiparasitario.getActivo() == null) antiparasitario.setActivo(true);
        
        return antiparasitarioRepositorio.save(antiparasitario);
    }

    @Transactional
    public Antiparasitario actualizar(Long id, Antiparasitario datosNuevos) {
        Antiparasitario anti = antiparasitarioRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Antiparasitario no encontrado"));

        anti.setNombre(datosNuevos.getNombre());
        anti.setProveedor(datosNuevos.getProveedor());
        anti.setDescripcion(datosNuevos.getDescripcion());
        anti.setTipo(datosNuevos.getTipo());
        anti.setEspecieDestino(datosNuevos.getEspecieDestino());
        anti.setPrecio(datosNuevos.getPrecio() != null ? datosNuevos.getPrecio() : 0.0);
        anti.setStock(datosNuevos.getStock() != null ? datosNuevos.getStock() : 0);
        
        if (datosNuevos.getActivo() != null) {
            anti.setActivo(datosNuevos.getActivo());
        }

        return antiparasitarioRepositorio.save(anti);
    }

    @Transactional
    public void desactivar(Long id) {
        Antiparasitario anti = antiparasitarioRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Antiparasitario no encontrado"));
        anti.setActivo(false);
        antiparasitarioRepositorio.save(anti);
    }

    @Transactional
    public void reactivar(Long id) {
        Antiparasitario anti = antiparasitarioRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Antiparasitario no encontrado"));
        anti.setActivo(true);
        antiparasitarioRepositorio.save(anti);
    }
}