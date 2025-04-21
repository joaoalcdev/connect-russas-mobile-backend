import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fastifyHelmet from "@fastify/helmet";
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyJwt, { JWT } from "@fastify/jwt";

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
  interface FastifyRequest {
    jwt: JWT;
    user: JwtPayload;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

export async function registerSecurityPlugins(
  app: FastifyInstance
): Promise<void> {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    app.log.error(
      "Variável de ambiente JWT_SECRET não definida! A aplicação não pode iniciar com segurança."
    );
    process.exit(1);
  }

  const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];
  app.log.info(
    `Configurando CORS para origens: ${
      allowedOrigins.length > 0 ? allowedOrigins.join(", ") : "*"
    }`
  );
  await app.register(fastifyCors, {
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        app.log.warn(`Origem CORS bloqueada: ${origin}`);
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  await app.register(fastifyHelmet, {});

  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || "100", 10);
  const rateLimitWindow = process.env.RATE_LIMIT_TIME_WINDOW || "1 minute";
  await app.register(fastifyRateLimit, {
    max: rateLimitMax,
    timeWindow: rateLimitWindow,
  });
  app.log.info(
    `Rate limit configurado: ${rateLimitMax} reqs / ${rateLimitWindow}`
  );

  await app.register(fastifyJwt, {
    secret: jwtSecret,
  });

  app.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        await request.jwtVerify();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erro desconhecido durante a autenticação";
        request.log.warn({ error: errorMessage }, "Falha na autenticação JWT");
        reply
          .code(401)
          .send({ code: "UNAUTHENTICATED", message: "Acesso não autorizado." });
      }
    }
  );
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    if (error.validation) {
      request.log.warn(
        { validation: error.validation },
        "Erro de validação de entrada"
      );
      reply.status(400).send({
        code: "VALIDATION_ERROR",
        message: "Dados de entrada inválidos.",
        errors: error.validation?.map((v) => ({
          field: v.instancePath.substring(1) || v.params?.missingProperty,
          message: v.message,
        })),
      });
    } else if (
      error.statusCode &&
      error.statusCode >= 400 &&
      error.statusCode < 500
    ) {
      request.log.info(
        { statusCode: error.statusCode, message: error.message },
        "Erro do cliente tratado"
      );
      reply.status(error.statusCode).send({
        code: error.code || `HTTP_${error.statusCode}`,
        message:
          error.message || "Ocorreu um erro ao processar sua requisição.",
      });
    } else {
      request.log.error(error, "Erro interno inesperado do servidor");

      if (process.env.NODE_ENV === "production") {
        reply.status(500).send({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ocorreu um erro inesperado em nossos servidores.",
        });
      } else {
        reply.status(error.statusCode || 500).send({
          code: error.code || "INTERNAL_SERVER_ERROR",
          message: error.message,
          stack: error.stack,
        });
      }
    }
  });

  app.log.info("Tratador de erros global configurado.");
}
