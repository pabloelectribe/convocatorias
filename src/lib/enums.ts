/**
 * SQLite (usado en este prototipo) no soporta enums nativos de Prisma, por lo que los
 * campos correspondientes se modelan como String en el esquema. Estas constantes
 * documentan y validan los valores permitidos en el código de la aplicación.
 */

export const EventModality = {
  ZOOM: "ZOOM",
  PRESENCIAL: "PRESENCIAL",
  HIBRIDO: "HIBRIDO",
} as const;
export type EventModality = (typeof EventModality)[keyof typeof EventModality];

export const EventStatus = {
  BORRADOR: "BORRADOR",
  PUBLICADO: "PUBLICADO",
  FINALIZADO: "FINALIZADO",
  CANCELADO: "CANCELADO",
} as const;
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

export const InvitationStatus = {
  ENVIADA: "ENVIADA",
  ABIERTA: "ABIERTA",
  REGISTRADA: "REGISTRADA",
  DECLINADA: "DECLINADA",
} as const;
export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus];

export const RegistrationSource = {
  INVITACION: "INVITACION",
  AUTOINSCRIPCION: "AUTOINSCRIPCION",
  IMPORTACION: "IMPORTACION",
} as const;
export type RegistrationSource = (typeof RegistrationSource)[keyof typeof RegistrationSource];

export const TimelineType = {
  CONTACT_CREATED: "CONTACT_CREATED",
  IMPORT: "IMPORT",
  INVITED: "INVITED",
  REGISTERED: "REGISTERED",
  ATTENDED: "ATTENDED",
  DECLINED: "DECLINED",
  FORM_SUBMITTED: "FORM_SUBMITTED",
  NOTE: "NOTE",
} as const;
export type TimelineType = (typeof TimelineType)[keyof typeof TimelineType];
