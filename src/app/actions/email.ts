"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/upload";

export async function getEmailTemplate() {
  try {
    let template = await prisma.emailTemplate.findUnique({
      where: { id: "confirmation" }
    });

    if (!template) {
      template = await prisma.emailTemplate.create({
        data: { id: "confirmation" }
      });
    }

    return template;
  } catch (error) {
    return null;
  }
}

export async function updateEmailTemplate(formData: FormData) {
  try {
    const subject = formData.get("subject") as string;
    const content = formData.get("content") as string;
    const bannerFile = formData.get("banner") as File;

    const data: any = { subject, content };

    if (bannerFile && bannerFile.size > 0) {
      const bannerUrl = await uploadFile(bannerFile, "email");
      data.bannerUrl = bannerUrl;
    }

    await prisma.emailTemplate.upsert({
      where: { id: "confirmation" },
      update: data,
      create: { id: "confirmation", ...data }
    });

    revalidatePath("/admin/email");
    return { success: true, message: "E-Mail Vorlage erfolgreich gespeichert!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
