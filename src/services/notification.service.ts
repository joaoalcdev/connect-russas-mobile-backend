import {sendEmail} from "./email.service";

interface TicketDetails {
    title: string;
    description: string;
    assignedTo: string;
}

export async function sendTicketNotificationEmail(
    teamMembers: string[],
    ticketDetails: TicketDetails
): Promise<void> {
    const subject = "Novo chamado atribuído: ${ticketDetails.title}";
    const textBody = `
        Olá,
        
        Um novo chamado foi atribuído a sua equipe.
        
        Detalhes do chamado:
        - Título: ${ticketDetails.title}
        - Descrição: ${ticketDetails.description}
        - Atribuído a: ${ticketDetails.assignedTo}
        
        Por favor, acesse o sistema para mais detalhes.

        **Esta é uma mensafem automática.**
        **Por favor, não responda a este e-mail.**
        `;
    
    for (const member of teamMembers) {
        await sendEmail({
            to: member,
            subject: subject,
            text: textBody,
        });
    }
}