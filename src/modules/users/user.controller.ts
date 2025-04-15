// src/modules/users/user.controller.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { UserService } from "./user.service";
import {
  CreateUserInput,
  UpdateUserInput,
  UserIdParams,
  ListUsersQuery,
} from "./user.schemas";

export class UserController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  async createUserHandler(
    request: FastifyRequest<{ Body: CreateUserInput }>,
    reply: FastifyReply
  ) {
    try {
      const newUser = await this.service.createUser(request.body);
      return reply.code(201).send(newUser);
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        return reply.code(409).send({ message: error.message });
      }
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }

  async getUserByIdHandler(
    request: FastifyRequest<{ Params: UserIdParams }>,
    reply: FastifyReply
  ) {
    try {
      const user = await this.service.getUserById(request.params.id);
      if (!user) {
        return reply.code(404).send({ message: "User not found" });
      }
      return reply.code(200).send(user);
    } catch (error: any) {
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }

  async listUsersHandler(
    request: FastifyRequest<{ Querystring: ListUsersQuery }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.listUsers(request.query);
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }

  async updateUserHandler(
    request: FastifyRequest<{ Params: UserIdParams; Body: UpdateUserInput }>,
    reply: FastifyReply
  ) {
    try {
      const updatedUser = await this.service.updateUser(
        request.params.id,
        request.body
      );
      if (!updatedUser) {
        return reply.code(404).send({ message: "User not found" });
      }
      return reply.code(200).send(updatedUser);
    } catch (error: any) {
      if (error.message?.includes("is already in use")) {
        return reply.code(409).send({ message: error.message });
      }
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }
}
