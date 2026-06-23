package huesitos_backend.servicios;

import huesitos_backend.entidades.ConsultaMedica;
import huesitos_backend.entidades.Receta;
import huesitos_backend.repositorios.ConsultaMedicaRepositorio;
import huesitos_backend.repositorios.RecetaRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RecetaServicio {

    private final RecetaRepositorio recetaRepositorio;
    private final ConsultaMedicaRepositorio consultaMedicaRepositorio;
    
    private final PdfRecetaServicio pdfRecetaServicio;

    @Transactional
    public Receta registrarReceta(Receta receta) {
        if (receta.getConsultaMedica() == null || receta.getConsultaMedica().getId() == null) {
            throw new RuntimeException("La consulta médica asociada es obligatoria");
        }
        if (receta.getMedicamentos() == null || receta.getMedicamentos().trim().isEmpty()) {
            throw new RuntimeException("La lista de medicamentos es obligatoria");
        }
        if (receta.getIndicaciones() == null || receta.getIndicaciones().trim().isEmpty()) {
            throw new RuntimeException("Las indicaciones son obligatorias");
        }

        ConsultaMedica consulta = consultaMedicaRepositorio.findById(receta.getConsultaMedica().getId())
                .orElseThrow(() -> new RuntimeException("Consulta médica no encontrada"));

        Optional<Receta> recetaExistente = recetaRepositorio.findByConsultaMedicaId(consulta.getId());
        Receta recetaAGuardar;
        if (recetaExistente.isPresent()) {
            recetaAGuardar = recetaExistente.get();
            recetaAGuardar.setMedicamentos(receta.getMedicamentos());
            recetaAGuardar.setIndicaciones(receta.getIndicaciones());
            recetaAGuardar.setFechaEmision(LocalDate.now());
        } else {
            recetaAGuardar = receta;
            recetaAGuardar.setConsultaMedica(consulta);
            if (recetaAGuardar.getFechaEmision() == null) {
                recetaAGuardar.setFechaEmision(LocalDate.now());
            }
        }

        return recetaRepositorio.save(recetaAGuardar);
    }

    @Transactional(readOnly = true)
    public Receta obtenerRecetaPorConsulta(Long consultaId) {
        return recetaRepositorio.findByConsultaMedicaId(consultaId)
                .orElseThrow(() -> new RuntimeException("No se encontró receta para esta consulta médica"));
    }

    @Transactional(readOnly = true)
    public List<Receta> listarPorMascota(Long mascotaId) {
        return recetaRepositorio.findByConsultaMedicaMascotaId(mascotaId);
    }

    @Transactional(readOnly = true)
    public byte[] generarPdfReceta(Long recetaId) {
        Receta receta = recetaRepositorio.findById(recetaId)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));

        return pdfRecetaServicio.generarRecetaPdf(receta);
    }
}