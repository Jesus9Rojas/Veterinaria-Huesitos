package huesitos_backend.servicios;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import huesitos_backend.entidades.ConsultaMedica;
import huesitos_backend.entidades.Mascota;
import huesitos_backend.entidades.Receta;
import huesitos_backend.entidades.Dueño;
import huesitos_backend.entidades.Personal;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;

@Service
public class PdfRecetaServicio {

    public byte[] generarRecetaPdf(Receta receta) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);

        try {
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            document.open();

            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.BLACK);
            Font fontSubtitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.DARK_GRAY);
            Font fontCabeceraTabla = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);
            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font fontNegrita = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Font fontItalica = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.DARK_GRAY);

            Paragraph titulo = new Paragraph("CLÍNICA VETERINARIA HUESITOS", fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            document.add(titulo);

            Paragraph direccion = new Paragraph("Santo Domingo De Marcona C-22, Ica | Tel: +51 994 142 421", fontNormal);
            direccion.setAlignment(Element.ALIGN_CENTER);
            document.add(direccion);

            String idReceta = receta.getId() != null ? String.format("%04d", receta.getId()) : "0000";
            Paragraph subtitulo = new Paragraph("INFORME MÉDICO Y RECETA - #" + idReceta, fontSubtitulo);
            subtitulo.setAlignment(Element.ALIGN_CENTER);
            subtitulo.setSpacingBefore(10);
            subtitulo.setSpacingAfter(5);
            document.add(subtitulo);

            Paragraph linea = new Paragraph("______________________________________________________________________________", fontNormal);
            linea.setAlignment(Element.ALIGN_CENTER);
            linea.setSpacingAfter(10);
            document.add(linea);

            String fechaEmision = receta.getFechaEmision() != null ? 
                receta.getFechaEmision().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : 
                LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            
            Paragraph fechaHeader = new Paragraph("Fecha de atención: " + fechaEmision, fontNormal);
            fechaHeader.setAlignment(Element.ALIGN_RIGHT);
            fechaHeader.setSpacingAfter(10);
            document.add(fechaHeader);

            ConsultaMedica consulta = receta.getConsultaMedica();
            if (consulta == null) throw new RuntimeException("La receta no tiene una consulta asociada.");
            
            Mascota mascota = consulta.getMascota();
            if (mascota == null) throw new RuntimeException("La consulta no tiene paciente.");
            
            Dueño dueno = mascota.getDueño();

            PdfPTable tablaPaciente = new PdfPTable(4);
            tablaPaciente.setWidthPercentage(100);
            tablaPaciente.setWidths(new float[]{2f, 3f, 2f, 3f});
            tablaPaciente.setSpacingAfter(20);

            agregarCeldaCabecera(tablaPaciente, "PACIENTE", fontCabeceraTabla);
            agregarCeldaDato(tablaPaciente, mascota.getNombre() != null ? mascota.getNombre().toUpperCase() : "NO REGISTRADO", fontNormal);
            agregarCeldaCabecera(tablaPaciente, "ESPECIE/RAZA", fontCabeceraTabla);
            String especie = mascota.getEspecie() != null ? mascota.getEspecie() : "N/A";
            String raza = mascota.getRaza() != null ? mascota.getRaza() : "N/A";
            agregarCeldaDato(tablaPaciente, (especie + " / " + raza).toUpperCase(), fontNormal);

            agregarCeldaCabecera(tablaPaciente, "SEXO", fontCabeceraTabla);
            agregarCeldaDato(tablaPaciente, mascota.getSexo() != null ? mascota.getSexo().toUpperCase() : "N/A", fontNormal);
            agregarCeldaCabecera(tablaPaciente, "PESO ACTUAL", fontCabeceraTabla);
            agregarCeldaDato(tablaPaciente, mascota.getPesoActual() != null ? mascota.getPesoActual() + " Kg" : "N/A", fontNormal);

            agregarCeldaCabecera(tablaPaciente, "PROPIETARIO", fontCabeceraTabla);
            String nombreDueno = (dueno != null && dueno.getNombreCompleto() != null) ? dueno.getNombreCompleto().toUpperCase() : "NO REGISTRADO";
            PdfPCell celdaDueno = new PdfPCell(new Phrase(nombreDueno, fontNormal));
            celdaDueno.setColspan(3);
            celdaDueno.setPadding(5);
            celdaDueno.setHorizontalAlignment(Element.ALIGN_CENTER);
            tablaPaciente.addCell(celdaDueno);

            document.add(tablaPaciente);

            Paragraph tituloClinico = new Paragraph("1. RESUMEN CLÍNICO", fontSubtitulo);
            tituloClinico.setSpacingAfter(10);
            document.add(tituloClinico);

            document.add(new Paragraph("MOTIVO DE CONSULTA:", fontNegrita));
            String motivo = consulta.getMotivoConsulta() != null ? consulta.getMotivoConsulta() : "No especificado";
            Paragraph motPara = new Paragraph(motivo, fontNormal);
            motPara.setSpacingAfter(10);
            document.add(motPara);

            document.add(new Paragraph("SÍNTOMAS / ANAMNESIS:", fontNegrita));
            String sintomas = consulta.getSintomas() != null ? consulta.getSintomas() : "No especificado";
            Paragraph sinPara = new Paragraph(sintomas, fontNormal);
            sinPara.setSpacingAfter(10);
            document.add(sinPara);

            document.add(new Paragraph("DIAGNÓSTICO PRESUNTIVO:", fontNegrita));
            String diagnostico = consulta.getDiagnostico() != null ? consulta.getDiagnostico() : "No especificado";
            Paragraph diagPara = new Paragraph(diagnostico, fontNormal);
            diagPara.setSpacingAfter(20);
            document.add(diagPara);

            Paragraph lineaMedia = new Paragraph("-------------------------------------------------------------------------------------------------------------------------", fontItalica);
            lineaMedia.setAlignment(Element.ALIGN_CENTER);
            lineaMedia.setSpacingAfter(15);
            document.add(lineaMedia);

            Paragraph tituloReceta = new Paragraph("2. RECETA MÉDICA", fontSubtitulo);
            tituloReceta.setSpacingAfter(10);
            document.add(tituloReceta);

            document.add(new Paragraph("MEDICAMENTOS PRESCRITOS:", fontNegrita));
            String medicamentos = receta.getMedicamentos() != null ? receta.getMedicamentos() : "Ninguno";
            Paragraph medPara = new Paragraph(medicamentos, fontNormal);
            medPara.setSpacingAfter(10);
            document.add(medPara);

            document.add(new Paragraph("INDICACIONES Y DOSIS:", fontNegrita));
            String indicaciones = receta.getIndicaciones() != null ? receta.getIndicaciones() : "Ninguna";
            Paragraph indPara = new Paragraph(indicaciones, fontNormal);
            indPara.setSpacingAfter(20);
            document.add(indPara);

            if (consulta.getObservaciones() != null && !consulta.getObservaciones().trim().isEmpty()) {
                document.add(new Paragraph("OBSERVACIONES / RECOMENDACIONES:", fontNegrita));
                Paragraph obsPara = new Paragraph(consulta.getObservaciones(), fontNormal);
                obsPara.setSpacingAfter(20);
                document.add(obsPara);
            }

            String nombreVet = "MÉDICO EN TURNO";
            if (consulta.getVeterinario() != null && consulta.getVeterinario().getPersonal() != null) {
                String nombrePersonal = consulta.getVeterinario().getPersonal().getNombreCompleto();
                if (nombrePersonal != null) {
                    nombreVet = nombrePersonal.toUpperCase();
                }
            }
            
            Paragraph firma = new Paragraph("___________________________________\nDr/a. " + nombreVet + "\nMédico Veterinario", fontNormal);
            firma.setAlignment(Element.ALIGN_CENTER);
            firma.setSpacingBefore(40);
            document.add(firma);

            document.close();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error interno generando el PDF: " + e.getMessage());
        }
        return baos.toByteArray();
    }

    private void agregarCeldaCabecera(PdfPTable tabla, String texto, Font font) {
        PdfPCell celda = new PdfPCell(new Phrase(texto, font));
        celda.setBackgroundColor(new Color(230, 230, 230)); 
        celda.setHorizontalAlignment(Element.ALIGN_CENTER);
        celda.setVerticalAlignment(Element.ALIGN_MIDDLE);
        celda.setPadding(6);
        tabla.addCell(celda);
    }

    private void agregarCeldaDato(PdfPTable tabla, String texto, Font font) {
        PdfPCell celda = new PdfPCell(new Phrase(texto, font));
        celda.setHorizontalAlignment(Element.ALIGN_CENTER);
        celda.setVerticalAlignment(Element.ALIGN_MIDDLE);
        celda.setPadding(6);
        tabla.addCell(celda);
    }
}