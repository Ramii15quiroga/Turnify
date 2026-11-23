# SCRUM-38 / TF-16 — Estadísticas de turnos y reservas

Fecha de revisión: 23/11/2026. Versión base: repositorio principal `Ramii15quiroga/Turnify` (archivos principales verificados contra ZIP).

## Cambios preparados

- Consultas por día, semana y mes, usando fechas civiles estables (`YYYY-MM-DD`) y límite superior exclusivo.
- Rechazo explícito de fechas no reales (por ejemplo 2026-02-31) y períodos inválidos con HTTP 400.
- Conteo de todas las reservas registradas por estado, sin excluir canceladas, completadas, pendientes o ausentes.
- Pantalla con nombres de estado en español, rótulos de fechas inclusivos, carga y errores claros, sin datos obsoletos ante cambios rápidos de filtros.
- Siete pruebas puras sin acceso a SQLite en `backend/tests/statistics-utils.node.test.mjs`.
- Siete pruebas de integración HTTP/SQLite para acceso ADMIN, día/semana/mes, totales, falta de datos y errores en `backend/tests/statistics.test.ts`.

## Matriz de aceptación

| Criterio de Jira | Comprobación |
|---|---|
| Solo ADMIN | Middleware `authenticate` y `authorizeRole(['ADMIN'])`; tests HTTP para 401/403 |
| Reservas por día, semana, mes | Función `getStatisticsRange`; tests de límites y HTTP |
| Reservas por servicio | `aggregateStatistics`; comprobación de conteo exacto en fixture HTTP |
| Turnos por estado | `aggregateStatistics`; conteos de CONFIRMED, CANCELLED, COMPLETED, PENDING, NO_SHOW |
| Cifras igual a base de datos | Fixtures de 8 reservas aisladas y comparaciones exactas por período/servicio/estado |
| Sin datos | Respuesta con `total: 0` y aviso en la pantalla |

## Cómo verificar

Desde la raíz del proyecto, con Node.js instalado y acceso al registro de npm:

```powershell
npm.cmd ci
# Crear backend/.env con DATABASE_URL="file:./turnify.db" y JWT_SECRET de desarrollo
npm.cmd run setup
npm.cmd run test:backend
npm.cmd run test:frontend
npm.cmd run build
```

Para las pruebas puras (Node 22+ con TypeScript strip-types):

```powershell
node --experimental-strip-types --test backend/tests/statistics-utils.node.test.mjs
```

Verificación manual: acceder como ADMIN a `/admin/statistics`, elegir día/semana/mes, comparar con registros en panel, comprobar mensaje en fecha vacía. Como CLIENTE, verificar que no se pueda acceder al panel ni al endpoint de estadísticas.

## Resultado en este entorno

- **7/7** pruebas puras de lógica: **APROBADAS** (23/11/2026).
- La ejecución de Jest/Vitest/compilaciones completas **no fue posible**: falta instalar las dependencias de npm; el caché local no incluye paquetes requeridos y la instalación en línea no terminó.
- **No se verificó** el funcionamiento HTTP real frente a SQLite ni la interfaz ejecutada; estas pruebas deben completarse antes de mover SCRUM-38 a Finalizado.
- **No se publicó en GitHub**: la conexión actual devolvió HTTP 403 al intentar crear una rama. Se entrega el ZIP modificado para integración manual si persisten las restricciones.
