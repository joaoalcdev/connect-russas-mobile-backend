import { DbUser } from "@/storage/types";

/**
 * Constrói o corpo em texto plano para o email de confirmação.
 */
export function buildConfirmationEmailText(user: DbUser): string {
  let textBody = `Olá ${user.name},\n\nSua conta no CID Connect está pronta.\n\n`;
  if (user.tempPassword) {
    textBody += `Sua senha temporária é: ${user.tempPassword}\n\n`;
  }
  textBody +=
    "Por favor, faça login e altere sua senha assim que possível.\n\n";
  textBody += "Atenciosamente,\nEquipe CID Connect";
  return textBody;
}


export function buildConfirmationEmailHtml(
  user: DbUser,
  subject: string
): string {
  let tempPasswordSectionHtml = "";
  if (user.tempPassword) {
    tempPasswordSectionHtml = `
      <p style="font-size: 16px; line-height: 1.5; color: #333333; margin-bottom: 15px;">
        Sua senha temporária é: <strong style="font-size: 18px; color: #0056b3;">${user.tempPassword}</strong>
      </p>
      <p style="font-size: 14px; line-height: 1.5; color: #555555; margin-bottom: 25px;">
        Recomendamos fortemente que você altere esta senha após o primeiro login por motivos de segurança.
      </p>
    `;
  }

  // Estilos inline são preferíveis para compatibilidade máxima com clientes de email
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
      body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
      /* Outros estilos globais podem ir aqui, mas use com moderação */
    </style>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <!-- Header -->
            <tr>
              <td style="text-align: center; padding-bottom: 15px; border-bottom: 1px solid #eeeeee;">
                <h1 style="color: #333333; margin: 0; font-size: 24px;">CID Connect</h1>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 25px 0 15px 0;">
                <p style="font-size: 16px; line-height: 1.5; color: #333333; margin: 0 0 15px 0;">
                  Olá ${user.name},
                </p>
                <p style="font-size: 16px; line-height: 1.5; color: #333333; margin: 0 0 15px 0;">
                  Seja bem-vindo(a)! Sua conta no sistema CID Connect foi criada com sucesso.
                </p>
                ${tempPasswordSectionHtml}
                <p style="font-size: 16px; line-height: 1.5; color: #333333; margin: 0 0 15px 0;">
                  Por favor, faça login utilizando seu email e a senha fornecida (se aplicável).
                </p>
                <!-- Opcional: Botão de Login -->
                <!--
                <p style="text-align: center; margin: 25px 0;">
                  <a href="URL_DO_SEU_LOGIN" target="_blank" style="background-color: #007bff; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
                    Acessar Sistema
                  </a>
                </p>
                -->
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="text-align: center; padding-top: 15px; border-top: 1px solid #eeeeee; font-size: 12px; color: #888888;">
                Este é um email automático, por favor não responda.<br>
                &copy; ${new Date().getFullYear()} CID Connect. Todos os direitos reservados.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
