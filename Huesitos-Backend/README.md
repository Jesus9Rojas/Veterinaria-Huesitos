# Huesitos Backend

API construida con Spring Boot 4 y Java 26 para el proyecto Huesitos.

---

## Prerrequisitos

Antes de iniciar el backend, asegúrate de tener instalado y configurado lo siguiente en tu entorno de desarrollo:

1. **Java Development Kit (JDK) 26**: Asegúrate de tener configurada la variable de entorno `JAVA_HOME`.
2. **MySQL Server 8.4+**: Motor de base de datos relacional.
3. **Maven 3.9+** (opcional, ya que el proyecto incluye Maven Wrapper `mvnw`).

---

## Configuración Inicial

### 1. Base de Datos (MySQL)
Debes crear la base de datos localmente antes de ejecutar la aplicación.

Abre tu gestor de base de datos preferido (o la terminal de MySQL) y ejecuta:
```sql
CREATE DATABASE huesitos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configurar Propiedades del Sistema
Las credenciales de conexión se encuentran en el archivo:
`src/main/resources/application.properties`

Por defecto, la configuración de la conexión es:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/huesitos?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=admin
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```
*Si tus credenciales locales (usuario o contraseña) son diferentes, por favor actualiza estas propiedades en tu archivo local.*

---

## Cómo Inicializar el Backend

Puedes compilar y ejecutar el proyecto utilizando el Maven Wrapper incluido en el proyecto (`mvnw` para sistemas basados en Unix/Linux/macOS o `mvnw.cmd` para Windows).

### 1. Limpiar y Compilar el Proyecto
Ejecuta el siguiente comando en la raíz del directorio `huesitos-backend` para descargar las dependencias y verificar la compilación:

**En Windows (Command Prompt o PowerShell):**
```bash
.\mvnw.cmd clean install
```

**En Linux / macOS:**
```bash
./mvnw clean install
```

### 2. Ejecutar la Aplicación
Una vez compilado correctamente, inicia el servidor de desarrollo Spring Boot:

**En Windows:**
```bash
.\mvnw.cmd spring-boot:run
```

**En Linux / macOS:**
```bash
./mvnw spring-boot:run
```

El servidor web se iniciará por defecto en el puerto `8080` (o el puerto configurado en `application.properties`).

---

## Estructura del Proyecto

El backend sigue una arquitectura de patrón de capas estricto:
- **`entidades/`**: Mapeo de objetos de base de datos con JPA (e.g. `Usuario`, `Mascota`, `Cita`, `ConsultaMedica`, `Transaccion`, `Servicio`).
- **`repositorios/`**: Interfaces de persistencia que extienden de `JpaRepository`.
- **`servicios/`**: Clases donde reside toda la lógica de negocio y validaciones del sistema.
- **`controladores/`**: Controladores REST expuestos con `@RestController` que devuelven respuestas en formato JSON.
- **`config/`**: Configuraciones generales de seguridad (Spring Security, JWT, CORS) y utilidades.
