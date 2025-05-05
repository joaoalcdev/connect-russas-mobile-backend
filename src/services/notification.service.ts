import {sendMail} from "./email.service";

interface TicketDetails {
    title: string;
    description: string;
    assignedTo: string;
}

export async function sendTicketNotificationEmail(
    teamMembers: string[],
    ticketDetails: TicketDetails
): Promise<void> {
    const subject = `Novo chamado atribuído: ${ticketDetails.title}`;
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
        await sendMail({
            to: member,
            subject: subject,
            text: textBody,
            html: `<p>Olá,</p>
                   <p>Um novo chamado foi atribuído a sua equipe.</p>
                   <p>Detalhes do chamado:</p>
                   <ul>
                       <li><strong>Título:</strong> ${ticketDetails.title}</li>
                       <li><strong>Descrição:</strong> ${ticketDetails.description}</li>
                       <li><strong>Atribuído a:</strong> ${ticketDetails.assignedTo}</li>
                   </ul>
                   <p>Por favor, acesse o sistema para mais detalhes.</p>
                   <p><em>**Esta é uma mensagem automática.**</em></p>
                   <p><em>**Por favor, não responda a este e-mail.**</em></p>`,
        });
    }
}