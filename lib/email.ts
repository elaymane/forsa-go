import "server-only";
import { Resend } from "resend";

const FROM_ADDRESS = process.env.EMAIL_FROM || "Forsa Go <onboarding@resend.dev>";

/**
 * Sends a plain transactional email via Resend. Returns whether it actually
 * sent — never throws, since a failed email shouldn't crash the request
 * (the caller decides how to handle a failure, e.g. showing an error).
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set — cannot send email. See .env.example.");
    return false;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
}
