# Documento de Diseño Arquitectónico - Turnify SW (Sprint 1)

- **Fecha:** 2026-10-29
- **Proyecto:** Turnify SW (Sistema web de reserva y gestión de turnos)
- **Alcance:** Sprint 1 — Base del sistema (13 tareas principales, 24 subtareas, 58 Story Points)
- **Estado:** Aprobado

---

## 1. Introducción y Objetivos

Turnify SW es una plataforma web integral que permite a los clientes de un negocio de servicios reservar turnos en línea y a los administradores gestionar la oferta de servicios, definir la disponibilidad horaria y supervisar todas las reservas desde un panel centralizado.

El objetivo del Sprint 1 es construir los cimientos técnicos completos y la totalidad de las 13 historias de usuario y tareas de prioridad Alta identificadas en el backlog de Jira (SCRUM-9, SCRUM-5, SCRUM-6, SCRUM-8, SCRUM-10, SCRUM-24, SCRUM-11, SCRUM-13, SCRUM-14, SCRUM-19, SCRUM-20, SCRUM-21 y SCRUM-26).

---

## 2. Alcance Funcional y Mapeo con Jira

| Clave Jira | Tipo | Título | Puntos | Criterios clave |
|---|---|---|---|---|
| **SCRUM-9** | Técnica | Preparación de BD y estructura | 8 | Repo estructurado, modelo en 3FN, SQLite + Prisma, scripts de arranque |
| **SCRUM-5** | Funcional | TF-01: Registro de usuarios | 3 | Nombre, email único, password cifrado bcrypt, mensajes claros |
| **SCRUM-6** | Funcional | TF-02: Inicio y cierre de sesión | 5 | Roles CLIENT/ADMIN, JWT, protección de rutas, invalidación de sesión |
| **SCRUM-8** | Funcional | TF-10: Gestión de servicios | 5 | Solo ADMIN, CRUD + baja lógica (isActive: false), nombre único |
| **SCRUM-10** | Funcional | TF-03: Consulta de servicios disponibles | 3 | Catálogo público solo con servicios activos, link directo a reservar |
| **SCRUM-24** | Funcional | TF-11: Configuración de días y horarios | 5 | Solo ADMIN, franjas horarias por día, validación `endTime > startTime` |
| **SCRUM-11** | Funcional | TF-04: Consulta de días y horarios libres | 5 | Cálculo de slots libres y futuros, descarta turnos ya reservados |
| **SCRUM-13** | Funcional | TF-05: Creación de reservas | 8 | Requiere login, guarda cliente, servicio, fecha y hora |
| **SCRUM-14** | Funcional | TF-18: Prevención de reservas duplicadas | 8 | Validación BD + servidor, bloqueo de colisiones concurrentes (409) |
| **SCRUM-19** | Funcional | TF-06: Confirmación de reservas | 3 | Pantalla de confirmación con detalle + comprobante visible en "Mis turnos" |
| **SCRUM-20** | Funcional | TF-07: Consulta de turnos propios | 3 | Vista exclusiva de reservas del cliente, separa próximos y pasados |
| **SCRUM-21** | Funcional | TF-08: Cancelación de reservas | 5 | Solo reservas propias vigentes, confirmación, libera el cupo |
| **SCRUM-26** | Funcional | TF-12: Panel de reservas | 5 | Solo ADMIN, tabla completa, filtros por fecha, servicio y estado |

---

## 3. Arquitectura del Sistema

Se adopta una arquitectura desacoplada en **Monorepo** con separación nítida entre Backend y Frontend:

```
Turnify/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── package.json (scripts raíz para orquestación)
└── docs/
    └── superpowers/specs/2026-10-29-turnify-sprint1-design.md
```

---

## 4. Modelo de Datos Relacional (3ª Forma Normal)

El modelo está formalmente normalizado en **Tercera Forma Normal (3FN)**:
1. **1FN:** Todos los atributos son atómicos y poseen clave primaria única.
2. **2FN:** Todas las claves primarias son simples (`id`), eliminando dependencias parciales.
3. **3FN:** No existen dependencias funcionales transitivas entre atributos no-clave.

### Esquema Prisma (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CLIENT
  ADMIN
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}

model User {
  id           String        @id @default(cuid())
  name         String
  email        String        @unique
  password     String
  role         Role          @default(CLIENT)
  appointments Appointment[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@map("users")
}

model Service {
  id              String             @id @default(cuid())
  name            String             @unique
  description     String
  durationMinutes Int
  isActive        Boolean            @default(true)
  schedules       BusinessSchedule[]
  appointments    Appointment[]
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  @@map("services")
}

model BusinessSchedule {
  id                  String   @id @default(cuid())
  serviceId           String?
  service             Service? @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  dayOfWeek           Int      // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  startTime           String   // Formato "09:00"
  endTime             String   // Formato "18:00"
  slotDurationMinutes Int      @default(30)
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@map("business_schedules")
}

model Appointment {
  id                 String            @id @default(cuid())
  userId             String
  user               User              @relation(fields: [userId], references: [id], onDelete: Restrict)
  serviceId          String
  service            Service           @relation(fields: [serviceId], references: [id], onDelete: Restrict)
  date               String            // Formato "YYYY-MM-DD"
  time               String            // Formato "HH:mm"
  status             AppointmentStatus @default(CONFIRMED)
  cancellationReason String?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  @@index([serviceId, date, time])
  @@map("appointments")
}
```

---

## 5. Lógica de Negocio y Prevención de Duplicados (SCRUM-14)

1. **Garantía de Unicidad y Concurrencia:**
   - La reserva de un turno se realiza dentro de una transacción atómica `prisma.$transaction`.
   - Se consulta si ya existe una reserva activa en `(serviceId, date, time)` con `status != 'CANCELLED'`.
   - Si existe, se aborta la transacción retornando `409 Conflict` con el mensaje: *"El horario ya fue ocupado mientras realizaba la reserva. Por favor, seleccione otro horario."*
2. **Ciclo de Estados y Liberación:**
   - Si un turno se cancela (`CANCELLED`), no se borra el registro de la BD (auditoría e historial intactos), pero la consulta de disponibilidad `GET /api/availability` ignora los turnos cancelados, liberando el slot al instante.
3. **Validación de Anticipación y Fechas Pasadas (SCRUM-11):**
   - El backend rechaza cualquier intento de reserva en fechas u horas que ya hayan transcurrido en el huso horario local.

---

## 6. API REST del Backend

### 6.1. Autenticación (`/api/auth`)
- `POST /register`: Valida `name`, `email`, `password` (mínimo 6 caracteres). Cifra con `bcrypt` (10 rounds).
- `POST /login`: Valida credenciales con mensaje neutro *"Credenciales incorrectas"*. Devuelve `{ token, user: { id, name, email, role } }`.
- `POST /logout`: Invalida sesión en cliente.
- `GET /me`: Devuelve datos del usuario autenticado (requiere Bearer Token).

### 6.2. Catálogo y Administración de Servicios (`/api/services` y `/api/admin/services`)
- `GET /api/services`: Retorna solo servicios activos (`isActive: true`).
- `GET /api/admin/services`: Retorna todos los servicios (solo ADMIN).
- `POST /api/admin/services`: Alta de nuevo servicio validando nombre único, descripción y duración positiva.
- `PUT /api/admin/services/:id`: Edición de servicio.
- `PATCH /api/admin/services/:id/deactivate`: Baja lógica (`isActive = false`).

### 6.3. Horarios y Disponibilidad (`/api/admin/schedules` y `/api/availability`)
- `GET /api/admin/schedules`: Listado de franjas horarias configuradas.
- `PUT /api/admin/schedules`: Configura o actualiza días y rangos horarios (`startTime < endTime`).
- `GET /api/availability?serviceId=:id&date=YYYY-MM-DD`: Calcula slots basados en la franja horaria del día de la semana y filtra los turnos ya ocupados y las horas pasadas.

### 6.4. Reservas de Clientes y Panel (`/api/appointments` y `/api/admin/appointments`)
- `POST /api/appointments`: Crea una reserva para el usuario en sesión.
- `GET /api/appointments/my`: Lista las reservas del usuario autenticado ordenadas cronológicamente.
- `PATCH /api/appointments/:id/cancel`: Cancela un turno propio y vigente previa confirmación.
- `GET /api/admin/appointments`: Lista todas las reservas con filtros `date`, `serviceId`, `status`.
- `GET /api/admin/appointments/:id`: Detalle completo de una reserva.

---

## 7. Frontend y Experiencia de Usuario (React + Vite + Tailwind CSS)

1. **Seguridad y Rutas:**
   - `AuthContext`: Guarda token en `localStorage` y usuario en memoria.
   - `ProtectedRoute`: Redirige al login si no hay sesión.
   - `AdminRoute`: Verifica rol `ADMIN`; de lo contrario, redirige a inicio.
2. **Flujo de Reserva Cliente:**
   - Paso 1: Explorar catálogo `/services` o `/`.
   - Paso 2: Seleccionar servicio → Pantalla `/book?serviceId=...`.
   - Paso 3: Calendario interactivo (selección de fecha).
   - Paso 4: Grilla de horarios disponibles (chips de hora calculados dinámicamente).
   - Paso 5: Confirmación y creación → Pantalla `/appointments/confirmation/:id`.
3. **Pantalla "Mis Turnos" (`/my-appointments`):**
   - Pestaña "Próximos turnos" con botón "Cancelar turno" y modal de confirmación.
   - Pestaña "Historial y Cancelados".
4. **Panel de Control de Administrador (`/admin/dashboard`):**
   - Métricas rápidas (Total turnos, hoy, confirmados, cancelados).
   - Tabla reactiva con filtros de búsqueda por fecha, estado y servicio.
   - Visualización de detalle de reserva.
5. **ABM Servicios y Horarios (`/admin/services`, `/admin/schedules`):**
   - Gestión integral del catálogo y de la agenda de atención comercial.

---

## 8. Verificación y Calidad

- **Pruebas Unitarias e Integración Backend:** Jest + Supertest (Auth, Services, Availability, Appointment concurrency & cancellation).
- **Semilla de datos iniciales:** `npm run seed` en backend inicializa administrador, cliente de prueba, servicios de muestra y horarios semanales.
- **Ejecución local en un comando:** `npm run dev` desde la raíz para levantar Backend (puerto 4000) y Frontend (puerto 5173).
