import fastify, { FastifyInstance } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";

import userRoutes from "./modules/users/user.routes";
import teamRoutes from "./modules/teams/team.routes";
// import reportRoutes from './modules/reports/report.routes';

// import { sharedSchemas } from "./shared/schemas";

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: true,
  }).withTypeProvider<TypeBoxTypeProvider>();

  await app.register(fastifySwagger, {
    mode: "dynamic",
    openapi: {
      info: {
        title: "API DOCS",
        description: "Documentação interativa da API gerada automaticamente.",
        version: "1.0.0",
      },
      // servers: [
      //   { url: 'http://localhost:3000', description: 'Desenvolvimento' },
      //   { url: 'https://api.meudominio.com', description: 'Produção' }
      // ],
      tags: [
        { name: "Users", description: "Operações relacionadas a usuários" },
        { name: "Teams", description: "Operações relacionadas a times" },
        // { name: 'Reports', description: 'Operações relacionadas a relatórios' },
      ],
      // components: {
      //   schemas: sharedSchemas,
      //   securitySchemes: {
      //     apiKey: {
      //       type: 'apiKey',
      //       name: 'apiKey',
      //       in: 'header',
      //     },
      //   }
      // },
      // security: [
      //   { apiKey: [] }
      // ],
    },
  });

  await app.register(fastifySwaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      displayOperationId: false,
      layout: "BaseLayout",
      // filter: true,
    },
    // staticCSP: true,
  });

  // await app.register(import('@fastify/cors'));
  // await app.register(import('@fastify/helmet'));

  await app.register(userRoutes, { prefix: "/api/v1/users" });
  await app.register(teamRoutes, { prefix: "/api/v1/teams" });
  // await app.register(reportRoutes, { prefix: '/api/v1/reports' });

  // app.setErrorHandler(globalErrorHandler);

  app.get(
    "/",
    {
      schema: {
        hide: true,
      },
    },
    async (request, reply) => {
      return { status: "ok", timestamp: new Date().toISOString() };
    }
  );

  return app;
}
