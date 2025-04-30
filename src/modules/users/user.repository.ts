import { users, usersByEmail } from "../../storage";
import { DbUser } from "../../storage/types";
import { UserCreateInput, UserUpdateInput } from "./user.types";

export class UserRepository {
  async create(
    data: UserCreateInput & { tempPassword?: string }
  ): Promise<DbUser> {
    if (usersByEmail.has(data.email)) {
      throw new Error(`User with email ${data.email} already exists.`);
    }

    const now = new Date();
    const newUser: DbUser = {
      id: '123',
      ...data,
      isActive: true,
      teamIds: [],
      createdAt: now,
      updatedAt: now,
    };

    users.set(newUser.id, newUser);
    usersByEmail.set(newUser.email, newUser.id);
    return { ...newUser };
  }

  async findById(id: string): Promise<DbUser | null> {
    const user = users.get(id);
    return user ? { ...user } : null;
  }

  async findByEmail(email: string): Promise<DbUser | null> {
    const userId = usersByEmail.get(email);
    if (!userId) return null;
    return this.findById(userId);
  }

  async findAll(options: {
    page: number;
    limit: number;
  }): Promise<{ users: DbUser[]; total: number }> {
    const allUsers = Array.from(users.values());
    const total = allUsers.length;

    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    return { users: paginatedUsers.map((u) => ({ ...u })), total };
  }

  async update(id: string, data: UserUpdateInput): Promise<DbUser | null> {
    const existingUser = users.get(id);
    if (!existingUser) {
      return null;
    }

    if (data.email && data.email !== existingUser.email) {
      if (usersByEmail.has(data.email)) {
        throw new Error(`Email ${data.email} is already in use.`);
      }
      usersByEmail.delete(existingUser.email);
      usersByEmail.set(data.email, id);
    }

    const updatedUser: DbUser = {
      ...existingUser,
      ...data,
      updatedAt: new Date(),
    };

    users.set(id, updatedUser);
    return { ...updatedUser };
  }

  async addUserToTeam(userId: string, teamId: string): Promise<boolean> {
    const user = users.get(userId);
    if (!user || user.teamIds.includes(teamId)) {
      return false;
    }
    user.teamIds.push(teamId);
    user.updatedAt = new Date();
    users.set(userId, user);
    return true;
  }

  async removeUserFromTeam(userId: string, teamId: string): Promise<boolean> {
    const user = users.get(userId);
    if (!user) {
      return false;
    }
    const initialLength = user.teamIds.length;
    user.teamIds = user.teamIds.filter((tId) => tId !== teamId);
    if (user.teamIds.length < initialLength) {
      user.updatedAt = new Date();
      users.set(userId, user);
      return true;
    }
    return false;
  }
}
