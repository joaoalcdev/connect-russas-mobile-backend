import { FastifyRequest, FastifyReply } from "fastify";
import { TicketService } from "./ticket.service";
import {
  ListTicketsQuery,
  TicketIdParams,
  AssignTeamInput,
  CreateTicketInput,
  UpdateTicketInput,
} from "./ticket.schemas";

export class TicketController {
  private service: TicketService;

  constructor() {
    this.service = new TicketService();
  }

  async listTicketsHandler(
    request: FastifyRequest<{ Querystring: ListTicketsQuery }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.service.listTickets(request.query);
      return reply.code(200).send(result);
    } catch (error: any) {
      request.log.error(error, "Failed to list tickets");
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }

  async getTicketByIdHandler(
    request: FastifyRequest<{ Params: TicketIdParams }>,
    reply: FastifyReply
  ) {
    try {
      const ticket = await this.service.getTicketById(request.params.ticketId);
      if (!ticket) {
        return reply.code(404).send({ message: "Ticket not found" });
      }
      return reply.code(200).send(ticket);
    } catch (error: any) {
      request.log.error(error, "Failed to get ticket by ID");
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }

  async assignTeamHandler(
    request: FastifyRequest<{ Params: TicketIdParams; Body: AssignTeamInput }>,
    reply: FastifyReply
  ) {
    try {
      const updatedTicket = await this.service.assignTicketToTeam(
        request.params.ticketId,
        request.body.teamId
      );
      return reply.code(200).send(updatedTicket);
    } catch (error: any) {
      request.log.error(error, "Failed to assign team to ticket");
      if (error.message?.includes("not found")) {
        return reply.code(404).send({ message: error.message });
      }
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }

  async createTicketHandler(
    request: FastifyRequest<{ Body: CreateTicketInput }>,
    reply: FastifyReply
  ) {
    try {
      const newTicket = await this.service.createTicket(request.body);
      return reply.code(201).send(newTicket);
    } catch (error: any) {
      request.log.error(error, "Failed to create ticket");
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }

  async updateTicketHandler(
    request: FastifyRequest<{
      Params: TicketIdParams;
      Body: UpdateTicketInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const updatedTicket = await this.service.updateTicket(
        request.params.ticketId,
        request.body
      );
      if (!updatedTicket) {
        return reply.code(404).send({ message: "Ticket not found" });
      }
      return reply.code(200).send(updatedTicket);
    } catch (error: any) {
      request.log.error(error, "Failed to update ticket");
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }
}
