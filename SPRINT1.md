Sprint 1 – Base del sistema
Proyecto: Turnify SW (SCRUM)
Período: 19 de octubre al 2 de noviembre de 2026
Estado: Activo
Objetivo del sprint: Sin texto cargado en Jira.

Encontré 13 tareas principales y 24 subtareas de Backend y Frontend, es decir, 37 elementos vinculados al Sprint 1.

A continuación te dejo la transcripción de los títulos, historias de usuario, descripciones, criterios de aceptación y datos de las tareas, agrupados por funcionalidad.

1. Registro de usuarios — SCRUM-5
Épica: E1 · Cuentas y acceso | Estado: En curso | Prioridad: Alta | 3 puntos | Sin asignar

Título: TF-01: Registro de usuarios.

Historia de usuario

Como cliente, quiero registrarme en el sistema, para poder acceder y gestionar mis reservas.

Criterios de aceptación
- El formulario valida los campos obligatorios (nombre, correo electrónico y contraseña) y muestra mensajes de error claros.
- No permite registrar dos cuentas con el mismo correo electrónico.
- La contraseña se guarda cifrada y cumple una longitud mínima.
- Al registrarse correctamente, el usuario recibe un mensaje de confirmación y puede iniciar sesión.
Prioridad: Alta · ID del backlog: HU-01
SCRUM-40 — [BACKEND] TF-01: Registro de usuarios

Responsable: hugo cousiño · Estado: En curso

Parte backend de SCRUM-5: endpoint de registro, validaciones de campos obligatorios, unicidad del correo y cifrado de la contraseña.

SCRUM-41 — [FRONTEND] TF-01: Registro de usuarios

Responsable: Ramiro Ulises Quiroga · Estado: En curso

Parte frontend de SCRUM-5: formulario de registro, validación de campos obligatorios, mensajes de error claros y mensaje de confirmación.

Abrir SCRUM-5 en Jira
2. Inicio y cierre de sesión — SCRUM-6
Épica: E1 · Cuentas y acceso | Estado: En curso | Prioridad: Alta | 5 puntos | Sin asignar

Título: TF-02: Inicio y cierre de sesión.

Historia de usuario

Como usuario registrado, quiero iniciar y cerrar sesión de forma segura, para proteger mi cuenta y mis datos.

Criterios de aceptación
- Con credenciales correctas, el usuario accede al sistema según su rol (cliente o administrador).
- Con credenciales incorrectas, el sistema rechaza el acceso con un mensaje claro, sin revelar qué dato falló.
- Las pantallas privadas no son accesibles sin una sesión iniciada.
- Al cerrar sesión, la sesión se invalida y no se puede volver a las pantallas privadas con el botón "atrás".
Prioridad: Alta · ID del backlog: HU-02
SCRUM-42 — [BACKEND] TF-02: Inicio y cierre de sesión

Responsable: Martin Tello · Estado: En curso

Parte backend de SCRUM-6: autenticación, manejo de sesión, acceso según rol, protección de rutas privadas e invalidación de sesión al cerrar.

SCRUM-43 — [FRONTEND] TF-02: Inicio y cierre de sesión

Responsable: brianyoelreta · Estado: En curso

Parte frontend de SCRUM-6: pantalla de login, mensaje de error genérico, botón de cerrar sesión y redirección de pantallas privadas.

Abrir SCRUM-6 en Jira
3. Gestión de servicios — SCRUM-8
Épica: E2 · Catálogo de servicios | Estado: En curso | Prioridad: Alta | 5 puntos | Sin asignar

Título: TF-10: Gestión de servicios.

Historia de usuario

Como administrador, quiero crear, modificar y desactivar servicios, para mantener actualizada la oferta que ven los clientes.

Criterios de aceptación
- Solo un administrador puede crear, modificar o desactivar servicios.
- Al crear un servicio se validan los campos obligatorios (nombre, descripción y duración).
- Un servicio modificado muestra los cambios en la consulta de servicios.
- Un servicio desactivado deja de mostrarse a los clientes, pero se conservan las reservas ya existentes.
- No se permiten dos servicios con el mismo nombre.
Prioridad: Alta · ID del backlog: HU-10
SCRUM-44 — [BACKEND] TF-10: Gestión de servicios

Responsable: hugo cousiño · Estado: Idea

Parte backend de SCRUM-8: crear, modificar y desactivar servicios, solo administrador, validación de campos y nombre único.

SCRUM-45 — [FRONTEND] TF-10: Gestión de servicios

Responsable: Ramiro Ulises Quiroga · Estado: Idea

Parte frontend de SCRUM-8: pantalla de administración de servicios con formularios de alta y edición, y acción de desactivar.

Abrir SCRUM-8 en Jira
4. Preparación de la base de datos y estructura del proyecto — SCRUM-9
Épica: E0 · Base técnica y calidad | Estado: Por hacer | Prioridad: Alta | 8 puntos | Sin asignar

Título: Preparación de la base de datos y estructura del proyecto.

Descripción

Tarea técnica (sin historia de usuario propia)

Preparar la base de datos y la estructura inicial del proyecto para poder construir el resto de las funcionalidades.

Criterios de finalización
- Repositorio creado y estructura del proyecto definida.
- Modelo de datos diseñado (usuarios, servicios, horarios de atención, reservas y estados).
- Base de datos creada y conectada con la aplicación.
- Restricciones de integridad definidas (claves, únicos, relaciones).
- El equipo puede ejecutar el proyecto en su entorno local.
No tiene subtareas registradas.
Abrir SCRUM-9 en Jira
5. Consulta de servicios disponibles — SCRUM-10
Épica: E2 · Catálogo de servicios | Estado: Por hacer | Prioridad: Alta | 3 puntos | Sin asignar

Título: TF-03: Consulta de servicios disponibles.

Historia de usuario

Como cliente, quiero consultar los servicios disponibles, para elegir cuál quiero reservar.

Criterios de aceptación
- Se listan los servicios activos con nombre, descripción y duración.
- Los servicios desactivados por el administrador no aparecen en la lista.
- Desde cada servicio se puede continuar hacia la consulta de horarios y la reserva.
- Si no hay servicios activos, se muestra un mensaje informativo.
Prioridad: Alta · ID del backlog: HU-03
SCRUM-46 — [BACKEND] TF-03: Consulta de servicios disponibles

Responsable: Martin Tello · Estado: Idea

Parte backend de SCRUM-10: endpoint que lista solo los servicios activos con nombre, descripción y duración.

SCRUM-47 — [FRONTEND] TF-03: Consulta de servicios disponibles

Responsable: brianyoelreta · Estado: Idea

Parte frontend de SCRUM-10: lista de servicios, mensaje cuando no hay servicios activos y acceso a horarios y reserva desde cada servicio.

Abrir SCRUM-10 en Jira
6. Consulta de días y horarios disponibles — SCRUM-11
Épica: E3 · Disponibilidad y horarios | Estado: Por hacer | Prioridad: Alta | 5 puntos | Sin asignar

Título: TF-04: Consulta de días y horarios disponibles.

Historia de usuario

Como cliente, quiero ver los días y horarios disponibles de un servicio, para elegir el turno que mejor me convenga.

Criterios de aceptación
- Solo se muestran días y horarios habilitados por el administrador y que estén libres.
- Los horarios ya reservados no aparecen como disponibles.
- No se muestran fechas ni horarios pasados.
- Si no hay disponibilidad para el servicio o la fecha elegida, se informa claramente.
Prioridad: Alta · ID del backlog: HU-04
SCRUM-48 — [BACKEND] TF-04: Consulta de días y horarios disponibles

Responsable: hugo cousiño · Estado: Idea

Parte backend de SCRUM-11: cálculo de disponibilidad a partir de los horarios habilitados, excluyendo reservas existentes y fechas pasadas.

SCRUM-49 — [FRONTEND] TF-04: Consulta de días y horarios disponibles

Responsable: Ramiro Ulises Quiroga · Estado: Idea

Parte frontend de SCRUM-11: selector de fecha, lista de horarios libres y mensaje cuando no hay disponibilidad.

Abrir SCRUM-11 en Jira
7. Creación de reservas — SCRUM-13
Épica: E4 · Reservas de clientes | Estado: Por hacer | Prioridad: Alta | 8 puntos | Sin asignar

Título: TF-05: Creación de reservas.

Historia de usuario

Como cliente, quiero reservar un turno y obtener su fecha y hora, para asegurar mi atención en el horario elegido.

Criterios de aceptación
- Solo un usuario con sesión iniciada puede reservar.
- La reserva guarda el cliente, el servicio, la fecha y la hora.
- Solo se pueden reservar horarios habilitados y libres.
- Si el horario fue ocupado mientras el cliente reservaba, el sistema lo impide y ofrece elegir otro.
- Al finalizar, se muestra la fecha y hora reservadas.
Prioridad: Alta · ID del backlog: HU-05
SCRUM-50 — [BACKEND] TF-05: Creación de reservas

Responsable: Martin Tello · Estado: Idea

Parte backend de SCRUM-13: crear la reserva solo con sesión iniciada y horario habilitado y libre, guardando cliente, servicio, fecha y hora.

SCRUM-51 — [FRONTEND] TF-05: Creación de reservas

Responsable: brianyoelreta · Estado: Idea

Parte frontend de SCRUM-13: flujo para elegir servicio, fecha y hora y reservar, con aviso si el horario se ocupó.

Abrir SCRUM-13 en Jira
8. Prevención de reservas duplicadas — SCRUM-14
Épica: E4 · Reservas de clientes | Estado: Por hacer | Prioridad: Alta | 8 puntos | Sin asignar

Título: TF-18: Prevención de reservas duplicadas.

Historia de usuario

Como cliente, quiero que el sistema evite reservas duplicadas en un mismo horario, para que mi turno esté garantizado y no se superponga con el de otra persona.

Criterios de aceptación
- No se puede guardar una segunda reserva para el mismo servicio, fecha y hora ya ocupados.
- La validación se hace también en el servidor / base de datos, no solo en pantalla.
- Si dos clientes intentan reservar el mismo horario a la vez, solo uno lo consigue y el otro recibe un aviso y puede elegir otro.
- Un horario liberado por cancelación o reprogramación puede volver a reservarse.
Prioridad: Alta · ID del backlog: HU-18
SCRUM-52 — [BACKEND] TF-18: Prevención de reservas duplicadas

Responsable: hugo cousiño · Estado: Idea

Parte backend de SCRUM-14: restricción de unicidad en base de datos y validación en el servidor para servicio, fecha y hora; manejo de reservas simultáneas; liberación del horario al cancelar o reprogramar.

SCRUM-53 — [FRONTEND] TF-18: Prevención de reservas duplicadas

Responsable: Ramiro Ulises Quiroga · Estado: Idea

Parte frontend de SCRUM-14: aviso claro cuando el horario ya fue ocupado y opción de elegir otro horario.

Abrir SCRUM-14 en Jira
9. Confirmación de reservas — SCRUM-19
Épica: E4 · Reservas de clientes | Estado: Por hacer | Prioridad: Alta | 3 puntos | Sin asignar

Título: TF-06: Confirmación de reservas.

Historia de usuario

Como cliente, quiero recibir la confirmación de mi reserva, para tener la certeza de que el turno quedó registrado.

Criterios de aceptación
- Al reservar, se muestra una pantalla de confirmación con servicio, fecha, hora y estado del turno.
- Se envía un comprobante por correo electrónico (o, como mínimo, queda disponible en "Mis turnos").
- Los datos de la confirmación coinciden con los guardados en la reserva.
Prioridad: Alta · ID del backlog: HU-06
SCRUM-54 — [BACKEND] TF-06: Confirmación de reservas

Responsable: Martin Tello · Estado: Idea

Parte backend de SCRUM-19: datos de confirmación coherentes con la reserva guardada y envío del comprobante por correo electrónico.

SCRUM-55 — [FRONTEND] TF-06: Confirmación de reservas

Responsable: brianyoelreta · Estado: Idea

Parte frontend de SCRUM-19: pantalla de confirmación con servicio, fecha, hora y estado del turno.

Abrir SCRUM-19 en Jira
10. Consulta de turnos propios — SCRUM-20
Épica: E4 · Reservas de clientes | Estado: Por hacer | Prioridad: Alta | 3 puntos | Sin asignar

Título: TF-07: Consulta de turnos propios.

Historia de usuario

Como cliente, quiero consultar mis turnos reservados, para saber cuándo y dónde debo asistir.

Criterios de aceptación
- El cliente ve únicamente sus propias reservas.
- Cada turno muestra servicio, fecha, hora y estado.
- Los turnos próximos se distinguen de los pasados o cancelados.
- Desde cada turno vigente se puede cancelar o reprogramar.
Prioridad: Alta · ID del backlog: HU-07
SCRUM-56 — [BACKEND] TF-07: Consulta de turnos propios

Responsable: hugo cousiño · Estado: Idea

Parte backend de SCRUM-20: endpoint que devuelve solo las reservas del cliente autenticado, con servicio, fecha, hora y estado.

SCRUM-57 — [FRONTEND] TF-07: Consulta de turnos propios

Responsable: Ramiro Ulises Quiroga · Estado: Idea

Parte frontend de SCRUM-20: pantalla "Mis turnos" que distingue próximos, pasados y cancelados, con acceso a cancelar o reprogramar.

Abrir SCRUM-20 en Jira
11. Cancelación de reservas — SCRUM-21
Épica: E4 · Reservas de clientes | Estado: Por hacer | Prioridad: Alta | 5 puntos | Sin asignar

Título: TF-08: Cancelación de reservas.

Historia de usuario

Como cliente, quiero cancelar una reserva, para liberar el horario cuando ya no pueda asistir.

Criterios de aceptación
- Solo se puede cancelar una reserva propia y vigente.
- Se pide confirmación antes de cancelar.
- Al cancelar, el turno cambia a estado "cancelado" y el horario vuelve a estar disponible.
- Se respetan las reglas del negocio (por ejemplo, anticipación mínima para cancelar).
- Se informa al cliente que la cancelación se realizó.
Prioridad: Alta · ID del backlog: HU-08
SCRUM-58 — [BACKEND] TF-08: Cancelación de reservas

Responsable: Martin Tello · Estado: Idea

Parte backend de SCRUM-21: cancelar solo reservas propias y vigentes, aplicar reglas de anticipación mínima, cambiar el estado a cancelado y liberar el horario.

SCRUM-59 — [FRONTEND] TF-08: Cancelación de reservas

Responsable: brianyoelreta · Estado: Idea

Parte frontend de SCRUM-21: botón de cancelar, diálogo de confirmación y mensaje de cancelación realizada.

Abrir SCRUM-21 en Jira
12. Configuración de días y horarios de atención — SCRUM-24
Épica: E3 · Disponibilidad y horarios | Estado: Por hacer | Prioridad: Alta | 5 puntos | Sin asignar

Título: TF-11: Configuración de días y horarios de atención.

Historia de usuario

Como administrador, quiero configurar los días y horarios de atención, para definir cuándo los clientes pueden reservar turnos.

Criterios de aceptación
- Solo un administrador puede definir o modificar los días y horarios de atención.
- Se puede definir la franja horaria de cada día y la duración de los turnos.
- Se validan los rangos (la hora de fin debe ser posterior a la de inicio, sin solapamientos).
- Los cambios se reflejan en la disponibilidad que ven los clientes.
- Modificar el horario no elimina las reservas ya existentes; las que queden fuera del nuevo horario se informan al administrador.
Prioridad: Alta · ID del backlog: HU-11
SCRUM-60 — [BACKEND] TF-11: Configuración de días y horarios de atención

Responsable: hugo cousiño · Estado: Idea

Parte backend de SCRUM-24: definir y modificar días, franjas y duración de turnos solo como administrador; validar rangos sin solapamientos e informar reservas que queden fuera del nuevo horario.

SCRUM-61 — [FRONTEND] TF-11: Configuración de días y horarios de atención

Responsable: Ramiro Ulises Quiroga · Estado: Idea

Parte frontend de SCRUM-24: pantalla de administración para configurar franjas horarias por día y duración de turnos, con mensajes de validación.

Abrir SCRUM-24 en Jira
13. Panel de reservas — SCRUM-26
Épica: E5 · Administración de turnos y usuarios | Estado: Por hacer | Prioridad: Alta | 5 puntos | Sin asignar

Título: TF-12: Panel de reservas.

Historia de usuario

Como administrador, quiero visualizar todas las reservas, para controlar la atención y organizar el trabajo diario.

Criterios de aceptación
- Solo un administrador puede acceder al panel.
- Se listan todas las reservas con cliente, servicio, fecha, hora y estado.
- Se puede filtrar por fecha, servicio y estado.
- Se puede ver el detalle de cada reserva.
- Los datos se mantienen actualizados cuando hay nuevas reservas o cancelaciones.
Prioridad: Alta · ID del backlog: HU-12
SCRUM-62 — [BACKEND] TF-12: Panel de reservas

Responsable: franco99426 · Estado: Idea

Parte backend de SCRUM-26: endpoint solo para administrador que lista todas las reservas con filtros por fecha, servicio y estado, y devuelve el detalle de cada una.

SCRUM-63 — [FRONTEND] TF-12: Panel de reservas

Responsable: brianyoelreta · Estado: Idea

Parte frontend de SCRUM-26: pantalla del panel con tabla de reservas, filtros y vista de detalle, actualizada ante nuevas reservas o cancelaciones.

Abrir SCRUM-26 en Jira
Resumen de los datos registrados en Jira
13
Tareas principales
24
Subtareas
66
Puntos estimados

Elemento	En curso	Por hacer / Idea
Tareas principales	3	10
Subtareas	4	20

Información adicional: El creador y reportero de las 13 tareas principales es Dimas Ortiz. Todas tienen prioridad alta y ninguna tiene responsable asignado directamente; las asignaciones están en sus subtareas. En los 37 elementos consultados no encontré comentarios ni archivos adjuntos.

Los textos de las descripciones y criterios de aceptación anteriores corresponden a los registrados en Jira. No agregué requisitos funcionales nuevos ni modifiqué su contenido.