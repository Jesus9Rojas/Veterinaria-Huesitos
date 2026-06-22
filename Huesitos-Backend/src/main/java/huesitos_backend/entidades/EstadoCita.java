package huesitos_backend.entidades;

public enum EstadoCita {
    PENDIENTE,
    CONFIRMADA,
    EN_ESPERA,
    EN_PROGRESO, // <-- ¡Añadido para que el consultorio funcione!
    COMPLETADA,
    CANCELADA
}