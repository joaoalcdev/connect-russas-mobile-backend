import { TicketService } from "@/modules/tickets/ticket.service";
import { TicketRepository } from "@/modules/tickets/ticket.repository";
import { sendTicketNotificationEmail } from "@/services/notification.service";

// filepath: c:\PIO\r\connect-russas-mobile-backend\src\modules\tickets\ticket.service.test.ts

jest.mock("@/modules/tickets/ticket.repository");
jest.mock("@/services/notification.service");

describe("TicketService - assignTicketToTeam", () => {
  let ticketService: TicketService;
  let mockRepository: jest.Mocked<TicketRepository>;

  beforeEach(() => {
    mockRepository = new TicketRepository() as jest.Mocked<TicketRepository>;
    ticketService = new TicketService();
    (ticketService as any).repository = mockRepository;
  });

  it("should assign a ticket to a team and send notification emails", async () => {
    const ticketId = "ticket123";
    const teamId = "team123";
    const mockTicket = {
      id: ticketId,
      title: "Test Ticket",
      description: "Test Description",
      assignedTeamId: null,
      status: "PENDENTE",
      createdAt: new Date("2025-05-04T10:00:00Z"), // Data válida
      updatedAt: new Date("2025-05-04T10:00:00Z"), // Data válida
    };
    const mockTeam = { id: teamId };
    const mockTeamMembers = [
      { id: "user1", email: "user1@example.com" },
      { id: "user2", email: "user2@example.com" },
    ];
    const updatedTicket = {
      ...mockTicket,
      assignedTeamId: teamId,
      status: "EM_ANDAMENTO",
      updatedAt: new Date("2025-05-04T12:00:00Z"), // Atualização simulada
    };

    mockRepository.findById.mockResolvedValue(mockTicket as any);
    mockRepository.findTeamById.mockResolvedValue(mockTeam as any);
    mockRepository.findTeamMembers.mockResolvedValue(mockTeamMembers as any);
    mockRepository.update.mockResolvedValue(updatedTicket as any);
    (sendTicketNotificationEmail as jest.Mock).mockResolvedValue(undefined);

    const result = await ticketService.assignTicketToTeam(ticketId, teamId);

    expect(mockRepository.findById).toHaveBeenCalledWith(ticketId);
    expect(mockRepository.findTeamById).toHaveBeenCalledWith(teamId);
    expect(mockRepository.findTeamMembers).toHaveBeenCalledWith(teamId);
    expect(mockRepository.update).toHaveBeenCalledWith(ticketId, { assignedTeamId: teamId, status: "EM_ANDAMENTO" });
    expect(sendTicketNotificationEmail).toHaveBeenCalledWith(
      ["user1@example.com", "user2@example.com"],
      { title: "Test Ticket", description: "Test Description", assignedTo: teamId }
    );
    expect(result).toEqual({
      id: ticketId,
      title: "Test Ticket",
      description: "Test Description",
      category: undefined,
      address: undefined,
      latitude: undefined,
      longitude: undefined,
      status: "EM_ANDAMENTO",
      priority: undefined,
      requesterId: undefined,
      assignedTeamId: teamId,
      createdAt: "2025-05-04T10:00:00.000Z",
      updatedAt: "2025-05-04T12:00:00.000Z",
      resolvedAt: null,
    });
  });

  it("should throw an error if the ticket is not found", async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(ticketService.assignTicketToTeam("invalidTicketId", "team123")).rejects.toThrow("Ticket not found");
    expect(mockRepository.findById).toHaveBeenCalledWith("invalidTicketId");
  });

  it("should throw an error if the team is not found", async () => {
    const ticketId = "ticket123";
    const teamId = "invalidTeamId";
    const mockTicket = { id: ticketId, title: "Test Ticket" };

    mockRepository.findById.mockResolvedValue(mockTicket as any);
    mockRepository.findTeamById.mockResolvedValue(null);

    await expect(ticketService.assignTicketToTeam(ticketId, teamId)).rejects.toThrow("Team not found");
    expect(mockRepository.findById).toHaveBeenCalledWith(ticketId);
    expect(mockRepository.findTeamById).toHaveBeenCalledWith(teamId);
  });

  it("should throw an error if no team members are found", async () => {
    const ticketId = "ticket123";
    const teamId = "team123";
    const mockTicket = { id: ticketId, title: "Test Ticket" };
    const mockTeam = { id: teamId };

    mockRepository.findById.mockResolvedValue(mockTicket as any);
    mockRepository.findTeamById.mockResolvedValue(mockTeam as any);
    mockRepository.findTeamMembers.mockResolvedValue([]);

    await expect(ticketService.assignTicketToTeam(ticketId, teamId)).rejects.toThrow(`No team members found for team ${teamId}`);
    expect(mockRepository.findById).toHaveBeenCalledWith(ticketId);
    expect(mockRepository.findTeamById).toHaveBeenCalledWith(teamId);
    expect(mockRepository.findTeamMembers).toHaveBeenCalledWith(teamId);
  });

  it("should throw an error if updating the ticket fails", async () => {
    const ticketId = "ticket123";
    const teamId = "team123";
    const mockTicket = { id: ticketId, title: "Test Ticket" };
    const mockTeam = { id: teamId };
    const mockTeamMembers = [{ id: "user1", email: "user1@example.com" }];

    mockRepository.findById.mockResolvedValue(mockTicket as any);
    mockRepository.findTeamById.mockResolvedValue(mockTeam as any);
    mockRepository.findTeamMembers.mockResolvedValue(mockTeamMembers as any);
    mockRepository.update.mockResolvedValue(null);

    await expect(ticketService.assignTicketToTeam(ticketId, teamId)).rejects.toThrow("Failed to update ticket after finding it.");
    expect(mockRepository.update).toHaveBeenCalledWith(ticketId, { assignedTeamId: teamId, status: "EM_ANDAMENTO" });
  });
});