# Turnify SW

Sistema web para la reserva y gestión de turnos online. Permite a los clientes reservar turnos sin intermediarios y a los administradores gestionar servicios, horarios y reservas desde un panel centralizado.

---

## 🚀 Guía de Inicio Rápido (Paso a Paso)

Para clonar y poner a punto el proyecto en cualquier computadora, sigue estos pasos:

### 1. Requisitos Previos
* **Git** instalado ([descargar](https://git-scm.com/))
* **Node.js** versión 18 o superior ([descargar LTS](https://nodejs.org/))

---

### 2. Paso a Paso para Descargar y Ejecutar

#### **Paso 1: Clonar el repositorio**
Abre una terminal (PowerShell, CMD, Git Bash o la terminal integrada de VS Code) y clona el proyecto:
```bash
git clone https://github.com/Ramii15quiroga/Turnify.git
cd Turnify
```

#### **Paso 2: Instalar todas las dependencias (Monorepo)**
Instala las dependencias del Backend y del Frontend con un solo comando en la raíz:
```bash
npm install
```

#### **Paso 3: Inicializar la base de datos y cargar los datos de prueba**
Crea la base de datos SQLite (`turnify.db`) y precarga usuarios de prueba, catálogo y horarios:
```bash
npm run setup
```

#### **Paso 4: Levantar el proyecto en desarrollo**
Inicia simultáneamente el Backend (puerto 4000) y el Frontend (puerto 5173):
```bash
npm run dev
```

#### **Paso 5: Abrir en el navegador**
Abre tu navegador en:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Cuentas Precargadas para Probar

| Rol | Correo Electrónico | Contraseña | Permisos y Pantallas |
|---|---|---|---|
| **Administrador** | `admin@turnify.com` | `Admin123!` | Panel de turnos (`/admin/dashboard`), Gestión de servicios (`/admin/services`), Horarios de atención (`/admin/schedules`) |
| **Cliente de Prueba** | `cliente@turnify.com` | `Cliente123!` | Catálogo (`/services`), Reserva de turnos (`/book`), Mis turnos y cancelaciones (`/my-appointments`) |

*También puedes registrar cuentas nuevas desde la pantalla de Registro.*

---

## 🧪 Pruebas Automatizadas
Para ejecutar la suite completa de 30 pruebas unitarias e integración en el backend:
```bash
npm test
```

---

## 📄 Guía Visual Interactiva
El proyecto incluye una guía interactiva con buscador de tareas Jira y botones de copiado rápido:
* Abre el archivo `guia_sprint1.html` directamente en tu navegador o consúltalo en GitHub.
* Documento de diseño arquitectónico: [docs/superpowers/specs/2026-10-29-turnify-sprint1-design.md](docs/superpowers/specs/2026-10-29-turnify-sprint1-design.md)
* Plan detallado de Sprint 1: [docs/superpowers/plans/2026-10-29-turnify-sprint1-plan.md](docs/superpowers/plans/2026-10-29-turnify-sprint1-plan.md)
