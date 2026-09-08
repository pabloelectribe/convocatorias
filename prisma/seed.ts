import { PrismaClient } from "@prisma/client";
import { EventModality, EventStatus, InvitationStatus, RegistrationSource, TimelineType } from "../src/lib/enums";
import { ticketCode } from "../src/lib/slug";

const prisma = new PrismaClient();

function computeDv(body: string): string {
  let sum = 0;
  let mult = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const rem = 11 - (sum % 11);
  if (rem === 11) return "0";
  if (rem === 10) return "K";
  return String(rem);
}

function rutFromBody(body: number): string {
  const b = String(body);
  return `${b}${computeDv(b)}`;
}

const CONTACTS = [
  { body: 12345678, firstName: "Camila", lastName: "Rojas", email: "camila.rojas@example.cl", company: "Panadería El Trigal", sector: "Alimentos", comuna: "Puente Alto", region: "Metropolitana" },
  { body: 13456789, firstName: "Matías", lastName: "González", email: "matias.gonzalez@example.cl", company: "Taller Mecánico González", sector: "Servicios", comuna: "Maipú", region: "Metropolitana" },
  { body: 14567890, firstName: "Francisca", lastName: "Muñoz", email: "francisca.munoz@example.cl", company: "Diseños Franny", sector: "Comercio", comuna: "Ñuñoa", region: "Metropolitana" },
  { body: 15678901, firstName: "Sebastián", lastName: "Contreras", email: "sebastian.contreras@example.cl", company: "AgroSur Ltda.", sector: "Agricultura", comuna: "San Fernando", region: "O'Higgins" },
  { body: 16789012, firstName: "Valentina", lastName: "Soto", email: "valentina.soto@example.cl", company: "Turismo Costa Azul", sector: "Turismo", comuna: "Viña del Mar", region: "Valparaíso" },
  { body: 17890123, firstName: "Diego", lastName: "Fuentes", email: "diego.fuentes@example.cl", company: "Fuentes Repuestos", sector: "Comercio", comuna: "Rancagua", region: "O'Higgins" },
  { body: 18901234, firstName: "Antonia", lastName: "Vergara", email: "antonia.vergara@example.cl", company: "Estudio Vergara Contable", sector: "Servicios", comuna: "Providencia", region: "Metropolitana" },
  { body: 19012345, firstName: "Cristóbal", lastName: "Araya", email: "cristobal.araya@example.cl", company: "Araya Exportaciones", sector: "Comercio exterior", comuna: "Concepción", region: "Biobío" },
  { body: 20123456, firstName: "Javiera", lastName: "Pizarro", email: "javiera.pizarro@example.cl", company: "Pizarro Textiles", sector: "Manufactura", comuna: "San Joaquín", region: "Metropolitana" },
  { body: 11234567, firstName: "Ignacio", lastName: "Morales", email: "ignacio.morales@example.cl", company: "Café Morales", sector: "Alimentos", comuna: "La Serena", region: "Coquimbo" },
  { body: 12876543, firstName: "Fernanda", lastName: "Reyes", email: "fernanda.reyes@example.cl", company: "Reyes Marketing Digital", sector: "Servicios", comuna: "Las Condes", region: "Metropolitana" },
  { body: 13987654, firstName: "Tomás", lastName: "Espinoza", email: "tomas.espinoza@example.cl", company: "Espinoza Construcciones", sector: "Construcción", comuna: "Temuco", region: "Araucanía" },
  { body: 14098765, firstName: "Isidora", lastName: "Carrasco", email: "isidora.carrasco@example.cl", company: "Carrasco Cosmética Natural", sector: "Manufactura", comuna: "Ñuñoa", region: "Metropolitana" },
  { body: 15209876, firstName: "Benjamín", lastName: "Torres", email: "benjamin.torres@example.cl", company: "Torres Software", sector: "Tecnología", comuna: "Providencia", region: "Metropolitana" },
  { body: 16310987, firstName: "Constanza", lastName: "Bravo", email: "constanza.bravo@example.cl", company: "Bravo Eventos", sector: "Servicios", comuna: "Antofagasta", region: "Antofagasta" },
  { body: 17421098, firstName: "Vicente", lastName: "Sepúlveda", email: "vicente.sepulveda@example.cl", company: "Sepúlveda Hnos.", sector: "Comercio", comuna: "Puerto Montt", region: "Los Lagos" },
  { body: 18532109, firstName: "Josefa", lastName: "Herrera", email: "josefa.herrera@example.cl", company: "Herrera Vinos", sector: "Alimentos", comuna: "Curicó", region: "Maule" },
  { body: 19643210, firstName: "Nicolás", lastName: "Castro", email: "nicolas.castro@example.cl", company: "Castro Logística", sector: "Transporte", comuna: "San Bernardo", region: "Metropolitana" },
];

async function main() {
  console.log("Limpiando datos existentes...");
  await prisma.timelineEvent.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.segmentMember.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.contactTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.event.deleteMany();
  await prisma.importBatch.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.channel.deleteMany();

  const channelNames = ["Formulario web vamosmipyme.cl", "Feria presencial", "Redes sociales", "Referido", "Importación CSV SERCOTEC"];
  const channels = new Map<string, string>();
  for (const name of channelNames) {
    const c = await prisma.channel.create({ data: { name } });
    channels.set(name, c.id);
  }

  const tagNames = ["Marketing digital", "Finanzas y financiamiento", "Exportación", "Transformación digital", "Ventas y comercialización", "Sostenibilidad"];
  const tags = new Map<string, string>();
  for (const name of tagNames) {
    const t = await prisma.tag.create({ data: { name } });
    tags.set(name, t.id);
  }

  console.log("Creando contactos...");
  const contacts = [];
  for (let i = 0; i < CONTACTS.length; i++) {
    const c = CONTACTS[i];
    const channelName = channelNames[i % channelNames.length];
    const contact = await prisma.contact.create({
      data: {
        rut: rutFromBody(c.body),
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: `+56 9 ${String(60000000 + i * 111).padStart(8, "0")}`,
        companyName: c.company,
        sector: c.sector,
        comuna: c.comuna,
        region: c.region,
        channelId: channels.get(channelName),
      },
    });
    await prisma.timelineEvent.create({
      data: {
        contactId: contact.id,
        type: TimelineType.CONTACT_CREATED,
        title: "Contacto creado",
        description: `Origen: ${channelName}`,
        occurredAt: contact.createdAt,
      },
    });
    // asignar 1-2 tags de interés
    const tagPool = tagNames.slice(i % tagNames.length, (i % tagNames.length) + 2);
    for (const tn of tagPool.length ? tagPool : [tagNames[0]]) {
      await prisma.contactTag.create({ data: { contactId: contact.id, tagId: tags.get(tn)! } });
    }
    contacts.push(contact);
  }

  console.log("Creando segmentos...");
  const segRM = await prisma.segment.create({ data: { name: "Emprendedores Región Metropolitana", description: "Contactos con empresa en la Región Metropolitana" } });
  const segExport = await prisma.segment.create({ data: { name: "Exportadores potenciales", description: "Interesados en comercio exterior" } });
  const segFeria = await prisma.segment.create({ data: { name: "Asistentes Feria Mipyme 2023", description: "Base capturada en la feria presencial" } });

  for (const c of contacts) {
    if (c.region === "Metropolitana") {
      await prisma.segmentMember.create({ data: { segmentId: segRM.id, contactId: c.id } });
    }
  }
  for (const c of contacts.slice(0, 8)) {
    await prisma.segmentMember.create({ data: { segmentId: segExport.id, contactId: c.id } });
  }
  for (const c of contacts.slice(3, 14)) {
    await prisma.segmentMember.create({ data: { segmentId: segFeria.id, contactId: c.id } });
  }

  console.log("Creando eventos...");
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const pastWebinar = await prisma.event.create({
    data: {
      title: "Webinar: Cómo acceder a financiamiento Sercotec 2024",
      slug: "webinar-financiamiento-sercotec-2024",
      description: "Sesión online sobre fondos concursables y financiamiento para pymes.",
      topic: "Finanzas y financiamiento",
      modality: EventModality.ZOOM,
      zoomLink: "https://zoom.us/j/00000000000",
      startAt: new Date(now - 40 * day),
      endAt: new Date(now - 40 * day + 90 * 60 * 1000),
      capacity: 100,
      status: EventStatus.FINALIZADO,
    },
  });

  const pastTaller = await prisma.event.create({
    data: {
      title: "Taller presencial: Marketing digital para pymes",
      slug: "taller-marketing-digital-pymes",
      description: "Taller práctico de redes sociales y venta online, en Santiago Centro.",
      topic: "Marketing digital",
      modality: EventModality.PRESENCIAL,
      location: "Centro de Extensión, Santiago Centro",
      startAt: new Date(now - 20 * day),
      endAt: new Date(now - 20 * day + 3 * 60 * 60 * 1000),
      capacity: 40,
      status: EventStatus.FINALIZADO,
    },
  });

  const upcomingHibrido = await prisma.event.create({
    data: {
      title: "Encuentro Exportadores Mipyme",
      slug: "encuentro-exportadores-mipyme",
      description: "Encuentro híbrido con casos de éxito en exportación para pymes chilenas.",
      topic: "Exportación",
      modality: EventModality.HIBRIDO,
      location: "Hotel Plaza San Francisco, Santiago",
      zoomLink: "https://zoom.us/j/11111111111",
      startAt: new Date(now + 15 * day),
      endAt: new Date(now + 15 * day + 3 * 60 * 60 * 1000),
      capacity: 60,
      status: EventStatus.PUBLICADO,
    },
  });

  const upcomingWebinar = await prisma.event.create({
    data: {
      title: "Webinar: Transformación digital en el retail",
      slug: "webinar-transformacion-digital-retail",
      description: "Cómo digitalizar procesos de venta y stock en negocios de retail.",
      topic: "Transformación digital",
      modality: EventModality.ZOOM,
      zoomLink: "https://zoom.us/j/22222222222",
      startAt: new Date(now + 5 * day),
      endAt: new Date(now + 5 * day + 60 * 60 * 1000),
      capacity: 150,
      status: EventStatus.PUBLICADO,
    },
  });

  async function inviteRegisterAttend(eventId: string, contactId: string, segmentId: string | null, outcome: "attended" | "registered_no_show" | "invited_only" | "declined") {
    const invitation = await prisma.invitation.create({
      data: {
        eventId,
        contactId,
        segmentId: segmentId ?? undefined,
        status: outcome === "declined" ? InvitationStatus.DECLINADA : outcome === "invited_only" ? InvitationStatus.ENVIADA : InvitationStatus.REGISTRADA,
        sentAt: new Date(now - 45 * day),
      },
    });
    await prisma.timelineEvent.create({
      data: { contactId, eventId, type: TimelineType.INVITED, title: "Invitación enviada", occurredAt: invitation.sentAt },
    });

    if (outcome === "declined") {
      await prisma.timelineEvent.create({
        data: { contactId, eventId, type: TimelineType.DECLINED, title: "Invitación declinada", occurredAt: new Date(now - 44 * day) },
      });
      return;
    }
    if (outcome === "invited_only") return;

    const reg = await prisma.registration.create({
      data: { eventId, contactId, ticketCode: ticketCode(), source: RegistrationSource.INVITACION, registeredAt: new Date(now - 43 * day) },
    });
    await prisma.timelineEvent.create({
      data: { contactId, eventId, type: TimelineType.REGISTERED, title: "Se inscribió al evento", occurredAt: reg.registeredAt },
    });

    if (outcome === "attended") {
      const att = await prisma.attendance.create({ data: { eventId, contactId } });
      await prisma.timelineEvent.create({
        data: { contactId, eventId, type: TimelineType.ATTENDED, title: "Asistió al evento", occurredAt: att.checkedInAt },
      });
    }
  }

  const outcomes: Array<"attended" | "registered_no_show" | "invited_only" | "declined"> = [
    "attended", "attended", "attended", "registered_no_show", "invited_only", "declined", "attended", "attended",
    "registered_no_show", "attended", "invited_only", "attended", "declined", "attended",
  ];
  for (let i = 0; i < contacts.length; i++) {
    await inviteRegisterAttend(pastWebinar.id, contacts[i].id, segRM.id, outcomes[i % outcomes.length]);
  }
  const tallerOutcomes: Array<"attended" | "registered_no_show" | "invited_only" | "declined"> = [
    "attended", "registered_no_show", "attended", "invited_only", "attended", "attended", "declined", "attended",
  ];
  for (let i = 0; i < tallerOutcomes.length; i++) {
    await inviteRegisterAttend(pastTaller.id, contacts[i + 3].id, segFeria.id, tallerOutcomes[i]);
  }

  // invitaciones pendientes a eventos futuros (sin resolver aún)
  for (const c of contacts.slice(0, 8)) {
    const inv = await prisma.invitation.create({ data: { eventId: upcomingHibrido.id, contactId: c.id, segmentId: segExport.id, sentAt: new Date(now - 2 * day) } });
    await prisma.timelineEvent.create({ data: { contactId: c.id, eventId: upcomingHibrido.id, type: TimelineType.INVITED, title: "Invitación enviada", occurredAt: inv.sentAt } });
  }
  for (const c of contacts.slice(0, 3)) {
    const reg = await prisma.registration.create({ data: { eventId: upcomingHibrido.id, contactId: c.id, ticketCode: ticketCode(), source: RegistrationSource.INVITACION, registeredAt: new Date(now - 1 * day) } });
    await prisma.timelineEvent.create({ data: { contactId: c.id, eventId: upcomingHibrido.id, type: TimelineType.REGISTERED, title: "Se inscribió al evento", occurredAt: reg.registeredAt } });
  }
  for (const c of contacts) {
    const inv = await prisma.invitation.create({ data: { eventId: upcomingWebinar.id, contactId: c.id, sentAt: new Date(now - 1 * day) } });
    await prisma.timelineEvent.create({ data: { contactId: c.id, eventId: upcomingWebinar.id, type: TimelineType.INVITED, title: "Invitación enviada", occurredAt: inv.sentAt } });
  }

  console.log("Registrando importación CSV histórica de ejemplo...");
  await prisma.importBatch.create({
    data: {
      filename: "vamosmipyme_formularios_2024-06.csv",
      importedAt: new Date(now - 60 * day),
      rowCount: CONTACTS.length,
      createdCount: CONTACTS.length,
      updatedCount: 0,
      errorCount: 0,
      notes: "Carga inicial de ejemplo (datos ficticios) simulando exportación manual de vamosmipyme.cl",
    },
  });
  for (const c of contacts) {
    await prisma.timelineEvent.create({
      data: {
        contactId: c.id,
        type: TimelineType.IMPORT,
        title: "Registro en formulario vamosmipyme.cl",
        description: "Importado desde CSV: vamosmipyme_formularios_2024-06.csv",
        occurredAt: new Date(now - 60 * day),
      },
    });
  }

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
