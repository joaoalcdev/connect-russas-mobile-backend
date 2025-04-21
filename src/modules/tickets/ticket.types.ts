import {
  TicketStatus as PrismaTicketStatus,
  TicketPriority as PrismaTicketPriority,
} from "@prisma/client";

export type TicketStatus = PrismaTicketStatus;
export type TicketPriority = PrismaTicketPriority;

export interface TicketCreateInput {
  title: string;
  description: string;
  category: string;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  priority?: TicketPriority;
  requesterId?: string;
}

export interface TicketUpdateInput {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  assignedTeamId?: string | null;
}

export interface TicketListFilters {
  status?: TicketStatus;
  category?: string;
  location?: string;
  priority?: TicketPriority;
  assignedTeamId?: string;
}

export interface TicketListSort {
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "priority"
    | "status"
    | "title"
    | "category"
    | "address";
  sortOrder?: "asc" | "desc";
}
