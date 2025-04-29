import fastify, {
  FastifyInstance,
} from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";

import {
  registerSecurityPlugins,
  registerErrorHandler,
  JwtPayload,
} from "./config/index";

import userRoutes from "./modules/users/user.routes";
import teamRoutes from "./modules/teams/team.routes";
import ticketRoutes from "./modules/tickets/ticket.routes";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
    },
  }).withTypeProvider<TypeBoxTypeProvider>();

  await registerSecurityPlugins(app);

  await app.register(fastifySwagger, {
    mode: "dynamic",
    openapi: {
      info: {
        title: "CidConnect API DOCS",
        description: "Documentação interativa da API gerada automaticamente.",
        version: "1.0.0",
      },
      tags: [
        { name: "Users", description: "Operações relacionadas a usuários" },
        { name: "Teams", description: "Operações relacionadas a times" },
        { name: "Tickets", description: "Operações relacionadas a chamados" },
      ],

      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Insira o token JWT no formato: Bearer <seu-token>",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await app.register(fastifySwaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      displayOperationId: false,
      layout: "BaseLayout",
      persistAuthorization: true,
    },
  });

  await app.register(userRoutes, { prefix: "/api/v1/users" });
  await app.register(teamRoutes, { prefix: "/api/v1/teams" });
  await app.register(ticketRoutes, { prefix: "/api/v1/tickets" });

  app.get("/", { schema: { hide: true } }, async (request, reply) => {
    return { message: "Welcome to CidConnect API!" };
  });

  registerErrorHandler(app);

  return app;
}
