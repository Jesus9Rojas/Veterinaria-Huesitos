package huesitos_backend.servicios;

import huesitos_backend.entidades.ConfiguracionNegocio;
import huesitos_backend.entidades.Actividad;
import huesitos_backend.repositorios.ConfiguracionNegocioRepositorio;
import huesitos_backend.repositorios.ActividadRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ConfiguracionNegocioServicio {

    private final ConfiguracionNegocioRepositorio configuracionRepositorio;
    private final ActividadRepositorio actividadRepositorio;

    @Transactional
    public ConfiguracionNegocio obtenerConfiguracion() {
        // Buscamos el ID 1, si no existe lo creamos sin forzar el ID manualmente
        return configuracionRepositorio.findById(1L).orElseGet(() -> {
            ConfiguracionNegocio config = new ConfiguracionNegocio();
            config.setCorreoElectronico("contacto@huesitos.com");
            config.setTelefonoRegular("999-888-777");
            config.setCelularEmergencias("999-000-111");
            config.setDireccionFisica("Av. Principal 123, Ica");
            config.setHorarioSemana("Lunes a Sábado: 08:00 AM - 08:00 PM");
            config.setHorarioDomingo("Domingos: 09:00 AM - 02:00 PM");
            config.setMoneda("PEN");
            config.setImpuestoIgv(18.00);
            return configuracionRepositorio.save(config);
        });
    }

    @Transactional
    public ConfiguracionNegocio actualizarConfiguracion(ConfiguracionNegocio nuevaConfig) {
        ConfiguracionNegocio configActual = obtenerConfiguracion();
        
        configActual.setCorreoElectronico(nuevaConfig.getCorreoElectronico());
        configActual.setTelefonoRegular(nuevaConfig.getTelefonoRegular());
        configActual.setCelularEmergencias(nuevaConfig.getCelularEmergencias());
        configActual.setDireccionFisica(nuevaConfig.getDireccionFisica());
        configActual.setHorarioSemana(nuevaConfig.getHorarioSemana());
        configActual.setHorarioDomingo(nuevaConfig.getHorarioDomingo());
        configActual.setMoneda(nuevaConfig.getMoneda());
        configActual.setImpuestoIgv(nuevaConfig.getImpuestoIgv());

        ConfiguracionNegocio guardado = configuracionRepositorio.save(configActual);

        // Registro para el Dashboard
        Actividad actividad = new Actividad();
        actividad.setMensaje("El Administrador actualizó los parámetros globales del negocio.");
        actividad.setTipo("CONFIGURACION");
        actividad.setFecha(LocalDateTime.now());
        actividadRepositorio.save(actividad);

        return guardado;
    }
}