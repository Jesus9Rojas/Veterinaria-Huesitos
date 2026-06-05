# Huesitos Web App

Este es el repositorio principal (monorepo) del proyecto Huesitos.

## Estructura del Proyecto

- `huesitos-backend/` - API Backend en Spring Boot
- `huesitos-frontend/` - Aplicación Frontend en React

---

## 🛠️ Habilidades (Entorno Local Real)

* **Backend**: Java 26 con Spring Boot 4.
* **Frontend**: React 18 con Tailwind CSS 3.4.
* **Base de Datos**: MySQL 8.4.
* **Arquitectura**: API REST en capas, intercambio JSON y seguridad JWT.

---

## 📜 Reglas de Desarrollo y Flujo de Git

### Flujo de Ramas
* **`main`**: Solo código en producción 100% funcional.
* **`develop`**: Rama de integración de características.
* **`feature/nombre-funcion`**: Ramas temporales para avanzar tareas específicas.

### Regla de Merge (Fusión)
Se trabaja en la rama `feature/`. Al terminar y probar por completo la función o integración, se realiza el merge hacia la rama `develop`.

### Reglas de Commits (Mensajes en español)
* **`feat`**: Nueva funcionalidad (ej. `feat: agregar registro de mascotas`).
* **`fix`**: Corrección de errores (ej. `fix: reparar conexion mysql`).
* **`docs`**: Cambios en documentación (ej. `docs: actualizar readme`).
* **`style`**: Cambios visuales con Tailwind (ej. `style: ajustar botones`).

### Idioma General
Todo el código (clases, variables, métodos, tablas en minúscula/plural) y la documentación se escriben estrictamente en **español**.
# Huesitos Frontend

Aplicación web construida con **React 18** y **Tailwind CSS 3.4** para el proyecto Huesitos.

## Tecnologías Utilizadas

- **React 18**: Biblioteca para construir interfaces de usuario.
- **Tailwind CSS 3.4**: Framework de CSS utilitario para diseño responsivo.
- **Vite**: Entorno de desarrollo rápido y empaquetador para producción.

## Comandos Disponibles

En el directorio del proyecto, puedes ejecutar:

### `npm run dev`

Inicia el servidor de desarrollo local.

### `npm run build`

Compila la aplicación para producción en la carpeta `dist`.

### `npm run lint`

Ejecuta el linter (ESLint) para verificar la calidad del código.
