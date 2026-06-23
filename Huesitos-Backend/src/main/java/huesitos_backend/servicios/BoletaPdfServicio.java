package huesitos_backend.servicios;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import huesitos_backend.entidades.*;
import huesitos_backend.repositorios.TransaccionRepositorio;
import huesitos_backend.repositorios.DetallePedidoRepositorio;
import huesitos_backend.repositorios.DueñoRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoletaPdfServicio {

    private final TransaccionRepositorio transaccionRepositorio;
    private final DetallePedidoRepositorio detallePedidoRepositorio;
    private final DueñoRepositorio dueñoRepositorio;

    @Transactional(readOnly = true)
    public byte[] generarPdfComprobante(Long transaccionId, String tipoComprobante) {
        Transaccion transaccion = transaccionRepositorio.findById(transaccionId)
                .orElseThrow(() -> new RuntimeException("Transacción no encontrada"));

        if (transaccion.getEstadoPago() != huesitos_backend.entidades.EstadoPago.APROBADO) {
            throw new RuntimeException("No se puede generar comprobante para una transacción no aprobada");
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A5);
        document.setMargins(20, 20, 20, 20);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(44, 62, 80));
            Paragraph header = new Paragraph("VETERINARIA HUESITOS 🐶", titleFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(127, 140, 141));
            Paragraph subheader = new Paragraph("R.U.C. N° 20123456789\nCalle de las Mascotas 123 - San Borja\nContacto: info@huesitos.com | (01) 456-7890", subFont);
            subheader.setAlignment(Element.ALIGN_CENTER);
            subheader.setSpacingAfter(10);
            document.add(subheader);

            Paragraph separator = new Paragraph("____________________________________________________", subFont);
            separator.setSpacingAfter(10);
            document.add(separator);

            String nombreDoc = "FACTURA".equalsIgnoreCase(tipoComprobante) ? "FACTURA ELECTRÓNICA" : "BOLETA DE VENTA ELECTRÓNICA";
            String prefijo = "FACTURA".equalsIgnoreCase(tipoComprobante) ? "F001-" : "B001-";
            
            Font docTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(46, 204, 113));
            Paragraph docTitle = new Paragraph(nombreDoc, docTitleFont);
            docTitle.setAlignment(Element.ALIGN_CENTER);
            docTitle.setSpacingAfter(15);
            document.add(docTitle);

            String nombreCliente = "Cliente Anónimo";
            String infoExtra = "";
            
            if (transaccion.getCita() != null) {
                Cita cita = transaccion.getCita();
                if (cita.getMascota().getDueño() != null) {
                    nombreCliente = cita.getMascota().getDueño().getNombreCompleto();
                } else {
                     nombreCliente = "Cliente no asignado";
                }
                infoExtra = "Mascota: " + cita.getMascota().getNombre() + " (" + cita.getMascota().getEspecie() + ")";
            } else if (transaccion.getPedido() != null) {
                Pedido pedido = transaccion.getPedido();
                if (pedido.getCliente() != null) {
                    Dueño dueño = dueñoRepositorio.findByUsuarioId(pedido.getCliente().getId()).orElse(null);
                    if (dueño != null && dueño.getNombreCompleto() != null) {
                        nombreCliente = dueño.getNombreCompleto();
                    } else {
                        nombreCliente = pedido.getCliente().getCorreo();
                    }
                }
                infoExtra = "Tipo: Venta de Productos (Tienda)";
            }

            PdfPTable tableDetalles = new PdfPTable(2);
            tableDetalles.setWidthPercentage(100);
            tableDetalles.setSpacingAfter(15);

            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(44, 62, 80));
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(51, 51, 51));

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
            String fechaStr = transaccion.getFechaPago() != null ? transaccion.getFechaPago().format(formatter) : "-";

            tableDetalles.addCell(crearCeldaSinBorde("Comprobante N°: " + prefijo + String.format("%06d", transaccion.getId()), labelFont, valueFont));
            tableDetalles.addCell(crearCeldaSinBorde("Fecha Emisión: " + fechaStr, labelFont, valueFont));
            tableDetalles.addCell(crearCeldaSinBorde("Cliente: " + nombreCliente, labelFont, valueFont));
            
            String medioPagoStr = transaccion.getMedioPago() != null ? transaccion.getMedioPago().toString() : "No especificado";
            tableDetalles.addCell(crearCeldaSinBorde("Medio de Pago: " + medioPagoStr, labelFont, valueFont));
            
            tableDetalles.addCell(crearCeldaSinBorde(infoExtra, labelFont, valueFont));
            
            String pasarelaId = transaccion.getIdTransaccionPasarela() != null ? transaccion.getIdTransaccionPasarela() : (transaccion.getReferenciaPago() != null ? transaccion.getReferenciaPago() : "Pago Directo");
            tableDetalles.addCell(crearCeldaSinBorde("Ref. Pago: " + pasarelaId, labelFont, valueFont));

            document.add(tableDetalles);
            document.add(separator);

            PdfPTable tableItems = new PdfPTable(3);
            tableItems.setWidthPercentage(100);
            tableItems.setWidths(new float[]{60, 20, 20});
            tableItems.setSpacingAfter(20);

            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            PdfPCell cellHeader1 = new PdfPCell(new Phrase("Descripción", tableHeaderFont));
            cellHeader1.setBackgroundColor(new Color(44, 62, 80));
            cellHeader1.setPadding(6);
            
            PdfPCell cellHeader2 = new PdfPCell(new Phrase("Cant.", tableHeaderFont));
            cellHeader2.setBackgroundColor(new Color(44, 62, 80));
            cellHeader2.setPadding(6);
            cellHeader2.setHorizontalAlignment(Element.ALIGN_CENTER);
            
            PdfPCell cellHeader3 = new PdfPCell(new Phrase("Total", tableHeaderFont));
            cellHeader3.setBackgroundColor(new Color(44, 62, 80));
            cellHeader3.setPadding(6);
            cellHeader3.setHorizontalAlignment(Element.ALIGN_RIGHT);

            tableItems.addCell(cellHeader1);
            tableItems.addCell(cellHeader2);
            tableItems.addCell(cellHeader3);

            if (transaccion.getCita() != null) {
                Cita cita = transaccion.getCita();
                
                PdfPCell cellItem = new PdfPCell(new Phrase("Consulta: " + cita.getServicio().getNombre(), valueFont));
                cellItem.setPadding(6);
                tableItems.addCell(cellItem);

                PdfPCell cellCant = new PdfPCell(new Phrase("1", valueFont));
                cellCant.setPadding(6);
                cellCant.setHorizontalAlignment(Element.ALIGN_CENTER);
                tableItems.addCell(cellCant);

                PdfPCell cellTotal = new PdfPCell(new Phrase("S/. " + String.format("%.2f", cita.getServicio().getPrecio()), valueFont));
                cellTotal.setPadding(6);
                cellTotal.setHorizontalAlignment(Element.ALIGN_RIGHT);
                tableItems.addCell(cellTotal);

                if (cita.getItemsCobro() != null && !cita.getItemsCobro().isEmpty()) {
                    for (ItemCobroCita item : cita.getItemsCobro()) {
                        PdfPCell cellExtraItem = new PdfPCell(new Phrase(item.getTipoItem() + ": " + item.getNombreItem(), valueFont));
                        cellExtraItem.setPadding(6);
                        tableItems.addCell(cellExtraItem);

                        PdfPCell cellExtraCant = new PdfPCell(new Phrase(String.valueOf(item.getCantidad()), valueFont));
                        cellExtraCant.setPadding(6);
                        cellExtraCant.setHorizontalAlignment(Element.ALIGN_CENTER);
                        tableItems.addCell(cellExtraCant);

                        PdfPCell cellExtraTotal = new PdfPCell(new Phrase("S/. " + String.format("%.2f", item.getSubtotal()), valueFont));
                        cellExtraTotal.setPadding(6);
                        cellExtraTotal.setHorizontalAlignment(Element.ALIGN_RIGHT);
                        tableItems.addCell(cellExtraTotal);
                    }
                }

            } else if (transaccion.getPedido() != null) {
                List<DetallePedido> detalles = detallePedidoRepositorio.findByPedidoId(transaccion.getPedido().getId());
                for(DetallePedido det : detalles) {
                    PdfPCell cellItem = new PdfPCell(new Phrase(det.getProducto().getNombre(), valueFont));
                    cellItem.setPadding(6);
                    tableItems.addCell(cellItem);

                    PdfPCell cellCant = new PdfPCell(new Phrase(det.getCantidad().toString(), valueFont));
                    cellCant.setPadding(6);
                    cellCant.setHorizontalAlignment(Element.ALIGN_CENTER);
                    tableItems.addCell(cellCant);

                    BigDecimal subtotal = det.getPrecioUnitario().multiply(new BigDecimal(det.getCantidad()));
                    PdfPCell cellTotal = new PdfPCell(new Phrase("S/. " + subtotal.toString(), valueFont));
                    cellTotal.setPadding(6);
                    cellTotal.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    tableItems.addCell(cellTotal);
                }
            }

            document.add(tableItems);

            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(44, 62, 80));
            Paragraph totalParagraph = new Paragraph("TOTAL PAGADO: S/. " + String.format("%.2f", transaccion.getMonto()), totalFont);
            totalParagraph.setAlignment(Element.ALIGN_RIGHT);
            totalParagraph.setSpacingAfter(30);
            document.add(totalParagraph);

            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, new Color(127, 140, 141));
            Paragraph footer = new Paragraph("¡Gracias por confiar en nosotros! 🐾", footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error al estructurar el documento PDF del comprobante", e);
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