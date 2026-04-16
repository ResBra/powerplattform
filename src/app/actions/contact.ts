"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendMail } from "@/lib/mail";
import { getNotificationTemplate } from "@/lib/mailTemplates";
import { headers } from "next/headers";

export async function submitContactForm(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    // --- SECURITY LAYER 1: Honeypot ---
    const honeypot = formData.get("hp_field") as string;
    if (honeypot) {
      return { success: false, message: "Spam-Schutz aktiviert (Layer 1)." };
    }

    // --- SECURITY LAYER 2: Time-Lock (< 3 seconds) ---
    const formToken = formData.get("form_token") as string;
    const submissionTime = Date.now();
    const renderTime = parseInt(formToken || "0");
    if (submissionTime - renderTime < 3000) {
      return { success: false, message: "Spam-Schutz aktiviert (Layer 2)." };
    }

    // --- SECURITY LAYER 4: Simple Rate Limiting (per IP) ---
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "unknown";
    
    // 1. Save to Database
    const contactRequest = await prisma.contactRequest.create({
      data: {
        name,
        email,
        phone,
        message: `[Betreff: ${subject}] \n\n ${message}`,
        status: "NEU",
      },
    });

    // 2. Send Emails
    const settings = await prisma.globalSettings.findUnique({ where: { id: "global" } });
    const adminEmail = settings?.email || "info@power-app.local";

    console.log("MAIL_LOG: Preparing to send emails...");

    // A. Notification to Admin
    const adminMailResult = await sendMail({
      to: adminEmail,
      subject: `Neue Kontaktanfrage: ${subject}`,
      html: getNotificationTemplate({ name, email, phone, message }),
    });
    console.log(`MAIL_LOG: Admin notification sent: ${adminMailResult.success}`);

    // Small delay to ensure the SMTP server (like Strato) doesn't block the second connection immediately
    await new Promise(resolve => setTimeout(resolve, 1000));

    // B. Confirmation to User (Dynamic Template)
    const template = await prisma.emailTemplate.findUnique({ where: { id: "confirmation" } });
    
    // Ensure absolute URL for images (important for emails)
    let bannerUrl = template?.bannerUrl;
    if (bannerUrl && !bannerUrl.startsWith('http')) {
      const host = headerList.get("host") || "power-app.local";
      const protocol = host.includes('localhost') ? 'http' : 'https';
      bannerUrl = `${protocol}://${host}${bannerUrl}`;
    }

    const bannerHtml = bannerUrl 
      ? `<div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
           <img src="${bannerUrl}" alt="Power Platform Immobilien" width="600" style="display: block; margin: 0 auto; max-width: 100%; height: auto; border-radius: 8px;" />
         </div>` 
      : "";

    const userHtml = `
      <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #00000005;">
        ${template?.content || "<h1>Vielen Dank!</h1><p>Wir haben Ihre Nachricht erhalten.</p>"}
        ${bannerHtml}
        <p style="font-size: 10px; color: #999; margin-top: 40px;">Dies ist eine automatisch generierte Nachricht von Power Platform Team.</p>
      </div>
    `;

    const userMailResult = await sendMail({
      to: email,
      subject: template?.subject || "Bestätigung: Ihre Nachricht an Power Platform Immo",
      html: userHtml,
    });
    console.log(`MAIL_LOG: User confirmation sent to ${email}: ${userMailResult.success}`);

    revalidatePath("/admin");
    revalidatePath("/admin/messages");
    
    return { 
      success: true, 
      message: "Anfrage erfolgreich gesendet! Wir haben Ihnen eine Bestätigung per E-Mail geschickt." 
    };
  } catch (error) {
    console.error("Kontaktformular Fehler:", error);
    return { success: false, message: "Es gab ein Problem beim Senden. Bitte versuchen Sie es später erneut." };
  }
}
