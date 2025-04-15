import { FastifyInstance } from "fastify";
import { UserController } from "./user.controller";
import {
  createUserSchema,
  userResponseSchema,
  listUsersResponseSchema,
  userIdParamsSchema,
  updateUserSchema,
  listUsersQuerySchema,
} from "./user.schemas";
import { Type } from "@sinclair/typebox";

async function userRoutes(fastify: FastifyInstance) {
  const userController = new UserController();

  fastify.addSchema(createUserSchema);
  fastify.addSchema(userResponseSchema);
  fastify.addSchema(listUsersResponseSchema);
  fastify.addSchema(userIdParamsSchema);
  fastify.addSchema(updateUserSchema);
  fastify.addSchema(listUsersQuerySchema);

  fastify.post(
    "/",
    {
      schema: {
        summary: "Cadastra um novo usuário",
        tags: ["Users"],
        body: Type.Ref(createUserSchema),
        response: {
          201: Type.Ref(userResponseSchema),
          409: {
            description: "Email já existe",
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
    },
    userController.createUserHandler.bind(userController)
  );

  fastify.get(
    "/:id",
    {
      schema: {
        summary: "Busca um usuário pelo ID",
        tags: ["Users"],
        params: Type.Ref(userIdParamsSchema),
        response: {
          200: Type.Ref(userResponseSchema),
          404: {
            description: "Usuário não encontrado",
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
    },
    userController.getUserByIdHandler.bind(userController)
  );

  fastify.get(
    "/",
    {
      schema: {
        summary: "Lista usuários com paginação",
        tags: ["Users"],
        querystring: Type.Ref(listUsersQuerySchema),
        response: {
          200: Type.Object({
            users: Type.Ref(listUsersResponseSchema),
            total: Type.Integer(),
            page: Type.Integer(),
            limit: Type.Integer(),
          }),
        },
      },
    },
    userController.listUsersHandler.bind(userController)
  );

  fastify.put(
    "/:id",
    {
      schema: {
        summary:
          "Atualiza informações de um usuário (nome, email, papel, status)",
        tags: ["Users"],
        params: Type.Ref(userIdParamsSchema),
        body: Type.Ref(updateUserSchema),
        response: {
          200: Type.Ref(userResponseSchema),
          404: {
            description: "Usuário não encontrado",
            type: "object",
            properties: { message: { type: "string" } },
          },
          409: {
            description: "Email já em uso por outro usuário",
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
    },
    userController.updateUserHandler.bind(userController)
  );
}

export default userRoutes;
