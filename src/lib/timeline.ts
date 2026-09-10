/** Etiquetas y colores de TimelineType, compartidos entre la ficha de contacto, el panel y el reporte de actividad. */

export const TIMELINE_LABEL: Record<string, string> = {
  CONTACT_CREATED: "Contacto creado",
  IMPORT: "Importado desde CSV",
  INVITED: "Invitado",
  REGISTERED: "Inscrito",
  ATTENDED: "Asistió",
  DECLINED: "Declinó",
  FORM_SUBMITTED: "Envió formulario",
  NOTE: "Nota",
};

/** Variante para armar oraciones ("Fulano {label} 'Evento'"), usada en el panel. */
export const TIMELINE_LABEL_SENTENCE: Record<string, string> = {
  CONTACT_CREATED: "Contacto creado",
  IMPORT: "Importado desde CSV",
  INVITED: "Invitado a",
  REGISTERED: "Se inscribió a",
  ATTENDED: "Asistió a",
  DECLINED: "Declinó",
  FORM_SUBMITTED: "Envió formulario",
  NOTE: "Nota",
};

/** Clases de Tailwind para el badge de la ficha de contacto. */
export const TIMELINE_BADGE_CLASS: Record<string, string> = {
  CONTACT_CREATED: "bg-slate-100 text-slate-700",
  IMPORT: "bg-amber-100 text-amber-700",
  INVITED: "bg-blue-100 text-blue-700",
  REGISTERED: "bg-indigo-100 text-indigo-700",
  ATTENDED: "bg-green-100 text-green-700",
  DECLINED: "bg-red-100 text-red-700",
  FORM_SUBMITTED: "bg-purple-100 text-purple-700",
  NOTE: "bg-slate-100 text-slate-700",
};

/** Clases de Tailwind para el punto de color (listas de actividad reciente). */
export const TIMELINE_DOT_CLASS: Record<string, string> = {
  CONTACT_CREATED: "bg-slate-400",
  IMPORT: "bg-amber-500",
  INVITED: "bg-blue-500",
  REGISTERED: "bg-indigo-500",
  ATTENDED: "bg-green-500",
  DECLINED: "bg-red-500",
  FORM_SUBMITTED: "bg-purple-500",
  NOTE: "bg-slate-400",
};

/** Mismos colores en hex, para gráficos con estilos inline (barras apiladas, SVG). */
export const TIMELINE_HEX: Record<string, string> = {
  CONTACT_CREATED: "#94a3b8",
  IMPORT: "#f59e0b",
  INVITED: "#3b82f6",
  REGISTERED: "#6366f1",
  ATTENDED: "#22c55e",
  DECLINED: "#ef4444",
  FORM_SUBMITTED: "#a855f7",
  NOTE: "#94a3b8",
};

export const TIMELINE_TYPES_ORDERED = [
  "CONTACT_CREATED",
  "IMPORT",
  "FORM_SUBMITTED",
  "INVITED",
  "REGISTERED",
  "ATTENDED",
  "DECLINED",
  "NOTE",
] as const;
