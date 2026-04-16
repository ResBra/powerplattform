"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";

export async function getUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function createUser(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) return { success: false, message: "Nicht autorisiert." };

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("passwordConfirm") as string;

    if (password !== passwordConfirm) {
      return { success: false, message: "Passwörter stimmen nicht überein." };
    }

    if (password.length < 8) {
      return { success: false, message: "Passwort muss mindestens 8 Zeichen lang sein." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return { success: false, message: "Benutzername bereits vergeben." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        passwordHash
      }
    });

    revalidatePath("/admin/users");
    return { success: true, message: "Benutzer erfolgreich erstellt." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, message: "Nicht autorisiert." };

    // Prevent self-deletion
    if (session.userId === id) {
      return { success: false, message: "Sie können sich nicht selbst löschen." };
    }

    // Check how many users are left (don't delete the last one)
    const userCount = await prisma.user.count();
    if (userCount <= 1) {
      return { success: false, message: "Der letzte Admin kann nicht gelöscht werden." };
    }

    await prisma.user.delete({
      where: { id }
    });

    revalidatePath("/admin/users");
    return { success: true, message: "Benutzer gelöscht." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function changePassword(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) return { success: false, message: "Nicht autorisiert." };

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      return { success: false, message: "Neue Passwörter stimmen nicht überein." };
    }

    if (newPassword.length < 8) {
      return { success: false, message: "Passwort muss mindestens 8 Zeichen lang sein." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });

    if (!user) return { success: false, message: "Benutzer nicht gefunden." };

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return { success: false, message: "Aktuelles Passwort ist falsch." };
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash: newHash }
    });

    return { success: true, message: "Passwort erfolgreich geändert." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
