import { FastifyInstance } from "fastify";
import { TicketController } from "./ticket.controller";
import {
  listTicketsQuerySchema,
  listTicketsResponseSchema,
  ticketResponseSchema,
  ticketIdParamsSchema,
  assignTeamSchema,
  createTicketSchema,
  updateTicketSchema,
  ticketSummarySchema,
} from "./ticket.schemas";
import { Type } from "@sinclair/typebox";

async function ticketRoutes(fastify: FastifyInstance) {
  const ticketController = new TicketController();

  //fastify.addHook('preHandler', fastify.authenticate);
  fastify.addSchema(ticketResponseSchema);
  fastify.addSchema(ticketSummarySchema);
  fastify.addSchema(listTicketsQuerySchema);
  fastify.addSchema(listTicketsResponseSchema);
  fastify.addSchema(ticketIdParamsSchema);
  fastify.addSchema(assignTeamSchema);
  fastify.addSchema(createTicketSchema);
  fastify.addSchema(updateTicketSchema);

  fastify.get(
    "/",
    {
      schema: {
        summary: "Lista chamados com filtros e ordenação",
        description:
          "Use ?recent=true para a visualização da home (Story 1). Use status, category, location, priority para filtrar (Story 2). Use sortBy, sortOrder para ordenar (Story 3).",
        tags: ["Tickets"],
        querystring: Type.Ref(listTicketsQuerySchema),
        response: {
          200: Type.Ref(listTicketsResponseSchema),
        },
      },
    },
    ticketController.listTicketsHandler.bind(ticketController)
  );

  fastify.get(
    "/:ticketId",
    {
      schema: {
        summary: "Busca um chamado pelo ID (protocolo)",
        tags: ["Tickets"],
        params: Type.Ref(ticketIdParamsSchema),
        response: {
          200: Type.Ref(ticketResponseSchema),
          404: {
            description: "Chamado não encontrado",
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
    },
    ticketController.getTicketByIdHandler.bind(ticketController)
  );

  fastify.post(
    "/:ticketId/assign",
    {
      schema: {
        summary: "Atribui um chamado a uma equipe",
        tags: ["Tickets"],
        params: Type.Ref(ticketIdParamsSchema),
        body: Type.Ref(assignTeamSchema),
        response: {
          200: Type.Ref(ticketResponseSchema),
          404: {
            description: "Chamado ou Equipe não encontrada",
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
    },
    ticketController.assignTeamHandler.bind(ticketController)
  );

  fastify.post(
    "/",
    {
      schema: {
        summary: "Cria um novo chamado",
        tags: ["Tickets"],
        body: Type.Ref(createTicketSchema),
        response: {
          201: Type.Ref(ticketResponseSchema),
        },
      },
    },
    ticketController.createTicketHandler.bind(ticketController)
  );

  fastify.patch(
    "/:ticketId",
    {
      schema: {
        summary: "Atualiza parcialmente um chamado",
        tags: ["Tickets"],
        params: Type.Ref(ticketIdParamsSchema),
        body: Type.Ref(updateTicketSchema),
        response: {
          200: Type.Ref(ticketResponseSchema),
          404: {
            description: "Chamado não encontrado",
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
    },
    ticketController.updateTicketHandler.bind(ticketController)
  );
}

export default ticketRoutes;
