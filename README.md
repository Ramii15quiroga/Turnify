# Turnify SW

Sistema web para la reserva y gestión de turnos online. Permite a los clientes reservar turnos sin intermediarios y a los administradores gestionar servicios, horarios y reservas desde un panel centralizado.

## Sprint 1 — Base del sistema
- **Modelo de datos relacional (3FN)** con SQLite y Prisma ORM.
- **Backend:** Node.js, Express, TypeScript, JWT, bcrypt y Zod.
- **Frontend:** React (Vite), TypeScript, Tailwind CSS, React Router y Lucide Icons.
- **Control de concurrencia y prevención de doble reserva** en base de datos y servidor.

## Requisitos
- Node.js >= 18
- npm >= 9

## Ejecución Local
```bash
# Instalar dependencias raíz y workspaces
npm install

# Inicializar y poblar base de datos
npm run setup

# Levantar backend y frontend en desarrollo
npm run dev
```

Documentación de arquitectura y diseño: [docs/superpowers/specs/2026-10-29-turnify-sprint1-design.md](docs/superpowers/specs/2026-10-29-turnify-sprint1-design.md).
