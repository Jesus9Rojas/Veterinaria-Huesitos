package huesitos_backend.servicios;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import huesitos_backend.entidades.ConsultaMedica;
import huesitos_backend.entidades.Receta;
import huesitos_backend.repositorios.ConsultaMedicaRepositorio;
import huesitos_backend.repositorios.RecetaRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RecetaServicio {

    private final RecetaRepositorio recetaRepositorio;
    private final ConsultaMedicaRepositorio consultaMedicaRepositorio;

    /**
     * Registra o actualiza la receta médica para una consulta.
     */
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

        // Verificar si la consulta ya tiene una receta
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

    /**
     * Obtiene la receta médica por ID de la consulta.
     */
    @Transactional(readOnly = true)
    public Receta obtenerRecetaPorConsulta(Long consultaId) {
        return recetaRepositorio.findByConsultaMedicaId(consultaId)
                .orElseThrow(() -> new RuntimeException("No se encontró receta para esta consulta médica"));
    }

    /**
     * Genera un archivo PDF para la receta especificada.
     */
    @Transactional(readOnly = true)
    public byte[] generarPdfReceta(Long recetaId) {
        Receta receta = recetaRepositorio.findById(recetaId)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));

        ConsultaMedica consulta = receta.getConsultaMedica();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A5); // Tamaño A5 es el estándar para recetas médicas
        document.setMargins(20, 20, 20, 20);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // 1. Cabecera / Título Premium
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(44, 62, 80));
            Paragraph header = new Paragraph("VETERINARIA HUESITOS 🐶", titleFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(127, 140, 141));
            Paragraph subheader = new Paragraph("Salud, cuidado y amor para tu mascota\nEmergencias y consultas 24 horas", subFont);
            subheader.setAlignment(Element.ALIGN_CENTER);
            subheader.setSpacingAfter(15);
            document.add(subheader);

            // Línea divisoria
            Paragraph separator = new Paragraph("____________________________________________________", subFont);
            separator.setSpacingAfter(10);
            document.add(separator);

            // 2. Título del Documento
            Font docTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(52, 152, 219));
            Paragraph docTitle = new Paragraph("RECETA MÉDICA", docTitleFont);
            docTitle.setAlignment(Element.ALIGN_CENTER);
            docTitle.setSpacingAfter(15);
            document.add(docTitle);

            // 3. Tabla de Información Paciente / Dueño / Veterinario
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingAfter(15);

            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(44, 62, 80));
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(51, 51, 51));

            // Fila 1
            table.addCell(crearCeldaSinBorde("Paciente: " + consulta.getMascota().getNombre(), labelFont, valueFont));
            table.addCell(crearCeldaSinBorde("Propietario: " + consulta.getMascota().getDueño().getNombreCompleto(), labelFont, valueFont));

            // Fila 2
            table.addCell(crearCeldaSinBorde("Especie/Raza: " + consulta.getMascota().getEspecie() + " / " + consulta.getMascota().getRaza(), labelFont, valueFont));
            table.addCell(crearCeldaSinBorde("Fecha Emisión: " + receta.getFechaEmision().toString(), labelFont, valueFont));

            // Fila 3
            table.addCell(crearCeldaSinBorde("Veterinario: " + consulta.getVeterinario().getCorreo(), labelFont, valueFont));
            table.addCell(crearCeldaSinBorde("Consulta ID: #" + consulta.getId(), labelFont, valueFont));

            document.add(table);

            // Línea divisoria
            document.add(separator);

            // 4. Sección de Medicamentos
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(44, 62, 80));
            Paragraph medTitle = new Paragraph("MEDICAMENTOS", sectionTitleFont);
            medTitle.setSpacingAfter(5);
            document.add(medTitle);

            Font contentFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(51, 51, 51));
            Paragraph medContent = new Paragraph(receta.getMedicamentos(), contentFont);
            medContent.setSpacingAfter(15);
            document.add(medContent);

            // 5. Sección de Indicaciones
            Paragraph indTitle = new Paragraph("INDICACIONES", sectionTitleFont);
            indTitle.setSpacingAfter(5);
            document.add(indTitle);

            Paragraph indContent = new Paragraph(receta.getIndicaciones(), contentFont);
            indContent.setSpacingAfter(30);
            document.add(indContent);

            // 6. Firma del Veterinario
            Paragraph firmaLine = new Paragraph("__________________________________\nFirma del Médico Veterinario", labelFont);
            firmaLine.setAlignment(Element.ALIGN_CENTER);
            document.add(firmaLine);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error al estructurar el documento PDF", e);
        }

        return out.toByteArray();
    }

    private PdfPCell crearCeldaSinBorde(String textoCompleto, Font labelFont, Font valueFont) {
        String[] partes = textoCompleto.split(":", 2);
        Phrase frase = new Phrase();
        if (partes.length == 2) {
            frase.add(new Chunk(partes[0] + ":", labelFont));
            frase.add(new Chunk(partes[1], valueFont));
        } else {
            frase.add(new Chunk(textoCompleto, valueFont));
        }
        PdfPCell celda = new PdfPCell(frase);
        celda.setBorder(Rectangle.NO_BORDER);
        celda.setPaddingBottom(5);
        return celda;
    }
}
