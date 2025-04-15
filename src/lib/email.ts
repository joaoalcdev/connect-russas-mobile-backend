import { DbUser } from "@/storage/types";
import { sendConfirmationEmailService } from "../services/email.service"; // Importa o serviço real

export async function sendConfirmationEmail(user: DbUser): Promise<void> {
  try {
    // Chama o serviço de email real
    await sendConfirmationEmailService(user);
    console.log(`Confirmation email successfully requested for ${user.email}`);
  } catch (error) {
    // Log o erro ou trate-o como apropriado para sua aplicação
    console.error(`Failed to send confirmation email to ${user.email}:`, error);
    // Você pode querer relançar o erro ou retornar um status específico
    // dependendo de como esta função é chamada.
    // throw error; // Descomente se quiser propagar o erro
  }
}
