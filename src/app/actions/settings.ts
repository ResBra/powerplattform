"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGlobalSettings() {
  try {
    let settings = await prisma.globalSettings.findUnique({
      where: { id: "global" }
    });

    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: { id: "global" }
      });
    }

    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
}

export async function updateGlobalSettings(formData: FormData) {
  try {
    const data = {
      phone: formData.get("phone") as string,
      emergencyPhone: formData.get("emergencyPhone") as string,
      email: formData.get("email") as string,
      whatsapp: formData.get("whatsapp") as string,
      instagram: formData.get("instagram") as string,
      facebook: formData.get("facebook") as string,
      address: formData.get("address") as string,
      smtpHost: formData.get("smtpHost") as string,
      smtpPort: parseInt(formData.get("smtpPort") as string) || 465,
      smtpUser: formData.get("smtpUser") as string,
      smtpPassword: formData.get("smtpPassword") as string,
    };

    await prisma.globalSettings.upsert({
      where: { id: "global" },
      update: data,
      create: { id: "global", ...data }
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/objektservice");
    revalidatePath("/immobilien");
    
    return { success: true, message: "Einstellungen erfolgreich gespeichert!" };
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return { success: false, message: `Fehler: ${error.message}` };
  }
}
