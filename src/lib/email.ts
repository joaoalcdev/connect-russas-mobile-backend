import { DbUser } from "../storage/types";
import { sendConfirmationEmailService } from "../services/email.service";

export async function sendConfirmationEmail(user: DbUser): Promise<void> {
  try {
    await sendConfirmationEmailService(user);
  } catch (error) {
    console.error(
      `Failed to request confirmation email for ${user.email}:`,
      error
    );
  }
}
