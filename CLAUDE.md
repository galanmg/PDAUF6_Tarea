# CLAUDE.md — Gestor de Parking

## Descripción del proyecto

Aplicación web fullstack para gestionar un parking privado de 44 plazas (2 plantas × 22 plazas).
Permite al administrador (propietario del parking) gestionar conductores, sus vehículos, asignación de plazas y control de pagos mensuales.

**Contexto real**: parking gestionado por un propietario particular. 2 plantas (baja y primera), cada una con 2 hileras de 11 plazas (22 por planta, 44 en total). Todas las plazas están numeradas del 1 al 22 en cada planta. La estructura del parking es fija y no cambiará.

---

## Tecnologías

### Backend
- **Java 17** (LTS)
- **Spring Boot 3.4.x** (última versión estable de la rama 3.x)
- **Spring Security + JWT** (oauth2-resource-server + jjwt 0.12.6)
- **Spring Data JPA** con Hibernate
- **MySQL** como base de datos (gestionada con XAMPP + phpMyAdmin)
- **Lombok** para reducir boilerplate
- **Maven** como gestor de dependencias

### Frontend
- **React 18+** con Vite
- **React Router DOM v6** para navegación
- **Tailwind CSS** para estilos generales
- **shadcn/ui** como biblioteca de componentes (Table, Dialog, AlertDialog, Card, Badge, Button, Input)
- **Axios** o fetch para peticiones HTTP

### Requisitos del entorno

**Java 17**: verificar con `java -version` en terminal. Debe mostrar versión 17.x.

**Node.js 18+**: verificar con `node -v` en terminal. Debe mostrar v18.x o superior (recomendado v20 LTS). Si no está instalado, descargar desde https://nodejs.org (elegir versión LTS).

**npm**: viene incluido con Node.js. Verificar con `npm -v`.

**MySQL**: se ejecuta mediante XAMPP. Crear la base de datos `parking_manager` desde phpMyAdmin antes de arrancar el backend.

---

## Enfoque de desarrollo

Se desarrolla primero el **backend completo** (entidades, repositorios, servicios, controladores, seguridad) y luego el **frontend completo** (páginas, componentes, contexto de autenticación, llamadas a la API).

Orden recomendado del backend:
1. Estructura del proyecto Maven + dependencias
2. Entidades JPA y repositorios
3. Configuración de seguridad + JWT (AuthController, JwtService)
4. ConductorController (CRUD)
5. VehiculoController (CRUD)
6. PlazaController (asignación/liberación)
7. PagoController (registro/consulta de pagos)
8. Inicialización de las 44 plazas (CommandLineRunner)

Orden recomendado del frontend:
1. Scaffold con Vite + Tailwind + shadcn/ui
2. AuthContext + ProtectedRoute + páginas de login/registro
3. ConductoresPage (CRUD completo)
4. PlazasPage (mapa visual + asignación + pagos)
5. HomePage + NotFoundPage

---

## Estructura de carpetas

```
parking-manager/
├── backend/
│   ├── src/main/java/com/andres/parking/
│   │   ├── config/
│   │   │   ├── SecurityConfig.java        # Spring Security + JWT + CORS
│   │   │   └── GlobalExceptionHandler.java # Manejo global de errores
│   │   ├── controllers/
│   │   │   ├── AuthController.java         # POST /auth/login, /auth/register
│   │   │   ├── ConductorController.java    # CRUD /api/conductores
│   │   │   ├── VehiculoController.java     # CRUD /api/vehiculos
│   │   │   ├── PlazaController.java        # GET, PUT /api/plazas
│   │   │   └── PagoController.java         # CRUD /api/pagos
│   │   ├── dto/
│   │   │   ├── LoginRequest.java           # record con @Valid
│   │   │   └── RegisterRequest.java        # record con @Valid
│   │   ├── entities/
│   │   │   ├── Usuario.java                # implements UserDetails (solo auth)
│   │   │   ├── Conductor.java
│   │   │   ├── Vehiculo.java
│   │   │   ├── Plaza.java
│   │   │   └── Pago.java
│   │   ├── repositories/
│   │   │   ├── UsuarioRepository.java
│   │   │   ├── ConductorRepository.java
│   │   │   ├── VehiculoRepository.java
│   │   │   ├── PlazaRepository.java
│   │   │   └── PagoRepository.java
│   │   └── services/
│   │       ├── JwtService.java
│   │       └── CustomUserDetailsService.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ... (componentes reutilizables)
│   │   ├── pages/
│   │   │   ├── HomePage.jsx          # Pública - info del parking
│   │   │   ├── LoginPage.jsx         # Pública - formulario login
│   │   │   ├── RegisterPage.jsx      # Pública - formulario registro
│   │   │   ├── ConductoresPage.jsx   # Privada - CRUD de conductores
│   │   │   ├── PlazasPage.jsx        # Privada - mapa visual de plazas
│   │   │   └── NotFoundPage.jsx      # 404
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Estado global de autenticación
│   │   ├── services/
│   │   │   └── api.js                 # Configuración de fetch/axios con token
│   │   ├── App.jsx                    # React Router con rutas
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── package.json
│   └── vite.config.js
│
├── CLAUDE.md
├── PROMPTS.md
└── README.md
```

---

## Entidades y relaciones

### Usuario (solo autenticación)
| Campo          | Tipo           | Notas                          |
|----------------|----------------|--------------------------------|
| id             | Long           | PK, auto-generado              |
| email          | String         | Único, no nulo, login username |
| password       | String         | BCrypt, @JsonIgnore            |
| nombre         | String         |                                |
| apellidos      | String         |                                |
| roles          | String         | "ROLE_ADMIN" o "ROLE_USER"     |
| enabled        | Boolean        |                                |
| fechaRegistro  | LocalDateTime  |                                |

Implementa `UserDetails` de Spring Security.

**Gestión de roles (V1)**:
- `ROLE_ADMIN`: acceso total (CRUD de conductores, vehículos, plazas, pagos). Es el rol principal del proyecto.
- `ROLE_USER`: solo lectura (GET). Reservado para una futura V2; no se desarrolla en profundidad ahora.
- Al registrarse, por defecto se asigna `ROLE_ADMIN` (ya que el usuario principal es el propietario del parking).

### Conductor
| Campo     | Tipo   | Notas             |
|-----------|--------|--------------------|
| id        | Long   | PK, auto-generado  |
| nombre    | String | No nulo            |
| apellidos | String | No nulo            |
| dni       | String | Único              |
| telefono  | String |                    |
| email     | String |                    |

Relación: `@OneToMany` con Vehiculo (mappedBy = "conductor")
Relación: `@OneToMany` con Plaza (mappedBy = "conductor")

### Vehiculo
| Campo        | Tipo   | Notas              |
|--------------|--------|---------------------|
| id           | Long   | PK, auto-generado   |
| matricula    | String | Única               |
| marca        | String |                     |
| modelo       | String |                     |
| color        | String |                     |
| conductor_id | Long   | FK → Conductor      |

Relación: `@ManyToOne` con Conductor (`@JoinColumn(name = "conductor_id")`)

### Plaza
| Campo        | Tipo       | Notas                                          |
|--------------|------------|-------------------------------------------------|
| id           | Long       | PK, auto-generado                               |
| numero       | int        | 1-22                                            |
| planta       | int        | 0 (baja) o 1 (primera)                         |
| ocupada      | boolean    | Calculado según conductor asignado              |
| tarifa       | BigDecimal | Precio mensual. Por defecto 40.00 €             |
| conductor_id | Long       | FK → Conductor (nullable)                       |

Relación: `@ManyToOne` con Conductor (`@JoinColumn(name = "conductor_id", nullable = true)`)
Relación: `@OneToMany` con Pago (mappedBy = "plaza")

**Lógica de tarifa**:
- Tarifa estándar por defecto: **40.00 €/mes**
- Tarifa reducida (configurable por el admin): **30.00 €/mes**
- El campo `tarifa` se almacena en cada plaza y se puede editar individualmente.
- Al crear un pago, la cantidad se toma automáticamente de la tarifa de la plaza (el admin puede modificarla manualmente si lo necesita).

**Las 44 plazas se crean al iniciar la aplicación** (CommandLineRunner) con tarifa por defecto de 40.00 €.

### Pago
| Campo    | Tipo       | Notas                  |
|----------|------------|------------------------|
| id       | Long       | PK, auto-generado      |
| plaza_id | Long       | FK → Plaza             |
| mes      | int        | 1-12                   |
| anio     | int        | Año del pago           |
| cantidad | BigDecimal | Importe (ej: 40.00)    |
| pagado   | boolean    | true = pagado           |

Relación: `@ManyToOne` con Plaza (`@JoinColumn(name = "plaza_id")`)

**Unique constraint** en (plaza_id, mes, anio) para evitar pagos duplicados.

---

## Endpoints de la API

### Autenticación (públicos)
| Método | Ruta            | Descripción           | Body                                    |
|--------|-----------------|------------------------|----------------------------------------|
| POST   | /auth/login     | Login, devuelve token  | `{ email, password }`                  |
| POST   | /auth/register  | Registro de usuario    | `{ email, password, nombre, apellidos }` |

### Conductores (requieren JWT — ADMIN: CRUD, USER: solo GET)
| Método | Ruta                 | Descripción               |
|--------|----------------------|----------------------------|
| GET    | /api/conductores     | Listar todos               |
| GET    | /api/conductores/{id}| Obtener uno                |
| POST   | /api/conductores     | Crear conductor            |
| PUT    | /api/conductores/{id}| Actualizar conductor       |
| DELETE | /api/conductores/{id}| Eliminar conductor         |

### Vehículos (requieren JWT — ADMIN: CRUD, USER: solo GET)
| Método | Ruta                              | Descripción                        |
|--------|-----------------------------------|------------------------------------|
| GET    | /api/conductores/{id}/vehiculos   | Vehículos de un conductor          |
| POST   | /api/vehiculos                    | Crear vehículo (con conductor_id)  |
| PUT    | /api/vehiculos/{id}               | Actualizar vehículo                |
| DELETE | /api/vehiculos/{id}               | Eliminar vehículo                  |

### Plazas (requieren JWT — ADMIN: asignar/liberar/editar tarifa, USER: solo GET)
| Método | Ruta                                   | Descripción                            |
|--------|----------------------------------------|----------------------------------------|
| GET    | /api/plazas                            | Listar todas (para mapa visual)        |
| GET    | /api/plazas?planta=0                   | Filtrar por planta                     |
| PUT    | /api/plazas/{id}/asignar/{conductorId} | Asignar conductor a plaza              |
| PUT    | /api/plazas/{id}/liberar               | Liberar plaza                          |
| PUT    | /api/plazas/{id}/tarifa                | Actualizar tarifa de una plaza         |

### Pagos (requieren JWT — ADMIN: CRUD, USER: solo GET)
| Método | Ruta                        | Descripción                                         |
|--------|-----------------------------|----------------------------------------------------|
| GET    | /api/plazas/{id}/pagos      | Pagos de una plaza                                  |
| POST   | /api/pagos                  | Registrar pago (plaza_id, mes, anio; cantidad auto) |
| PUT    | /api/pagos/{id}/toggle      | Marcar/desmarcar como pagado                        |
| DELETE | /api/pagos/{id}             | Anular pago                                         |

---

## Páginas del frontend (React Router)

| Ruta            | Componente         | Acceso   | Descripción                          |
|-----------------|---------------------|----------|--------------------------------------|
| /               | HomePage            | Pública  | Info del parking, bienvenida         |
| /login          | LoginPage           | Pública  | Formulario de login                  |
| /registro       | RegisterPage        | Pública  | Formulario de registro               |
| /conductores    | ConductoresPage     | Privada  | CRUD completo de conductores         |
| /plazas         | PlazasPage          | Privada  | Mapa visual de plazas + pagos        |
| *               | NotFoundPage        | Pública  | Página 404                           |

---

## Autenticación JWT — Flujo completo

1. El usuario envía POST `/auth/login` con email y password
2. El backend valida credenciales y devuelve `{ "token": "eyJ..." }`
3. El frontend guarda el token en `localStorage`
4. Todas las peticiones a `/api/*` llevan el header `Authorization: Bearer <token>`
5. El backend valida el token con `oauth2ResourceServer` en cada petición
6. Al hacer logout, se elimina el token de `localStorage` y se redirige a `/login`

---

## Convenciones de código

### Backend (Java / Spring Boot)
- Paquete base: `com.andres.parking`
- Usar **Lombok** (`@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`)
- Entidades con **`@Entity`** y `@Table(name = "nombre_tabla")`
- DTOs como **Java records** con validación `@Valid`
- Controladores con `@RestController` y `@RequestMapping`
- Inyección de dependencias con `@Autowired` o `@RequiredArgsConstructor`
- Respuestas con `ResponseEntity`
- Password siempre con **BCrypt**
- Endpoints públicos: `/auth/**` — el resto requiere autenticación
- Java 17: no usar características exclusivas de Java 21+

### Frontend (React)
- Componentes como **funciones** (no clases)
- Usar **hooks** (useState, useEffect, useContext)
- Navegación con **`<Link>`** y **`<NavLink>`** de React Router (nunca `<a href>`)
- Estilos con **Tailwind CSS** (clases de utilidad)
- Componentes de **shadcn/ui** para UI (Table, Dialog, AlertDialog, Card, Badge, Button, Input)
- Estado de autenticación en un **AuthContext** con useContext
- Peticiones HTTP con **fetch** o **axios**, siempre añadiendo el token JWT en el header

---

## Configuración CORS (importante)

El SecurityConfig debe permitir peticiones desde el frontend:

```java
.cors(cors -> cors.configurationSource(request -> {
    var config = new org.springframework.web.cors.CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:5173"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    return config;
}))
```

---

## Base de datos

- **Motor**: MySQL (ejecutado mediante XAMPP)
- **Gestión**: phpMyAdmin
- **Nombre BD**: `parking_manager`
- **ddl-auto**: `update` (Hibernate crea/actualiza tablas automáticamente)
- Las 44 plazas se insertan al arrancar si la tabla está vacía

### SQL de creación de la base de datos

Ejecutar en phpMyAdmin antes de arrancar el backend:

```sql
-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS parking_manager
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Crear usuario dedicado (opcional, se puede usar root de XAMPP)
CREATE USER IF NOT EXISTS 'parking_user'@'localhost' IDENTIFIED BY 'parking_pass';
GRANT ALL PRIVILEGES ON parking_manager.* TO 'parking_user'@'localhost';
FLUSH PRIVILEGES;
```

> **Nota**: si se prefiere usar el usuario `root` sin contraseña (configuración por defecto de XAMPP), ajustar `application.properties` en consecuencia. Las tablas las creará Hibernate automáticamente al arrancar el backend gracias a `ddl-auto=update`.

### application.properties (referencia)

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/parking_manager?useSSL=false&serverTimezone=Europe/Madrid
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

server.port=8080
```

---

## Inicialización de plazas (CommandLineRunner)

Al arrancar la aplicación, si no hay plazas en la BD, se crean las 44:
- Planta 0: plazas 1 a 22 (tarifa = 40.00 €)
- Planta 1: plazas 1 a 22 (tarifa = 40.00 €)
- Todas con `ocupada = false` y `conductor = null`
