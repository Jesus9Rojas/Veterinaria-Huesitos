package huesitos_backend.servicios;

import huesitos_backend.entidades.HorarioPersonal;
import huesitos_backend.entidades.Usuario;
import huesitos_backend.repositorios.HorarioPersonalRepositorio;
import huesitos_backend.repositorios.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HorarioPersonalServicio {

    private final HorarioPersonalRepositorio horarioPersonalRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;

    /**
     * Obtiene los horarios semanales de un usuario.
     */
    @Transactional(readOnly = true)
    public List<HorarioPersonal> obtenerHorariosPorUsuario(Long usuarioId) {
        if (!usuarioRepositorio.existsById(usuarioId)) {
            throw new RuntimeException("Usuario no encontrado");
        }
        return horarioPersonalRepositorio.findByUsuarioId(usuarioId);
    }

    /**
     * Guarda o actualiza la configuración de horario para un día específico de la semana de un usuario.
     */
    @Transactional
    public HorarioPersonal guardarOActualizarHorario(Long usuarioId, HorarioPersonal nuevoHorario) {
        Usuario usuario = usuarioRepositorio.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (nuevoHorario.getDiaSemana() == null) {
            throw new RuntimeException("El día de la semana es obligatorio");
        }

        Optional<HorarioPersonal> horarioExistente = horarioPersonalRepositorio
                .findByUsuarioIdAndDiaSemana(usuarioId, nuevoHorario.getDiaSemana());

        HorarioPersonal horario;
        if (horarioExistente.isPresent()) {
            horario = horarioExistente.get();
            horario.setHoraEntrada(nuevoHorario.getHoraEntrada());
            horario.setHoraSalida(nuevoHorario.getHoraSalida());
            horario.setActivo(nuevoHorario.getActivo());
        } else {
            horario = new HorarioPersonal();
            horario.setUsuario(usuario);
            horario.setDiaSemana(nuevoHorario.getDiaSemana());
            horario.setHoraEntrada(nuevoHorario.getHoraEntrada());
            horario.setHoraSalida(nuevoHorario.getHoraSalida());
            horario.setActivo(nuevoHorario.getActivo() != null ? nuevoHorario.getActivo() : true);
        }

        return horarioPersonalRepositorio.save(horario);
    }

    /**
     * Inicializa un horario por defecto (Lunes-Viernes 9:00 a 18:00, Sábados 9:00 a 13:00, Domingos inactivo)
     * para un nuevo miembro del personal.
     */
    @Transactional
    public List<HorarioPersonal> inicializarHorarioDefecto(Usuario usuario) {
        List<HorarioPersonal> horarios = new ArrayList<>();
        for (DayOfWeek dia : DayOfWeek.values()) {
            HorarioPersonal hp = new HorarioPersonal();
            hp.setUsuario(usuario);
            hp.setDiaSemana(dia);
            if (dia == DayOfWeek.SUNDAY) {
                hp.setHoraEntrada(null);
                hp.setHoraSalida(null);
                hp.setActivo(false);
            } else if (dia == DayOfWeek.SATURDAY) {
                hp.setHoraEntrada(LocalTime.of(9, 0));
                hp.setHoraSalida(LocalTime.of(13, 0));
                hp.setActivo(true);
            } else {
                hp.setHoraEntrada(LocalTime.of(9, 0));
                hp.setHoraSalida(LocalTime.of(18, 0));
                hp.setActivo(true);
            }
            horarios.add(horarioPersonalRepositorio.save(hp));
        }
        return horarios;
    }
}
