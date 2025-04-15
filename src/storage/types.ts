// src/storage/types.ts
import { UserRole } from "@/modules/users/user.types"; // Usando alias do tsconfig

export interface DbUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tempPassword?: string; // Senha temporária
  isActive: boolean;
  teamIds: string[]; // IDs das equipes às quais o usuário pertence
  createdAt: Date;
  updatedAt: Date;
}

export interface DbTeam {
  id: string;
  name: string;
  description: string;
  memberIds: string[]; // IDs dos usuários na equipe
  // permissions: any; // Para a história 5 (futuro)
  createdAt: Date;
  updatedAt: Date;
}
