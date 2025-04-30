import { TeamRepository } from "./team.repository";
import { UserRepository } from "../../modules/users/user.repository";
import { TeamCreateInput, TeamUpdateInput } from "./team.types";
import { DbTeam, DbUser } from "../../storage/types";
import { ListTeamsQuery } from "./team.schemas";

export class TeamService {
  private teamRepository: TeamRepository;
  private userRepository: UserRepository;

  constructor() {
    this.teamRepository = new TeamRepository();
    this.userRepository = new UserRepository();
  }

  async createTeam(data: TeamCreateInput): Promise<DbTeam> {
    const newTeam = await this.teamRepository.create({
      name: data.name,
      description: data.description,
      memberIds: [],
    });

    if (data.memberIds && data.memberIds.length > 0) {
      for (const userId of data.memberIds) {
        await this.addMemberToTeam(newTeam.id, userId);
      }

      const updatedTeam = await this.teamRepository.findById(newTeam.id);
      return updatedTeam!;
    }

    return newTeam;
  }

  async getTeamById(
    id: string
  ): Promise<(DbTeam & { members: DbUser[] }) | null> {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      return null;
    }
    const members: DbUser[] = [];
    for (const memberId of team.memberIds) {
      const user = await this.userRepository.findById(memberId);
      if (user) {
        const { tempPassword: _omitted, ...userData } = user;
        members.push(userData);
      } else {
        console.warn(
          `User with ID ${memberId} not found but listed in team ${id}`
        );
      }
    }
    return { ...team, members };
  }

  async listTeams(query: ListTeamsQuery): Promise<{
    teams: (Omit<DbTeam, "memberIds"> & { memberCount: number })[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { teams, total } = await this.teamRepository.findAll({
      page: query.page!,
      limit: query.limit!,
    });

    const teamsWithCount = teams.map((team) => {
      const { memberIds, ...restOfTeam } = team;
      return { ...restOfTeam, memberCount: memberIds.length };
    });

    return {
      teams: teamsWithCount,
      total,
      page: query.page!,
      limit: query.limit!,
    };
  }

  async updateTeam(id: string, data: TeamUpdateInput): Promise<DbTeam | null> {
    const updatedTeam = await this.teamRepository.update(id, data);
    return updatedTeam;
  }

  async addMemberToTeam(teamId: string, userId: string): Promise<boolean> {
    const userExists = await this.userRepository.findById(userId);
    const teamExists = await this.teamRepository.findById(teamId);
    if (!userExists || !teamExists) {
      return false;
    }

    const addedToTeam = await this.teamRepository.addMember(teamId, userId);
    const addedToUser = await this.userRepository.addUserToTeam(userId, teamId);

    if (!addedToTeam || !addedToUser) {
      if (addedToTeam) await this.teamRepository.removeMember(teamId, userId);
      if (addedToUser)
        await this.userRepository.removeUserFromTeam(userId, teamId);
      return false;
    }

    return true;
  }

  async removeMemberFromTeam(teamId: string, userId: string): Promise<boolean> {
    const removedFromTeam = await this.teamRepository.removeMember(
      teamId,
      userId
    );
    const removedFromUser = await this.userRepository.removeUserFromTeam(
      userId,
      teamId
    );

    const success = removedFromTeam || removedFromUser;
    return success;
  }
}
