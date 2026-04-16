"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/upload";

export async function createTeamMember(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const position = formData.get("position") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const imageFile = formData.get("image") as File;
    const isManager = formData.get("isManager") === "on";
    const order = parseInt(formData.get("order") as string || "0");

    const bio = formData.get("bio") as string;

    let imageUrl = "/team/default.jpg";
    if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === 'function') {
      imageUrl = await uploadFile(imageFile, "team");
    }

    await prisma.teamMember.create({
      data: { name, position, phone, email, image: imageUrl, bio, isManager, order },
    });

    revalidatePath("/");
    revalidatePath("/admin/team");
    return { success: true, message: "Mitarbeiter erfolgreich hinzugefügt!" };
  } catch (error: any) {
    console.error("Error creating team member:", error);
    return { success: false, message: `Fehler beim Erstellen: ${error.message}` };
  }
}

export async function deleteTeamMember(id: string) {
  try {
    await prisma.teamMember.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/team");
    return { success: true, message: "Mitarbeiter entfernt." };
  } catch (error) {
    return { success: false, message: "Löschen fehlgeschlagen." };
  }
}
export async function updateTeamMember(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const position = formData.get("position") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const imageFile = formData.get("image") as File;
    const isManager = formData.get("isManager") === "on";
    const order = parseInt(formData.get("order") as string || "0");

    const bio = formData.get("bio") as string;

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    let imageUrl = existing?.image || "/team/default.jpg";

    if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === 'function') {
      imageUrl = await uploadFile(imageFile, "team");
    }

    await prisma.teamMember.update({
      where: { id },
      data: { name, position, phone, email, image: imageUrl, bio, isManager, order },
    });

    revalidatePath("/");
    revalidatePath("/admin/team");
    return { success: true, message: "Mitarbeiter aktualisiert!" };
  } catch (error: any) {
    console.error("Error updating team member:", error);
    return { success: false, message: `Fehler beim Aktualisieren: ${error.message}` };
  }
}
