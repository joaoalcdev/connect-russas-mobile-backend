import nodemailer from "nodemailer";
import { DbUser } from "@/storage/types";
import {
  buildConfirmationEmailText,
  buildConfirmationEmailHtml,
} from "./email-templates";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

async function sendMail({
  to,
  subject,
  text,
  html,
}: MailOptions): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: `"CID Connect" <${
        process.env.EMAIL_FROM || process.env.EMAIL_USER
      }>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error(
      "Error sending email:",
      error instanceof Error ? error.message : error,
      {
        code: (error as any).code,
        command: (error as any).command,
        recipient: to,
      }
    );
    throw new Error(`Failed to send email to ${to}`);
  }
}

export async function sendConfirmationEmailService(
  user: DbUser
): Promise<void> {
  const subject = "Bem-vindo ao CID Connect!";
  const textBody = buildConfirmationEmailText(user);
  const htmlBody = buildConfirmationEmailHtml(user, subject);

  await sendMail({
    to: user.email,
    subject: subject,
    text: textBody,
    html: htmlBody,
  });
}
