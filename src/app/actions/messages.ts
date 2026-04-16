"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteMessage(id: string) {
  try {
    await prisma.contactRequest.delete({
      where: { id }
    });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function markAsRead(id: string) {
  try {
    await prisma.contactRequest.update({
      where: { id },
      data: { status: "GELESEN" }
    });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
