import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface WaitlistEmailParams {
  to: string;
  name: string;
  position: number;
  referralCode: string;
  locale: string;
}

export async function sendWaitlistConfirmation({
  to,
  name,
  position,
  referralCode,
  locale,
}: WaitlistEmailParams) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return null;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://borarodar.app";
  const referralLink = `${appUrl}/${locale}?ref=${referralCode}`;

  const subjects: Record<string, string> = {
    "pt-BR": `Bora Rodar — Voce e o #${position} na fila!`,
    en: `Bora Rodar — You are #${position} in line!`,
    es: `Bora Rodar — Eres el #${position} en la fila!`,
  };

  const { data, error } = await resend.emails.send({
    from: "Bora Rodar <noreply@borarodar.app>",
    to,
    subject: subjects[locale] || subjects["pt-BR"],
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#FAFAF7;font-family:'Inter',Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
          <div style="background:linear-gradient(135deg,#183D30 0%,#205040 50%,#2A6B55 100%);border-radius:16px;padding:40px;text-align:center;margin-bottom:24px;">
            <h1 style="color:#F5E8CC;font-size:28px;margin:0 0 8px;">Bora Rodar</h1>
            <p style="color:#ECD5AB;font-size:16px;margin:0;">Seu companheiro de estrada</p>
          </div>
          <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <h2 style="color:#1A1A1A;font-size:24px;margin:0 0 16px;">
              ${locale === "es" ? "Hola" : locale === "en" ? "Hey" : "E ai"}, ${name}!
            </h2>
            <p style="color:#5A5A5A;font-size:16px;line-height:1.6;margin:0 0 24px;">
              ${locale === "es" ? `Eres el <strong style="color:#205040;font-size:20px;">#${position}</strong> en la fila.` : locale === "en" ? `You are <strong style="color:#205040;font-size:20px;">#${position}</strong> in line.` : `Voce e o <strong style="color:#205040;font-size:20px;">#${position}</strong> na fila.`}
            </p>
            <div style="background:#F2F0EB;border-radius:12px;padding:20px;margin-bottom:24px;">
              <p style="color:#5A5A5A;font-size:14px;margin:0 0 8px;">
                ${locale === "es" ? "Comparte tu link para subir en la fila:" : locale === "en" ? "Share your link to move up in line:" : "Compartilhe seu link para subir na fila:"}
              </p>
              <a href="${referralLink}" style="color:#205040;font-size:14px;word-break:break-all;">
                ${referralLink}
              </a>
            </div>
            <p style="color:#A09060;font-size:14px;margin:0;">
              ${locale === "es" ? "Cada amigo = +1 posicion en la fila" : locale === "en" ? "Each friend = +1 spot in line" : "Cada amigo = +1 posicao na fila"}
            </p>
          </div>
          <p style="color:#5A5A5A;font-size:12px;text-align:center;margin-top:24px;">
            &copy; 2026 Bora Rodar. ${locale === "es" ? "Hecho con" : locale === "en" ? "Made with" : "Feito com"} &#x1F3CD;&#xFE0F; ${locale === "es" ? "en Brasil" : locale === "en" ? "in Brazil" : "no Brasil"}.
          </p>
        </div>
      </body>
      </html>
    `,
  });

  if (error) {
    console.error("Failed to send email:", error);
    return null;
  }

  return data;
}
