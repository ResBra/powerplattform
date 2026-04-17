"use server";

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
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { revalidatePath } from "next/cache";

/**
 * Speichert Metadaten für hochgeladene Medien in einer Gruppe.
 */
export async function saveMediaMetadataAction(data: { url: string, groupId: string, userId: string, userName: string }) {
  console.log("💾 SPEICHERE CLOUD-METADATEN:", data.url.slice(0, 30) + "...");

  if (!data.url || !data.groupId) return { success: false, error: "Fehlende Daten" };

  try {
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

/**
 * Erstellt eine neue Gruppe in Firestore.
 */
export async function createGroup(data: { name: string, description?: string, adminId: string }) {
  try {
    const groupRef = await addDoc(collection(db, "groups"), {
      name: data.name,
      description: data.description || "",
      adminId: data.adminId,
      memberIds: [data.adminId], // Wichtig für die schnelle Abfrage "getGroupsForUser"
      memberCount: 1,           // Cache für die UI
      createdAt: serverTimestamp()
    });

    revalidatePath("/modules/qloud");
    return { success: true, groupId: groupRef.id };
  } catch (error: any) {
    console.error("Failed to create group:", error);
    return { success: false, error: "Firebase Fehler beim Erstellen der Gruppe." };
  }
}

/**
 * Holt alle Gruppen, in denen ein User Mitglied ist.
 */
export async function getGroupsForUser(userId: string) {
  try {
    const q = query(
      collection(db, "groups"), 
      where("memberIds", "array-contains", userId)
    );
    
    const snapshot = await getDocs(q);
    
    // Wir mappen die Firestore-Daten auf das Format, das die UI erwartet
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        adminId: data.adminId,
        _count: {
          members: data.memberCount || 1
        }
      };
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
}

/**
 * Holt Details einer einzelnen Gruppe.
 */
export async function getGroupDetails(id: string) {
  try {
    const docRef = doc(db, "groups", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      // Fallback für UI-Kompatibilität
      members: data.memberIds?.map((m: string) => ({ userId: m })) || []
    };
  } catch (error) {
    console.error("Error fetching group details:", error);
    return null;
  }
}

/**
 * Löscht eine Gruppe (nur für Admins).
 */
export async function deleteGroup(id: string, userId: string) {
  try {
    const docRef = doc(db, "groups", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return { error: "Gruppe nicht gefunden" };
    if (docSnap.data().adminId !== userId) return { error: "Nicht autorisiert" };

    await deleteDoc(docRef);
    revalidatePath("/modules/qloud");
    return { success: true };
  } catch (error) {
    console.error("Error deleting group:", error);
    return { error: "Firebase Fehler beim Löschen." };
  }
}
