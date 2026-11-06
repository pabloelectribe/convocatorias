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

export const EmailType = {
  INVITACION: "INVITACION",
  RECORDATORIO: "RECORDATORIO",
  REINSISTENCIA: "REINSISTENCIA",
  CONFIRMACION: "CONFIRMACION",
} as const;
export type EmailType = (typeof EmailType)[keyof typeof EmailType];

export const EMAIL_TYPE_LABEL: Record<EmailType, string> = {
  INVITACION: "Invitación",
  RECORDATORIO: "Recordatorio",
  REINSISTENCIA: "Reinsistencia",
  CONFIRMACION: "Confirmación",
};

export const NoteSentiment = {
  POSITIVA: "POSITIVA",
  NEUTRA: "NEUTRA",
  NEGATIVA: "NEGATIVA",
} as const;
export type NoteSentiment = (typeof NoteSentiment)[keyof typeof NoteSentiment];

export const NOTE_SENTIMENT_LABEL: Record<NoteSentiment, string> = {
  POSITIVA: "Positiva",
  NEUTRA: "Neutra",
  NEGATIVA: "Negativa",
};

export const NOTE_SENTIMENT_BADGE_CLASS: Record<NoteSentiment, string> = {
  POSITIVA: "bg-green-100 text-green-700",
  NEUTRA: "bg-slate-100 text-slate-600",
  NEGATIVA: "bg-red-100 text-red-700",
};

export const TimelineType = {
  CONTACT_CREATED: "CONTACT_CREATED",
  IMPORT: "IMPORT",
  INVITED: "INVITED",
  REGISTERED: "REGISTERED",
  ATTENDED: "ATTENDED",
  DECLINED: "DECLINED",
  FORM_SUBMITTED: "FORM_SUBMITTED",
  NOTE: "NOTE",
  CAMPAIGN_TOUCH: "CAMPAIGN_TOUCH",
} as const;
export type TimelineType = (typeof TimelineType)[keyof typeof TimelineType];
