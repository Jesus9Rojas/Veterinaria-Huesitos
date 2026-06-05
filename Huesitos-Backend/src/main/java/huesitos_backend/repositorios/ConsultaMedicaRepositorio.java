package huesitos_backend.repositorios;

import huesitos_backend.entidades.ConsultaMedica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultaMedicaRepositorio extends JpaRepository<ConsultaMedica, Long> {

    /**
     * Busca todo el historial médico de una mascota específica
     * ordenado desde la consulta más reciente.
     *
     * @param mascotaId El ID de la mascota.
     * @return Lista de consultas médicas en orden descendente por fecha.
     */
    List<ConsultaMedica> findByMascotaIdOrderByFechaDesc(Long mascotaId);
}
