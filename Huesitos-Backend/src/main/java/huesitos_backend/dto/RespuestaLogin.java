package huesitos_backend.dto;

public record RespuestaLogin(
    String token,
    String correo,
    String rol
) {}
