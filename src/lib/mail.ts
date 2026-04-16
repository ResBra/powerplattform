import nodemailer from "nodemailer";
import { prisma } from "./prisma";

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const settings = await prisma.globalSettings.findUnique({
      where: { id: "global" }
    });

    if (!settings || !settings.smtpHost || !settings.smtpUser) {
      console.warn("SMTP settings missing or incomplete. Using environment variables as fallback.");
    }

    const transporter = nodemailer.createTransport({
      host: settings?.smtpHost || process.env.SMTP_HOST,
      port: settings?.smtpPort || parseInt(process.env.SMTP_PORT || "587"),
      secure: (settings?.smtpPort === 465) || (process.env.SMTP_SECURE === "true"),
      auth: {
        user: settings?.smtpUser || process.env.SMTP_USER,
        pass: settings?.smtpPassword || process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // Often needed for Strato/HostEurope etc.
      }
    });

    const info = await transporter.sendMail({
      from: `"Power Platform Immobilien" <${settings?.smtpUser || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    
    console.log("Email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false };
  }
}
