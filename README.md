# 🅿️ Parking Manager

Sistema de gestión web para un parking privado de 44 plazas, desarrollado como proyecto final de la asignatura PDAUF.

Permite al administrador (propietario del parking) gestionar conductores, sus vehículos, la asignación de plazas y el control de pagos mensuales.

---

## Descripción del parking

- **2 plantas**: planta baja (0) y primera planta (1)
- **22 plazas por planta**: 2 hileras de 11 plazas cada una
- **44 plazas en total**, numeradas del 1 al 22 en cada planta
- Estructura fija: las plazas se crean automáticamente al arrancar la aplicación por primera vez

---

## Tecnologías utilizadas

### Backend

| Tecnología | Versión |
|---|---|
| Java | 17 (LTS) |
| Spring Boot | 3.4.x |
| Spring Security + JWT | jjwt 0.12.6 |
| Spring Data JPA | Hibernate |
| MySQL | 8.x (XAMPP) |
| Lombok | Última |
| Maven | Gestor de dependencias |

### Frontend

| Tecnología | Versión |
|---|---|
| React | 18+ |
| Vite | 6.x |
| React Router DOM | v6 |
| Tailwind CSS | 4.x |
| Axios | Última |

---

## Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Java 17**: verificar con `java -version` (debe mostrar 17.x)
- **Node.js 18+**: verificar con `node -v` (recomendado v20 LTS). Descargar desde https://nodejs.org
- **npm**: viene incluido con Node.js. Verificar con `npm -v`
- **XAMPP**: con MySQL activo. Descargar desde https://www.apachefriends.org
- **Maven**: incluido en IntelliJ IDEA o instalar manualmente

---

## Instalación y puesta en marcha

### 1. Base de datos

1. Abrir XAMPP y arrancar el servicio **MySQL**
2. Acceder a **phpMyAdmin** (http://localhost/phpmyadmin)
3. Ejecutar el siguiente SQL:

```sql
CREATE DATABASE IF NOT EXISTS parking_manager
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

> Las tablas se crean automáticamente al arrancar el backend gracias a `spring.jpa.hibernate.ddl-auto=update`.

### 2. Backend

1. Abrir la carpeta `backend/` en IntelliJ IDEA
2. Esperar a que Maven descargue todas las dependencias
3. Verificar la configuración en `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/parking_manager?useSSL=false&serverTimezone=Europe/Madrid
spring.datasource.username=root
spring.datasource.password=
```

4. Ejecutar la clase principal `ParkingApplication.java`
5. El backend arrancará en **http://localhost:8080**
6. Al arrancar por primera vez, se crearán automáticamente las 44 plazas en la base de datos

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend arrancará en **http://localhost:5173**

### 4. Primer acceso

1. Acceder a http://localhost:5173
2. Hacer clic en **Registrarse**
3. Crear una cuenta de administrador (se asigna `ROLE_ADMIN` por defecto)
4. Una vez dentro, ya se puede acceder a todas las funcionalidades

---

## Funcionalidades

### Autenticación

- Registro de nuevos usuarios con validación de campos
- Login con email y contraseña
- Protección de rutas privadas mediante JWT
- Cierre de sesión con eliminación del token

### Gestión de conductores

- Listado de todos los conductores registrados
- Crear, editar y eliminar conductores
- Datos: nombre, apellidos, DNI (único), teléfono y email
- Vista expandible para ver los vehículos de cada conductor
- Añadir/editar/eliminar vehículos desde el perfil del conductor
- Al eliminar un conductor, se liberan automáticamente sus plazas asignadas

### Listado de vehículos

- Tabla global con todos los vehículos del parking
- Búsqueda en tiempo real por cualquier campo (matrícula, marca, modelo, color, conductor, DNI, plaza)
- Ordenación por columnas haciendo clic en las cabeceras
- Crear nuevos vehículos asociándolos obligatoriamente a un conductor
- Editar y eliminar vehículos directamente desde la tabla

### Mapa de plazas

- Vista visual del parking con las 2 plantas (selector de planta)
- Representación en 2 hileras de 11 plazas simulando la distribución real
- Código de colores: verde (libre) / rojo (ocupada)
- Asignar un conductor a una plaza libre
- Liberar una plaza ocupada
- Resumen de plazas totales, libres y ocupadas por planta

### Gestión de pagos

- Acceso desde cada plaza ocupada en el mapa
- Vista de los 12 meses del año con selector de año
- Crear pagos mensuales (la cantidad se toma automáticamente de la tarifa de la plaza)
- Marcar/desmarcar pagos como realizados (toggle)
- Eliminar pagos
- Código de colores: verde (pagado), amarillo (pendiente), gris (sin pago registrado)
- Tarifa configurable por plaza (por defecto 40€/mes)

---

## Estructura del proyecto

```
parking-manager/
├── backend/
│   ├── src/main/java/com/andres/parking/
│   │   ├── config/          # Seguridad, JWT filter, CORS, excepciones, inicialización
│   │   ├── controllers/     # AuthController, Conductor, Vehiculo, Plaza, Pago
│   │   ├── dto/             # LoginRequest, RegisterRequest
│   │   ├── entities/        # Usuario, Conductor, Vehiculo, Plaza, Pago
│   │   ├── repositories/    # JPA repositories
│   │   └── services/        # JwtService, CustomUserDetailsService
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, ProtectedRoute
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Home, Login, Register, Conductores, Coches, Plazas, 404
│   │   ├── services/        # api.js (axios + interceptores JWT)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── CLAUDE.md
└── README.md
```

---

## Endpoints de la API

### Públicos

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Login, devuelve JWT |
| POST | `/auth/register` | Registro de usuario |

### Protegidos (requieren JWT)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/conductores` | Listar conductores |
| GET | `/api/conductores/{id}` | Obtener conductor |
| POST | `/api/conductores` | Crear conductor |
| PUT | `/api/conductores/{id}` | Actualizar conductor |
| DELETE | `/api/conductores/{id}` | Eliminar conductor |
| GET | `/api/conductores/{id}/vehiculos` | Vehículos de un conductor |
| POST | `/api/vehiculos` | Crear vehículo |
| PUT | `/api/vehiculos/{id}` | Actualizar vehículo |
| DELETE | `/api/vehiculos/{id}` | Eliminar vehículo |
| GET | `/api/plazas` | Listar plazas (filtrable por planta) |
| PUT | `/api/plazas/{id}/asignar/{conductorId}` | Asignar conductor a plaza |
| PUT | `/api/plazas/{id}/liberar` | Liberar plaza |
| PUT | `/api/plazas/{id}/tarifa` | Actualizar tarifa |
| GET | `/api/plazas/{id}/pagos` | Pagos de una plaza |
| POST | `/api/pagos` | Registrar pago |
| PUT | `/api/pagos/{id}/toggle` | Marcar/desmarcar como pagado |
| DELETE | `/api/pagos/{id}` | Eliminar pago |

---

## Roles de usuario

| Rol | Permisos |
|---|---|
| `ROLE_ADMIN` | Acceso completo: CRUD de conductores, vehículos, plazas y pagos |
| `ROLE_USER` | Solo lectura (GET). Reservado para futuras versiones |

Al registrarse se asigna `ROLE_ADMIN` por defecto.

---

## Autor

**Andrés Moreno** — Proyecto final PDAUF (2025-2026)
