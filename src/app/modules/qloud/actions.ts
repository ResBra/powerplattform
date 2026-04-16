"use server";

import fs from "fs/promises";
import path from "path";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  deleteDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

export async function saveMediaMetadataAction(data: { url: string, groupId: string, userId: string, userName: string }) {
  console.log("💾 SPEICHERE CLOUD-METADATEN:", data.url.slice(0, 30) + "...");

  if (!data.url || !data.groupId) return { success: false, error: "Fehlende Daten" };

  try {
    // Save metadata to Firestore (Real-time works!)
    await addDoc(collection(db, "groups", data.groupId, "media"), {
      url: data.url,
      userId: data.userId,
      userName: data.userName,
      status: "PENDING",
      uploadedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error: any) {
    console.error("⛔ METADATA ERROR:", error);
    return { success: false, error: error.message || "Fehler beim Speichern der Metadaten" };
  }
}

export async function createGroup(data: { name: string, description?: string, adminId: string }) {
  try {
    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        adminId: data.adminId,
        members: {
          create: {
            userId: data.adminId,
            role: "ADMIN"
          }
        }
      }
    });

    revalidatePath("/modules/qloud");
    return { success: true, groupId: group.id };
  } catch (error) {
    console.error("Failed to create group:", error);
    return { success: false, error: "Datenbankfehler beim Erstellen der Gruppe." };
  }
}

export async function getGroupsForUser(userId: string) {
  return await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId: userId
        }
      }
    },
    include: {
      _count: {
        select: { members: true }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getGroupDetails(id: string) {
  return await prisma.group.findUnique({
    where: { id },
    include: { members: true }
  });
}

export async function deleteGroup(id: string, userId: string) {
  const group = await prisma.group.findUnique({ where: { id } });
  if (!group || group.adminId !== userId) return { error: "Nicht autorisiert" };

  await prisma.group.delete({ where: { id } });
  return { success: true };
}
