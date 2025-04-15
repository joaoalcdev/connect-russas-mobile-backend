import { FastifyRequest, FastifyReply } from "fastify";
import { TeamService } from "./team.service";
import {
  CreateTeamInput,
  ListTeamsQuery,
  TeamIdParams,
  TeamMemberParams,
  AddMemberInput,
} from "./team.schemas";

export class TeamController {
  private service: TeamService;

  constructor() {
    this.service = new TeamService();
  }

  async createTeamHandler(
    request: FastifyRequest<{ Body: CreateTeamInput }>,
    reply: FastifyReply
  ) {
    try {
      const newTeam = await this.service.createTeam(request.body);
      const teamWithMembers = await this.service.getTeamById(newTeam.id);
      return reply.code(201).send(teamWithMembers);
    } catch (error: any) {
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }

  async getTeamByIdHandler(
    request: FastifyRequest<{ Params: TeamIdParams }>,
    reply: FastifyReply
  ) {
    try {
      const team = await this.service.getTeamById(request.params.teamId);
      if (!team) {
        return reply.code(404).send({ message: "Team not found" });
      }
      return reply.code(200).send(team);
    } catch (error: any) {
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }

  async listTeamsHandler(
    request: FastifyRequest<{ Querystring: ListTeamsQuery }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.listTeams(request.query);
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }

  async addMemberHandler(
    request: FastifyRequest<{ Params: TeamIdParams; Body: AddMemberInput }>,
    reply: FastifyReply
  ) {
    try {
      const success = await this.service.addMemberToTeam(
        request.params.teamId,
        request.body.userId
      );
      if (!success) {
        return reply
          .code(404)
          .send({ message: "User or Team not found, or user already member" });
      }
      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }

  async removeMemberHandler(
    request: FastifyRequest<{ Params: TeamMemberParams }>,
    reply: FastifyReply
  ) {
    try {
      const success = await this.service.removeMemberFromTeam(
        request.params.teamId,
        request.params.userId
      );
      if (!success) {
        return reply
          .code(404)
          .send({ message: "User or Team not found, or user not a member" });
      }
      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }
}
