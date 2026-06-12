package huesitos_backend;

import huesitos_backend.entidades.Dueño;
import huesitos_backend.entidades.Rol;
import huesitos_backend.entidades.Usuario;
import huesitos_backend.repositorios.DueñoRepositorio;
import huesitos_backend.repositorios.UsuarioRepositorio;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableMethodSecurity
public class HuesitosBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(HuesitosBackendApplication.class, args);
    }

    // @Bean
    // public CommandLineRunner inicializarDatos(UsuarioRepositorio usuarioRepo, DueñoRepositorio dueñoRepo, huesitos_backend.repositorios.PersonalRepositorio personalRepo, PasswordEncoder passwordEncoder) {
    //     return args -> {
    //         String claveEncriptada = passwordEncoder.encode("123456");

    //         // 1. Crear cuenta de ADMINISTRADOR
    //         if (usuarioRepo.findByCorreo("admin@huesitos.com").isEmpty()) {
    //             Usuario admin = new Usuario();
    //             admin.setCorreo("admin@huesitos.com");
    //             admin.setContrasena(claveEncriptada);
    //             admin.setRol(Rol.ADMINISTRADOR);
    //             admin.setActivo(true);
    //             admin.setFotoPerfilUrl("/uploads/defecto-usuario.png");
    //             Usuario adminGuardado = usuarioRepo.save(admin);

    //             // ¡NUEVO! Le asignamos sus datos de personal
    //             huesitos_backend.entidades.Personal personalAdmin = new huesitos_backend.entidades.Personal();
    //             personalAdmin.setNombreCompleto("Administrador Principal");
    //             personalAdmin.setTelefono("999111222");
    //             personalAdmin.setUsuario(adminGuardado);
    //             personalRepo.save(personalAdmin);
    //         }

    //         // 2. Crear cuenta de VETERINARIO
    //         if (usuarioRepo.findByCorreo("vet@huesitos.com").isEmpty()) {
    //             Usuario vet = new Usuario();
    //             vet.setCorreo("vet@huesitos.com");
    //             vet.setContrasena(claveEncriptada);
    //             vet.setRol(Rol.VETERINARIO);
    //             vet.setActivo(true);
    //             vet.setFotoPerfilUrl("/uploads/defecto-usuario.png");
    //             Usuario vetGuardado = usuarioRepo.save(vet);

    //             // ¡NUEVO! Le asignamos sus datos de personal
    //             huesitos_backend.entidades.Personal personalVet = new huesitos_backend.entidades.Personal();
    //             personalVet.setNombreCompleto("Médico Veterinario Jefe");
    //             personalVet.setTelefono("999333444");
    //             personalVet.setUsuario(vetGuardado);
    //             personalRepo.save(personalVet);
    //         }

    //         // 3. Crear cuenta de CLIENTE
    //         if (usuarioRepo.findByCorreo("cliente@ejemplo.com").isEmpty()) {
    //             Usuario cliente = new Usuario();
    //             cliente.setCorreo("cliente@ejemplo.com");
    //             cliente.setContrasena(claveEncriptada);
    //             cliente.setRol(Rol.CLIENTE);
    //             cliente.setActivo(true);
    //             cliente.setFotoPerfilUrl("/uploads/defecto-usuario.png");
    //             Usuario clienteGuardado = usuarioRepo.save(cliente);

    //             Dueño dueño = new Dueño();
    //             dueño.setNombreCompleto("Usuario de Prueba Cliente");
    //             dueño.setTelefono("999888777");
    //             dueño.setDireccion("Avenida Siempre Viva 123");
    //             dueño.setUsuario(clienteGuardado);
    //             dueñoRepo.save(dueño);
    //         }
    //     };
    // }
}