package huesitos_backend.controladores;

import huesitos_backend.entidades.ConsultaMedica;
import huesitos_backend.servicios.ConsultaMedicaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/consultas-medicas")
@RequiredArgsConstructor
public class ConsultaMedicaControlador {

    private final ConsultaMedicaServicio consultaMedicaServicio;

    @PostMapping
    public ResponseEntity<ConsultaMedica> registrar(@RequestBody ConsultaMedica consulta) {
        return ResponseEntity.ok(consultaMedicaServicio.registrarConsulta(consulta));
    }

    @GetMapping("/mascota/{mascotaId}")
    public ResponseEntity<List<ConsultaMedica>> listarPorMascota(@PathVariable Long mascotaId) {
        return ResponseEntity.ok(consultaMedicaServicio.obtenerHistorialMascota(mascotaId));
    }
}