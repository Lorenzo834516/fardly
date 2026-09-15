import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const data = await resend.emails.send({
      from: 'Fardly <onboarding@resend.dev>', // Dominio de prueba mientras verificas el tuyo
      to: [to],
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error enviando correo:', error);
    return { success: false, error };
  }
}