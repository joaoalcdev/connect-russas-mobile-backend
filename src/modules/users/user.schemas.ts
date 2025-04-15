import { Type, Static } from "@sinclair/typebox";
import { UserRole } from "./user.types";

const UserCore = Type.Object({
  name: Type.String({ minLength: 2, description: "Nome completo do usuário" }),
  email: Type.String({
    format: "email",
    description: "Endereço de e-mail único",
  }),
  role: UserRole,
  isActive: Type.Boolean({ description: "Indica se o usuário está ativo" }),
  teamIds: Type.Array(Type.String({ format: "uuid" }), {
    description: "IDs das equipes do usuário",
  }),
});

export const createUserSchema = Type.Object(
  {
    name: Type.String({ minLength: 2 }),
    email: Type.String({ format: "email" }),
    role: UserRole,
  },
  { $id: "CreateUserSchema", additionalProperties: false }
);
export type CreateUserInput = Static<typeof createUserSchema>;

export const userResponseSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    ...UserCore.properties,
    createdAt: Type.Unsafe<Date | string>({
      format: "date-time",
      description: "Data de criação",
    }),
    updatedAt: Type.Unsafe<Date | string>({
      format: "date-time",
      description: "Data da última atualização",
    }),
  },
  { $id: "UserResponseSchema" }
);
export type UserResponse = Static<typeof userResponseSchema>;

export const listUsersResponseSchema = Type.Array(userResponseSchema, {
  $id: "ListUsersResponseSchema",
});

export const userIdParamsSchema = Type.Object(
  {
    id: Type.String({ format: "uuid", description: "ID do usuário" }),
  },
  { $id: "UserIdParamsSchema" }
);
export type UserIdParams = Static<typeof userIdParamsSchema>;

export const updateUserSchema = Type.Partial(
  Type.Object({
    name: Type.String({ minLength: 2 }),
    email: Type.String({ format: "email" }),
    role: UserRole,
    isActive: Type.Boolean(),
  }),
  { $id: "UpdateUserSchema", additionalProperties: false, minProperties: 1 }
);
export type UpdateUserInput = Static<typeof updateUserSchema>;

export const listUsersQuerySchema = Type.Object(
  {
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 10 })
    ),
  },
  { $id: "ListUsersQuerySchema" }
);
export type ListUsersQuery = Static<typeof listUsersQuerySchema>;
