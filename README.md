# Convocatorias · vamosmipyme.cl

Prototipo funcional del sistema de convocatorias: CRM + ticketera (estilo Eventbrite/Ticket
Tailor) para gestionar clientes de vamosmipyme.cl, invitarlos a actividades (Zoom o
presenciales), controlar inscripciones y asistencia, e integrar la data que se exporta
manualmente en CSV desde vamosmipyme.cl. El objetivo final es construir un "conocimiento
del cliente 360°": desde qué canal llegó, a qué actividades fue invitado y asistió (embudo
de conversión), y su historial completo de interacción con el programa.

## Qué incluye este prototipo

- **CRM de contactos** (`/contactos`): ficha por cliente con RUT, email, empresa, sector,
  comuna/región, canal de origen, temas de interés y notas.
- **Segmentos/listas** (`/segmentos`): agrupan contactos para invitarlos en bloque a
  convocatorias (equivalente a listas de Zoho/HubSpot).
- **Eventos / ticketera** (`/eventos`): creación de convocatorias Zoom, presenciales o
  híbridas; invitación por segmento o contacto puntual; página pública de auto-inscripción
  tipo Eventbrite (`/e/[slug]`); página de confirmación de invitación (`/invitacion/[token]`)
  con RSVP (confirmar / declinar); check-in de asistentes por RUT, email o código de ticket
  (`/eventos/[id]/checkin`).
- **Importación CSV** (`/importar`): sube el export manual de vamosmipyme.cl, mapea columnas
  (RUT, email, nombre, empresa, actividad, fecha, canal) y crea/enriquece contactos,
  agregando cada actividad al historial del cliente.
- **Timeline 360°** en la ficha de cada contacto: une en una sola línea de tiempo su creación,
  importaciones, invitaciones, inscripciones, asistencias y notas manuales; muestra además el
  embudo de conversión por convocatoria (invitado → inscrito → asistió) y una métrica simple
  de "temática de mayor interés" según a qué asistió.
- **Panel general** (`/`): totales, embudo global y actividad reciente.

## Stack técnico

- **Next.js 14 (App Router) + TypeScript** — Server Components para lectura, Server Actions
  para todas las mutaciones (sin API REST intermedia).
- **Prisma + SQLite** para el prototipo (`prisma/schema.prisma`). El modelo está diseñado para
  migrar a Postgres cambiando solo el `datasource` (los campos que en otros motores serían
  `enum` se modelan como `String` porque SQLite no soporta enums nativos; los valores válidos
  están documentados en `src/lib/enums.ts`).
- **Tailwind CSS** para la interfaz.
- Autenticación mínima de un solo usuario admin (cookie + contraseña compartida por variable
  de entorno) para proteger las vistas internas; las páginas públicas (`/e/*`, `/invitacion/*`)
  quedan fuera del gate.

## Cómo correrlo localmente

```bash
cp .env.example .env      # ajusta ADMIN_PASSWORD y AUTH_SECRET
npm install
npm run db:push           # crea prisma/dev.db según el schema
npm run db:seed           # datos de ejemplo (contactos, eventos, invitaciones ficticias)
npm run dev                # http://localhost:3000
```

Contraseña de acceso por defecto: la definida en `ADMIN_PASSWORD` (`.env.example` trae
`vamosmipyme`).

## Modelo de datos (resumen)

- `Contact` — ficha CRM, vinculado a `Channel` (canal de adquisición), `Tag` (temas de
  interés vía `ContactTag`) y `Segment` (vía `SegmentMember`).
- `Event` — convocatoria (Zoom/presencial/híbrido), con `slug` público.
- `Invitation` — invitación de un contacto a un evento (token único para el RSVP público).
- `Registration` — inscripción confirmada (por invitación, autoinscripción pública o
  importación), con `ticketCode` para el check-in.
- `Attendance` — asistencia registrada en el check-in.
- `ImportBatch` — bitácora de cada CSV importado.
- `TimelineEvent` — el historial unificado por contacto que alimenta la vista 360°.

## Próximos pasos sugeridos (no incluidos en este prototipo)

- Envío real de invitaciones por email (hoy el enlace de invitación se genera pero se copia
  manualmente desde la ficha del evento; falta integrar un proveedor de correo).
- Autenticación multiusuario con roles (hoy es un solo usuario admin compartido).
- Segmentos dinámicos por filtro (hoy son listas estáticas de contactos).
- Puntuación de "propensión a volver" más sofisticada (hoy es un conteo simple de
  asistencias y la temática más frecuente).
- Migrar de SQLite a Postgres para un ambiente productivo, y automatizar la importación
  desde vamosmipyme.cl si en el futuro se habilita una API o webhook (hoy es CSV manual,
  tal como se usa actualmente).
- Antes de exponer este prototipo públicamente en internet: actualizar Next.js a una versión
  con todos los CVE recientes parcheados (se dejó fijado en `14.2.35`, la última release
  parcheada de la rama 14 al momento de este commit, para evitar el salto disruptivo a la
  v16 en un prototipo) y reforzar la autenticación de un solo admin.
