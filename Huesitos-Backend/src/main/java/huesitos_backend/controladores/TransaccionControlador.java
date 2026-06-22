package huesitos_backend.controladores;

import huesitos_backend.dto.ReporteFinanciero;
import huesitos_backend.entidades.MedioPago;
import huesitos_backend.entidades.Transaccion;
import huesitos_backend.servicios.TransaccionServicio;
import huesitos_backend.servicios.BoletaPdfServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transacciones")
@RequiredArgsConstructor
public class TransaccionControlador {

    private final TransaccionServicio transaccionServicio;
    private final BoletaPdfServicio boletaPdfServicio;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Transaccion>> listarTodas() {
        return ResponseEntity.ok(transaccionServicio.listarTodas());
    }

    @PatchMapping("/{id}/pagar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<Transaccion> procesarPago(
            @PathVariable Long id, 
            @RequestParam MedioPago medioPago,
            @RequestParam(required = false, defaultValue = "CAJA_RECEPCION") String referencia) {
        
        Transaccion transaccionPagada = transaccionServicio.procesarPagoCaja(id, medioPago, referencia);
        return ResponseEntity.ok(transaccionPagada);
    }

    @GetMapping("/{id}/comprobante")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE')")
    public ResponseEntity<byte[]> descargarComprobante(
            @PathVariable Long id, 
            @RequestParam(defaultValue = "BOLETA") String tipo) {
        
        byte[] pdf = boletaPdfServicio.generarPdfComprobante(id, tipo);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        
        String filename = ("FACTURA".equalsIgnoreCase(tipo) ? "Factura" : "Boleta") + "-Huesitos-" + id + ".pdf";
        headers.setContentDispositionFormData("inline", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    @GetMapping("/reporte")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR')")
    public ResponseEntity<ReporteFinanciero> obtenerReporte(
            @RequestParam String fecha) {
        LocalDate fechaBuscada = LocalDate.parse(fecha);
        return ResponseEntity.ok(transaccionServicio.generarReporteDiario(fechaBuscada));
    }
}