import {
  Prisma,
  PrismaClient,
  Ticket,
  TicketPriority,
  TicketStatus,
  User } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  TicketCreateInput,
  TicketUpdateInput,
  TicketListFilters,
  TicketListSort,
} from "./ticket.types";

export class TicketRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: TicketCreateInput): Promise<Ticket> {
    const newTicket = await this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        address: data.location.address,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        priority: data.priority ?? "MEDIA",
        status: "PENDENTE",
      },
    });
    return newTicket;
  }

  async findById(id: string): Promise<Ticket | null> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });
    return ticket;
  }

  async findAll(options: {
    page: number;
    limit: number;
    filters?: TicketListFilters;
    sort?: TicketListSort;
  }): Promise<{ tickets: Ticket[]; total: number }> {
    const { page, limit, filters = {}, sort = {} } = options;
    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.TicketWhereInput = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.assignedTeamId) {
      where.assignedTeamId = filters.assignedTeamId;
    }
    if (filters.category) {
      where.category = { contains: filters.category, mode: "insensitive" };
    }
    if (filters.location) {
      where.address = { contains: filters.location, mode: "insensitive" };
    }

    const orderBy: Prisma.TicketOrderByWithRelationInput = {};
    const { sortBy = "createdAt", sortOrder = "desc" } = sort;

    orderBy[sortBy] = sortOrder;

    const [tickets, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return { tickets, total };
  }

  async update(id: string, data: TicketUpdateInput): Promise<Ticket | null> {
    try {
      const { location, ...restData } = data;

      const updateData: Prisma.TicketUpdateInput = {
        ...restData,

        ...(location && {
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
        }),

        ...(restData.status === "RESOLVIDO" && { resolvedAt: new Date() }),
        ...(restData.status &&
          restData.status !== "RESOLVIDO" && { resolvedAt: null }),
      };

      Object.keys(updateData).forEach(
        (key) =>
          updateData[key as keyof typeof updateData] === undefined &&
          delete updateData[key as keyof typeof updateData]
      );

      const updatedTicket = await this.prisma.ticket.update({
        where: { id },
        data: updateData,
      });
      return updatedTicket;
    } catch (error: any) {
      if (        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return null;
      }

      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.ticket.delete({
        where: { id },
      });
      return true;
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return false;
      }

      throw error;
    }
  }

  async findTeamById(teamId: string): Promise<{ id: string } | null> {
    return this.prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true },
    });
  }

  async findTeamMembers(teamId: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { id : teamId },
    });
  }
  
}
