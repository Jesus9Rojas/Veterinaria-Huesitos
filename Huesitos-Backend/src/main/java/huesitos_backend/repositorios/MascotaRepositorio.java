package huesitos_backend.repositorios;

import huesitos_backend.entidades.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MascotaRepositorio extends JpaRepository<Mascota, Long> {

    /**
     * Busca todas las mascotas que pertenecen a un dueño específico.
     *
     * @param dueñoId El ID del dueño.
     * @return La lista de mascotas asociadas a ese dueño.
     */
    List<Mascota> findByDueñoId(Long dueñoId);
}
