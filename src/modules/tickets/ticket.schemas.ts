import { Type, Static } from "@sinclair/typebox";
import {
  TicketStatus as PrismaTicketStatus,
  TicketPriority as PrismaTicketPriority,
} from "@prisma/client";

const TicketStatusType = Type.Enum(PrismaTicketStatus, { $id: "TicketStatus" });
const TicketPriorityType = Type.Enum(PrismaTicketPriority, {
  $id: "TicketPriority",
});

const LocationInputSchema = Type.Object({
  address: Type.String(),
  latitude: Type.Optional(Type.Number()),
  longitude: Type.Optional(Type.Number()),
});

const TicketCore = Type.Object({
  title: Type.String({ description: "Título do chamado" }),
  description: Type.String({ description: "Descrição detalhada" }),
  category: Type.String({ description: "Categoria do problema" }),
  address: Type.String({ description: "Endereço do chamado" }),
  latitude: Type.Optional(Type.Number()),
  longitude: Type.Optional(Type.Number()),
  status: TicketStatusType,
  priority: TicketPriorityType,

  requesterId: Type.Optional(
    Type.String({ description: "ID do Solicitante (CUID)" })
  ),

  assignedTeamId: Type.Optional(
    Type.Union([
      Type.String({ description: "ID da Equipe Atribuída (CUID)" }),
      Type.Null(),
    ])
  ),
});

export const ticketResponseSchema = Type.Object(
  {
    id: Type.String({ description: "Protocolo do chamado (CUID)" }),
    ...TicketCore.properties,
    createdAt: Type.String({
      format: "date-time",
      description: "Data de criação",
    }),
    updatedAt: Type.String({
      format: "date-time",
      description: "Data da última atualização",
    }),
    resolvedAt: Type.Optional(
      Type.Union([Type.String({ format: "date-time" }), Type.Null()], {
        description: "Data de resolução",
      })
    ),
  },
  { $id: "TicketResponseSchema" }
);
export type TicketResponse = Static<typeof ticketResponseSchema>;

export const ticketSummarySchema = Type.Object(
  {
    id: Type.String({ description: "Protocolo (CUID)" }),
    title: Type.String({ description: "Problema (Título)" }),
    status: TicketStatusType,
    location: Type.Object({ address: Type.String() }),
  },
  { $id: "TicketSummarySchema" }
);
export type TicketSummary = Static<typeof ticketSummarySchema>;

export const listTicketsQuerySchema = Type.Object(
  {
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 10 })
    ),
    status: Type.Optional(TicketStatusType),
    category: Type.Optional(Type.String()),
    location: Type.Optional(Type.String({ description: "Busca no endereço" })),
    priority: Type.Optional(TicketPriorityType),
    assignedTeamId: Type.Optional(
      Type.String({ description: "Filtrar por ID da Equipe (CUID)" })
    ),
    sortBy: Type.Optional(
      Type.Enum({
        createdAt: "createdAt",
        updatedAt: "updatedAt",
        priority: "priority",
      })
    ),
    sortOrder: Type.Optional(Type.Enum({ asc: "asc", desc: "desc" })),
    recent: Type.Optional(
      Type.Boolean({ description: "Listar apenas recentes para home" })
    ),
  },
  { $id: "ListTicketsQuerySchema" }
);
export type ListTicketsQuery = Static<typeof listTicketsQuerySchema>;

export const listTicketsResponseSchema = Type.Object(
  {
    tickets: Type.Array(
      Type.Union([
        Type.Ref(ticketResponseSchema),
        Type.Ref(ticketSummarySchema),
      ]),
      { description: "Lista de chamados (completa ou resumida)" }
    ),
    total: Type.Integer(),
    page: Type.Integer(),
    limit: Type.Integer(),
  },
  { $id: "ListTicketsResponseSchema" }
);

export const ticketIdParamsSchema = Type.Object(
  {
    ticketId: Type.String({ description: "ID do Chamado (CUID)" }),
  },
  { $id: "TicketIdParamsSchema" }
);
export type TicketIdParams = Static<typeof ticketIdParamsSchema>;

export const assignTeamSchema = Type.Object(
  {
    teamId: Type.String({ description: "ID da equipe (CUID)" }),
  },
  { $id: "AssignTeamSchema", additionalProperties: false }
);
export type AssignTeamInput = Static<typeof assignTeamSchema>;

export const createTicketSchema = Type.Object(
  {
    title: Type.String({ minLength: 5 }),
    description: Type.String({ minLength: 10 }),
    category: Type.String(),
    location: LocationInputSchema,
    priority: Type.Optional(TicketPriorityType),
  },
  { $id: "CreateTicketSchema", additionalProperties: false }
);
export type CreateTicketInput = Static<typeof createTicketSchema>;

export const updateTicketSchema = Type.Partial(
  Type.Object({
    title: Type.String({ minLength: 1 }),
    description: Type.String({ minLength: 1 }),
    category: Type.String(),
    location: LocationInputSchema,
    status: TicketStatusType,
    priority: TicketPriorityType,
    assignedTeamId: Type.Union([
      Type.String({ description: "ID da Equipe (CUID)" }),
      Type.Null(),
    ]),
  }),
  {
    $id: "UpdateTicketSchema",
    additionalProperties: false,
    minProperties: 1,
  }
);
export type UpdateTicketInput = Static<typeof updateTicketSchema>;
