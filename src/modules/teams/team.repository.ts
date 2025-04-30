import { teams } from "../../storage";
import { DbTeam } from "../../storage/types";
import { TeamCreateInput, TeamUpdateInput } from "./team.types";

export class TeamRepository {
  async create(data: TeamCreateInput): Promise<DbTeam> {
    const now = new Date();
    const newTeam: DbTeam = {
      id: '123',
      name: data.name,
      description: data.description ?? "",
      memberIds: data.memberIds ?? [],
      createdAt: now,
      updatedAt: now,
    };

    teams.set(newTeam.id, newTeam);
    return { ...newTeam };
  }

  async findById(id: string): Promise<DbTeam | null> {
    const team = teams.get(id);
    return team ? { ...team } : null;
  }

  async findAll(options: {
    page: number;
    limit: number;
  }): Promise<{ teams: DbTeam[]; total: number }> {
    const allTeams = Array.from(teams.values());
    const total = allTeams.length;

    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedTeams = allTeams.slice(startIndex, endIndex);

    return { teams: paginatedTeams.map((t) => ({ ...t })), total };
  }

  async update(id: string, data: TeamUpdateInput): Promise<DbTeam | null> {
    const existingTeam = teams.get(id);
    if (!existingTeam) {
      return null;
    }

    const updatedTeam: DbTeam = {
      ...existingTeam,
      ...data,
      updatedAt: new Date(),
    };

    teams.set(id, updatedTeam);
    return { ...updatedTeam };
  }

  async delete(id: string): Promise<boolean> {
    const deleted = teams.delete(id);
    return deleted;
  }

  async addMember(teamId: string, userId: string): Promise<boolean> {
    const team = teams.get(teamId);
    if (!team || team.memberIds.includes(userId)) {
      return false;
    }
    team.memberIds.push(userId);
    team.updatedAt = new Date();
    teams.set(teamId, team);
    return true;
  }

  async removeMember(teamId: string, userId: string): Promise<boolean> {
    const team = teams.get(teamId);
    if (!team) {
      return false;
    }
    const initialLength = team.memberIds.length;
    team.memberIds = team.memberIds.filter((id) => id !== userId);
    if (team.memberIds.length < initialLength) {
      team.updatedAt = new Date();
      teams.set(teamId, team);
      return true;
    }
    return false;
  }
}
