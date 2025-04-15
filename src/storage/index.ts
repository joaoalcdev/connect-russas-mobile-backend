// src/storage/index.ts
import { DbUser, DbTeam } from "./types";

export const users = new Map<string, DbUser>();
export const teams = new Map<string, DbTeam>();
export const usersByEmail = new Map<string, string>();

const initialAdminId = "super-admin";
users.set(initialAdminId, {
  id: initialAdminId,
  name: "Admin Principal",
  email: "admin@example.com",
  role: "ADMIN",
  isActive: true,
  teamIds: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});
usersByEmail.set("admin@example.com", initialAdminId);

console.log("📦 In-memory storage initialized.");
