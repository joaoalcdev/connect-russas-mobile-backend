import { TicketRepository } from "./ticket.repository";
import { TicketCreateInput, TicketUpdateInput } from "./ticket.types";
import { Ticket } from "@prisma/client";
import {
  ListTicketsQuery,
  TicketResponse,
  TicketSummary,
} from "./ticket.schemas";

function toTicketResponse(ticket: Ticket): TicketResponse {
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    category: ticket.category,
    address: ticket.address,
    latitude: ticket.latitude ?? undefined,
    longitude: ticket.longitude ?? undefined,
    status: ticket.status,
    priority: ticket.priority,
    requesterId: ticket.requesterId ?? undefined,
    assignedTeamId: ticket.assignedTeamId,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    resolvedAt: ticket.resolvedAt ? ticket.resolvedAt.toISOString() : null,
  };
}

function toTicketSummary(ticket: Ticket): TicketSummary {
  return {
    id: ticket.id,
    title: ticket.title,
    status: ticket.status,
    location: {
      address: ticket.address,
    },
  };
}

export class TicketService {
  private repository: TicketRepository;

  constructor() {
    this.repository = new TicketRepository();
  }

  async createTicket(data: TicketCreateInput): Promise<TicketResponse> {
    const newTicket = await this.repository.create(data);

    return toTicketResponse(newTicket);
  }

  async getTicketById(id: string): Promise<TicketResponse | null> {
    const ticket = await this.repository.findById(id);
    if (!ticket) {
      return null;
    }
    return toTicketResponse(ticket);
  }

  async listTickets(query: ListTicketsQuery): Promise<{
    tickets: (TicketResponse | TicketSummary)[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      recent,
      sortBy,
      sortOrder,
      ...filters
    } = query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const effectiveLimit = recent ? 5 : limitNum;

    const { tickets: prismaTickets, total } = await this.repository.findAll({
      page: pageNum,
      limit: effectiveLimit,
      filters,
      sort: { sortBy, sortOrder },
    });

    let responseTickets: (TicketResponse | TicketSummary)[];

    if (recent) {
      responseTickets = prismaTickets.map(toTicketSummary);
    } else {
      responseTickets = prismaTickets.map(toTicketResponse);
    }

    return {
      tickets: responseTickets,
      total,
      page: pageNum,
      limit: effectiveLimit,
    };
  }

  async updateTicket(
    id: string,
    data: TicketUpdateInput
  ): Promise<TicketResponse | null> {
    const updatedTicket = await this.repository.update(id, data);
    if (!updatedTicket) {
      return null;
    }
    return toTicketResponse(updatedTicket);
  }

  async assignTicketToTeam(
    ticketId: string,
    teamId: string
  ): Promise<TicketResponse | null> {
    const ticket = await this.repository.findById(ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const team = await this.repository.findTeamById(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    const updatedTicket = await this.repository.update(ticketId, {
      assignedTeamId: teamId,
      status: "EM_ANDAMENTO",
    });

    if (!updatedTicket) {
      throw new Error("Failed to update ticket after finding it.");
    }

    return toTicketResponse(updatedTicket);
  }

  async deleteTicket(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
