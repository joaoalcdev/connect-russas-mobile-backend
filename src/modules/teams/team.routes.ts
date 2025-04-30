import { FastifyInstance } from "fastify";
import { TeamController } from "./team.controller";
import {
  createTeamSchema,
  teamResponseSchema,
  listTeamsResponseSchema,
  teamIdParamsSchema,
  teamMemberParamsSchema,
  addMemberSchema,
  listTeamsQuerySchema,
} from "./team.schemas";
import { userResponseSchema } from "../../modules/users/user.schemas";
import { Type } from "@sinclair/typebox";

async function teamRoutes(fastify: FastifyInstance) {
  const teamController = new TeamController();

  fastify.addSchema(userResponseSchema);
  fastify.addSchema(createTeamSchema);
  fastify.addSchema(teamResponseSchema);
  fastify.addSchema(listTeamsResponseSchema);
  fastify.addSchema(teamIdParamsSchema);
  fastify.addSchema(teamMemberParamsSchema);
  fastify.addSchema(addMemberSchema);
  fastify.addSchema(listTeamsQuerySchema);

  fastify.post(
    "/",
    {
      schema: {
        summary: "Cria uma nova equipe",
        tags: ["Teams"],
        body: Type.Ref(createTeamSchema),
        response: {
          201: Type.Ref(teamResponseSchema),
        },
      },
    },
    teamController.createTeamHandler.bind(teamController)
  );

  fastify.get(
    "/:teamId",
    {
      schema: {
        summary: "Busca uma equipe pelo ID, incluindo detalhes dos membros",
        tags: ["Teams"],
        params: Type.Ref(teamIdParamsSchema),
        response: {
          200: Type.Ref(teamResponseSchema),
          404: {
            description: "Equipe não encontrada",
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
    },
    teamController.getTeamByIdHandler.bind(teamController)
  );

  fastify.get(
    "/",
    {
      schema: {
        summary: "Lista equipes com paginação",
        tags: ["Teams"],
        querystring: Type.Ref(listTeamsQuerySchema),
        response: {
          200: Type.Object({
            teams: Type.Ref(listTeamsResponseSchema),
            total: Type.Integer(),
            page: Type.Integer(),
            limit: Type.Integer(),
          }),
        },
      },
    },
    teamController.listTeamsHandler.bind(teamController)
  );

  fastify.post(
    "/:teamId/members",
    {
      schema: {
        summary: "Adiciona um usuário a uma equipe",
        tags: ["Teams"],
        params: Type.Ref(teamIdParamsSchema),
        body: Type.Ref(addMemberSchema),
        response: {
          204: { type: "null", description: "Membro adicionado com sucesso" },
          404: {
            description:
              "Equipe ou usuário não encontrado / Usuário já é membro",
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
    },
    teamController.addMemberHandler.bind(teamController)
  );

  fastify.delete(
    "/:teamId/members/:userId",
    {
      schema: {
        summary: "Remove um usuário de uma equipe",
        tags: ["Teams"],
        params: Type.Ref(teamMemberParamsSchema),
        response: {
          204: { type: "null", description: "Membro removido com sucesso" },
          404: {
            description:
              "Equipe ou usuário não encontrado / Usuário não era membro",
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
    },
    teamController.removeMemberHandler.bind(teamController)
  );
}

export default teamRoutes;
