import { UserRole } from "../modules/users/user.types";
import { TicketPriority, TicketStatus } from "../modules/tickets/ticket.types";

export interface DbUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tempPassword?: string;
  isActive: boolean;
  teamIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DbTeam {
  id: string;
  name: string;
  description: string;
  memberIds: string[];

  createdAt: Date;
  updatedAt: Date;
}

export interface DbTicket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  requesterId?: string;
  assignedTeamId?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}
