package huesitos_backend.repositorios;
import huesitos_backend.entidades.ItemCobroCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemCobroCitaRepositorio extends JpaRepository<ItemCobroCita, Long> {}