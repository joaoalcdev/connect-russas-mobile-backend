import { Static, Type } from "@sinclair/typebox";

export const UserRole = Type.Union(
  [
    Type.Literal("ADMIN"),
    Type.Literal("GESTOR"),
    Type.Literal("OPERADOR"),
    Type.Literal("SUPERVISOR"),
    Type.Literal("ANALISTA"),
  ],
  { $id: "UserRole", description: "Papel do usuário no sistema" }
);
export type UserRole = Static<typeof UserRole>;

export interface UserCreateInput {
  name: string;
  email: string;
  role: UserRole;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}
