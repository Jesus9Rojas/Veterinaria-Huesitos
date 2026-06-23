package huesitos_backend.servicios;

import huesitos_backend.entidades.Categoria;
import huesitos_backend.repositorios.CategoriaRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaServicio {

    private final CategoriaRepositorio categoriaRepositorio;

    @Transactional
    public Categoria guardarCategoria(Categoria categoria) {
        if (categoria.getNombre() == null || categoria.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre de la categoría es obligatorio");
        }
        
        categoriaRepositorio.findByNombreAndActivoTrue(categoria.getNombre().trim())
                .ifPresent(c -> {
                    if (!c.getId().equals(categoria.getId())) {
                        throw new RuntimeException("Ya existe una categoría activa con ese nombre");
                    }
                });

        categoria.setNombre(categoria.getNombre().trim());
        if(categoria.getActivo() == null) {
            categoria.setActivo(true);
        }
        return categoriaRepositorio.save(categoria);
    }

    @Transactional(readOnly = true)
    public List<Categoria> listarActivas() {
        return categoriaRepositorio.findByActivoTrue();
    }

    @Transactional(readOnly = true)
    public Categoria buscarPorId(Long id) {
        return categoriaRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
    }

    @Transactional
    public void desactivarCategoria(Long id) {
        Categoria categoria = buscarPorId(id);
        categoria.setActivo(false);
        categoriaRepositorio.save(categoria);
    }
}