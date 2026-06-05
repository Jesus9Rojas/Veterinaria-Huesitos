package huesitos_backend.servicios;

import huesitos_backend.entidades.Campana;
import huesitos_backend.entidades.Oferta;
import huesitos_backend.entidades.Producto;
import huesitos_backend.repositorios.CampanaRepositorio;
import huesitos_backend.repositorios.OfertaRepositorio;
import huesitos_backend.repositorios.ProductoRepositorio;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CampanaOfertaServicio {

    private final CampanaRepositorio campanaRepositorio;
    private final OfertaRepositorio ofertaRepositorio;
    private final ProductoRepositorio productoRepositorio;

    // --- SERVICIOS DE CAMPAÑAS ---

    @Transactional
    public Campana guardarCampana(Campana campana) {
        if (campana.getNombre() == null || campana.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre de la campaña es obligatorio");
        }
        if (campana.getFechaInicio() == null || campana.getFechaFin() == null) {
            throw new RuntimeException("Las fechas de inicio y fin son obligatorias");
        }
        if (campana.getFechaFin().isBefore(campana.getFechaInicio())) {
            throw new RuntimeException("La fecha de fin no puede ser anterior a la de inicio");
        }

        campana.setNombre(campana.getNombre().trim());
        if (campana.getActivo() == null) {
            campana.setActivo(true);
        }

        // Si la campaña ya expiró según la fecha de creación/guardado, nace inactiva
        if (campana.getFechaFin().isBefore(LocalDate.now())) {
            campana.setActivo(false);
        }

        return campanaRepositorio.save(campana);
    }

    @Transactional(readOnly = true)
    public List<Campana> listarTodasCampanas() {
        return campanaRepositorio.findAll();
    }

    @Transactional(readOnly = true)
    public List<Campana> listarCampanasActivas() {
        return campanaRepositorio.findByActivoTrue();
    }

    @Transactional(readOnly = true)
    public Campana buscarCampanaPorId(Long id) {
        return campanaRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaña no encontrada con id: " + id));
    }

    @Transactional
    public void eliminarCampana(Long id) {
        Campana campana = buscarCampanaPorId(id);
        // Hacemos desactivación lógica para no borrar registros históricos
        campana.setActivo(false);
        campanaRepositorio.save(campana);
    }

    // --- SERVICIOS DE OFERTAS ---

    @Transactional
    public Oferta guardarOferta(Oferta oferta) {
        if (oferta.getTitulo() == null || oferta.getTitulo().trim().isEmpty()) {
            throw new RuntimeException("El título de la oferta es obligatorio");
        }
        if (oferta.getProducto() == null || oferta.getProducto().getId() == null) {
            throw new RuntimeException("El producto asociado es obligatorio");
        }
        if (oferta.getFechaInicio() == null || oferta.getFechaFin() == null) {
            throw new RuntimeException("Las fechas de inicio y fin son obligatorias");
        }
        if (oferta.getFechaFin().isBefore(oferta.getFechaInicio())) {
            throw new RuntimeException("La fecha de fin no puede ser anterior a la de inicio");
        }

        Producto producto = productoRepositorio.findById(oferta.getProducto().getId())
                .filter(Producto::getActivo)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado o inactivo"));

        oferta.setProducto(producto);
        oferta.setTitulo(oferta.getTitulo().trim());

        // Auto-calcular precio u porcentaje si corresponde
        BigDecimal precioBase = producto.getPrecio();
        if (oferta.getDescuentoPorcentaje() != null && oferta.getPrecioOferta() == null) {
            BigDecimal factor = BigDecimal.ONE.subtract(oferta.getDescuentoPorcentaje().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            oferta.setPrecioOferta(precioBase.multiply(factor).setScale(2, RoundingMode.HALF_UP));
        } else if (oferta.getDescuentoPorcentaje() == null && oferta.getPrecioOferta() != null) {
            if (precioBase.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal diff = precioBase.subtract(oferta.getPrecioOferta());
                BigDecimal pct = diff.divide(precioBase, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
                oferta.setDescuentoPorcentaje(pct.setScale(2, RoundingMode.HALF_UP));
            } else {
                oferta.setDescuentoPorcentaje(BigDecimal.ZERO);
            }
        } else if (oferta.getDescuentoPorcentaje() == null && oferta.getPrecioOferta() == null) {
            throw new RuntimeException("Debe especificar al menos el porcentaje de descuento o el precio de oferta");
        }

        // Si tiene campaña asociada, validarla
        if (oferta.getCampana() != null && oferta.getCampana().getId() != null) {
            Campana campana = campanaRepositorio.findById(oferta.getCampana().getId())
                    .orElseThrow(() -> new RuntimeException("Campaña asociada no encontrada"));
            oferta.setCampana(campana);
        } else {
            oferta.setCampana(null);
        }

        if (oferta.getActivo() == null) {
            oferta.setActivo(true);
        }

        if (oferta.getFechaFin().isBefore(LocalDate.now())) {
            oferta.setActivo(false);
        }

        return ofertaRepositorio.save(oferta);
    }

    @Transactional(readOnly = true)
    public List<Oferta> listarTodasOfertas() {
        return ofertaRepositorio.findAll();
    }

    @Transactional(readOnly = true)
    public List<Oferta> listarOfertasActivas() {
        return ofertaRepositorio.findByActivoTrue();
    }

    @Transactional(readOnly = true)
    public Oferta buscarOfertaPorId(Long id) {
        return ofertaRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Oferta no encontrada con id: " + id));
    }

    @Transactional
    public void eliminarOferta(Long id) {
        Oferta oferta = buscarOfertaPorId(id);
        oferta.setActivo(false);
        ofertaRepositorio.save(oferta);
    }

    // --- PROCESO PROGRAMADO DE INACTIVACIÓN ---

    @Transactional
    public void inactivarExpiradas(LocalDate fecha) {
        log.info("Iniciando proceso de inactivación de campañas y ofertas expiradas para la fecha: {}", fecha);

        // 1. Inactivar campañas expiradas
        List<Campana> campanasExpiradas = campanaRepositorio.findByActivoTrueAndFechaFinBefore(fecha);
        for (Campana campana : campanasExpiradas) {
            campana.setActivo(false);
            campanaRepositorio.save(campana);
            log.info("Campaña expirada e inactivada automáticamente: {} (ID: {})", campana.getNombre(), campana.getId());
        }

        // 2. Inactivar ofertas expiradas
        List<Oferta> ofertasExpiradas = ofertaRepositorio.findByActivoTrueAndFechaFinBefore(fecha);
        for (Oferta oferta : ofertasExpiradas) {
            oferta.setActivo(false);
            ofertaRepositorio.save(oferta);
            log.info("Oferta expirada e inactivada automáticamente: {} (ID: {})", oferta.getTitulo(), oferta.getId());
        }

        log.info("Proceso de inactivación finalizado. Campañas inactivadas: {}, Ofertas inactivadas: {}", 
                campanasExpiradas.size(), ofertasExpiradas.size());
    }
}
