package huesitos_backend.servicios;

import huesitos_backend.entidades.ArchivoClinico;
import huesitos_backend.entidades.ConsultaMedica;
import huesitos_backend.entidades.Mascota;
import huesitos_backend.entidades.TipoArchivoClinico;
import huesitos_backend.repositorios.ArchivoClinicoRepositorio;
import huesitos_backend.repositorios.ConsultaMedicaRepositorio;
import huesitos_backend.repositorios.MascotaRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ArchivoClinicoServicio {

    private final ArchivoClinicoRepositorio archivoClinicoRepositorio;
    private final MascotaRepositorio mascotaRepositorio;
    private final ConsultaMedicaRepositorio consultaMedicaRepositorio;
    private final StorageService storageService;

    /**
     * Obtiene todos los archivos clínicos de una mascota.
     */
    @Transactional(readOnly = true)
    public List<ArchivoClinico> obtenerArchivosPorMascota(Long mascotaId) {
        if (!mascotaRepositorio.existsById(mascotaId)) {
            throw new RuntimeException("Mascota no encontrada");
        }
        return archivoClinicoRepositorio.findByMascotaIdOrderByFechaSubidaDesc(mascotaId);
    }

    /**
     * Guarda físicamente el archivo y registra su referencia en base de datos.
     */
    @Transactional
    public ArchivoClinico guardarArchivo(Long mascotaId, Long consultaId, String descripcion, TipoArchivoClinico tipoExamen, MultipartFile archivo) {
        Mascota mascota = mascotaRepositorio.findById(mascotaId)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        ConsultaMedica consulta = null;
        if (consultaId != null) {
            consulta = consultaMedicaRepositorio.findById(consultaId)
                    .orElseThrow(() -> new RuntimeException("Consulta médica no encontrada"));
        }

        if (tipoExamen == null) {
            throw new RuntimeException("El tipo de examen es obligatorio");
        }

        // Subir archivo físico
        String originalFilename = archivo.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            originalFilename = "archivo_clinico";
        }
        String fileUrl = storageService.guardarArchivoClinico(archivo);

        // Crear registro en base de datos
        ArchivoClinico nuevoArchivo = new ArchivoClinico();
        nuevoArchivo.setMascota(mascota);
        nuevoArchivo.setConsultaMedica(consulta);
        nuevoArchivo.setNombreOriginal(originalFilename);
        nuevoArchivo.setArchivoUrl(fileUrl);
        nuevoArchivo.setTipoExamen(tipoExamen);
        nuevoArchivo.setFechaSubida(LocalDate.now());
        nuevoArchivo.setDescripcion(descripcion);

        return archivoClinicoRepositorio.save(nuevoArchivo);
    }
}
