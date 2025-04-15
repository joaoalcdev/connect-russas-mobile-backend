import { Type, Static } from "@sinclair/typebox";
import { userResponseSchema } from "@/modules/users/user.schemas";

const TeamCore = Type.Object({
  name: Type.String({ minLength: 2, description: "Nome da equipe" }),
  description: Type.Optional(
    Type.String({ description: "Descrição da equipe" })
  ),
});

export const createTeamSchema = Type.Object(
  {
    name: Type.String({ minLength: 2 }),
    description: Type.Optional(Type.String()),
    memberIds: Type.Optional(
      Type.Array(Type.String({ format: "uuid" }), { minItems: 0 })
    ),
  },
  { $id: "CreateTeamSchema", additionalProperties: false }
);
export type CreateTeamInput = Static<typeof createTeamSchema>;

export const teamResponseSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    ...TeamCore.properties,
    members: Type.Array(Type.Ref(userResponseSchema)),
    createdAt: Type.Unsafe<Date | string>({ format: "date-time" }),
    updatedAt: Type.Unsafe<Date | string>({ format: "date-time" }),
  },
  { $id: "TeamResponseSchema" }
);
export type TeamResponse = Static<typeof teamResponseSchema>;

export const listTeamsResponseSchema = Type.Array(
  Type.Object({
    id: Type.String({ format: "uuid" }),
    name: Type.String(),
    description: Type.Optional(Type.String()),
    memberCount: Type.Integer({ description: "Número de membros na equipe" }),
    createdAt: Type.Unsafe<Date | string>({ format: "date-time" }),
    updatedAt: Type.Unsafe<Date | string>({ format: "date-time" }),
  }),
  { $id: "ListTeamsResponseSchema" }
);

export const teamIdParamsSchema = Type.Object(
  {
    teamId: Type.String({ format: "uuid", description: "ID da equipe" }),
  },
  { $id: "TeamIdParamsSchema" }
);
export type TeamIdParams = Static<typeof teamIdParamsSchema>;

export const teamMemberParamsSchema = Type.Object(
  {
    teamId: Type.String({ format: "uuid", description: "ID da equipe" }),
    userId: Type.String({ format: "uuid", description: "ID do usuário" }),
  },
  { $id: "TeamMemberParamsSchema" }
);
export type TeamMemberParams = Static<typeof teamMemberParamsSchema>;

export const addMemberSchema = Type.Object(
  {
    userId: Type.String({ format: "uuid" }),
  },
  { $id: "AddMemberSchema", additionalProperties: false }
);
export type AddMemberInput = Static<typeof addMemberSchema>;

export const listTeamsQuerySchema = Type.Object(
  {
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 10 })
    ),
  },
  { $id: "ListTeamsQuerySchema" }
);
export type ListTeamsQuery = Static<typeof listTeamsQuerySchema>;
