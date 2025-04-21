import { UserRepository } from "./user.repository";
import { UserCreateInput, UserUpdateInput } from "./user.types";
import { DbUser } from "@/storage/types";
import { sendConfirmationEmail } from "@/lib/email";
import { generateTemporaryPassword } from "@/lib/utils";
import { ListUsersQuery } from "./user.schemas";

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async createUser(data: UserCreateInput): Promise<DbUser> {
    const tempPassword = generateTemporaryPassword();
    const newUser = await this.repository.create({
      ...data,
      tempPassword,
    });

    sendConfirmationEmail(newUser).catch((error) => {});

    const { tempPassword: _omitted, ...userResponseData } = newUser;
    return userResponseData;
  }

  async getUserById(id: string): Promise<DbUser | null> {
    return this.repository.findById(id);
  }

  async listUsers(
    query: ListUsersQuery
  ): Promise<{ users: DbUser[]; total: number; page: number; limit: number }> {
    const { users, total } = await this.repository.findAll({
      page: query.page!,
      limit: query.limit!,
    });
    return { users, total, page: query.page!, limit: query.limit! };
  }

  async updateUser(id: string, data: UserUpdateInput): Promise<DbUser | null> {
    const updatedUser = await this.repository.update(id, data);
    return updatedUser;
  }

  async deactivateUser(id: string): Promise<DbUser | null> {
    return this.updateUser(id, { isActive: false });
  }
}
