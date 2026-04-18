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
  updateDoc,
  setDoc,
  serverTimestamp,
  orderBy,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
  limit
} from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";

/**
 * Durchsucht Gruppen anhand des Namens (Präfix-Suche).
 */
export async function searchGroupsAction(queryText: string) {
  if (!queryText || queryText.length < 2) return [];

  try {
    const q = query(
      collection(db, "groups"),
      where("name", ">=", queryText.toUpperCase()),
      where("name", "<=", queryText.toUpperCase() + "\uf8ff"),
      limit(10)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      name: d.data().name,
      description: d.data().description,
      memberCount: d.data().memberCount || 0
    }));
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
}

/**
 * Erstellt eine Beitrittsanfrage für eine Gruppe.
 */
export async function requestJoinAction(groupId: string, userId: string, userName: string) {
  try {
    const requestRef = doc(db, "groups", groupId, "joinRequests", userId);
    
    await setDoc(requestRef, {
      userId,
      userName,
      status: "PENDING",
      requestedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Ruft alle offenen Beitrittsanfragen einer Gruppe ab.
 */
export async function getPendingRequestsAction(groupId: string) {
  try {
    const q = query(
      collection(db, "groups", groupId, "joinRequests"),
      where("status", "==", "PENDING"),
      orderBy("requestedAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  } catch (error) {
    console.error("Fetch requests error:", error);
    return [];
  }
}

/**
 * Genehmigt oder lehnt eine Beitrittsanfrage ab.
 */
export async function resolveJoinRequestAction(groupId: string, targetUserId: string, targetUserName: string, approve: boolean) {
  try {
    const requestRef = doc(db, "groups", groupId, "joinRequests", targetUserId);
    
    if (approve) {
      // 1. In die Gruppe aufnehmen
      await joinGroupAction(groupId, targetUserId, targetUserName);
    }

    // 2. Anfrage löschen
    await deleteDoc(requestRef);

    revalidatePath(`/modules/qloud/${groupId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Speichert Metadaten für hochgeladene Medien in einer Gruppe.
 */
export async function saveMediaMetadataAction(data: { url: string, groupId: string, userId: string, userName: string }) {
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
export async function createGroup(data: { name: string, description?: string, adminId: string, adminName?: string }) {
  try {
    const groupRef = await addDoc(collection(db, "groups"), {
      name: data.name.toUpperCase(), // Für Suche normalisieren
      displayName: data.name,
      description: data.description || "",
      adminId: data.adminId,
      memberIds: [data.adminId],
      moderatorIds: [],
      memberCount: 1,
      createdAt: serverTimestamp()
    });

    // Erstelle Admin-Profil in der Subcollection
    await setDoc(doc(db, "groups", groupRef.id, "members", data.adminId), {
      name: data.adminName || "Admin",
      role: "admin",
      joinedAt: serverTimestamp()
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
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.displayName || data.name,
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
 * Holt Details einer einzelnen Gruppe inklusive aller Mitglieder-Profile.
 */
export async function getGroupDetails(id: string) {
  try {
    const docRef = doc(db, "groups", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    
    // Mitglieder aus Subcollection laden
    const membersSnap = await getDocs(collection(db, "groups", id, "members"));
    const members = membersSnap.docs.map(d => ({
      userId: d.id,
      ...d.data()
    }));

    return {
      id: docSnap.id,
      ...data,
      name: data.displayName || data.name,
      members: members
    };
  } catch (error) {
    console.error("Error fetching group details:", error);
    return null;
  }
}

/**
 * Fügt einen Benutzer als Mitglied zu einer Gruppe hinzu (Auto-Join).
 */
export async function joinGroupAction(groupId: string, userId: string, userName: string) {
  try {
    const groupRef = doc(db, "groups", groupId);
    const memberRef = doc(db, "groups", groupId, "members", userId);
    
    const memberSnap = await getDoc(memberRef);
    
    if (memberSnap.exists()) {
      await updateDoc(memberRef, {
        name: userName || memberSnap.data().name
      });
    } else {
      await setDoc(memberRef, {
        name: userName || "Unbekannter Node",
        role: "member",
        joinedAt: serverTimestamp()
      });
    }

    const groupSnap = await getDoc(groupRef);
    if (!groupSnap.exists()) return { success: false, error: "Gruppe nicht gefunden" };
    
    const data = groupSnap.data();
    if (data.memberIds && data.memberIds.includes(userId)) {
      return { success: true, alreadyMember: true };
    }

    await updateDoc(groupRef, {
      memberIds: arrayUnion(userId),
      memberCount: increment(1)
    });

    revalidatePath(`/modules/qloud/${groupId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error joining group:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Ernennt oder entfernt einen Moderator.
 * Prüft den Status jetzt sicher auf dem Server.
 */
export async function toggleModeratorAction(groupId: string, userId: string) {
  try {
    const groupRef = doc(db, "groups", groupId);
    const memberRef = doc(db, "groups", groupId, "members", userId);

    const memberSnap = await getDoc(memberRef);
    if (!memberSnap.exists()) throw new Error("Mitglied nicht gefunden");

    const currentRole = memberSnap.data().role;
    const isNewMod = currentRole !== "moderator";

    const batch = writeBatch(db);

    // 1. Array im Gruppen-Dokument aktualisieren
    batch.update(groupRef, {
      moderatorIds: isNewMod ? arrayUnion(userId) : arrayRemove(userId)
    });

    // 2. Rolle in der Mitglieder-Subcollection aktualisieren
    batch.update(memberRef, {
      role: isNewMod ? "moderator" : "member"
    });

    await batch.commit();

    revalidatePath(`/modules/qloud/${groupId}`);
    return { success: true, newRole: isNewMod ? "moderator" : "member" };
  } catch (error: any) {
    console.error("Error toggling moderator:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Gibt ein Medium (Bild) für alle frei.
 */
export async function approveMediaAction(groupId: string, mediaId: string) {
  try {
    const mediaRef = doc(db, "groups", groupId, "media", mediaId);
    await updateDoc(mediaRef, { status: "APPROVED" });
    return { success: true };
  } catch (error: any) {
    console.error("Error approving media:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Löscht ein Medium (Bild) permanent inkl. Vercel Blob.
 */
export async function deleteMediaAction(groupId: string, mediaId: string) {
  try {
    const mediaRef = doc(db, "groups", groupId, "media", mediaId);
    const mediaSnap = await getDoc(mediaRef);
    
    if (mediaSnap.exists()) {
      const url = mediaSnap.data().url;
      await del(url);
    }

    await deleteDoc(mediaRef);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting media:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Löscht eine Gruppe permanent inkl. aller Blobs und Subcollections.
 */
export async function deleteGroup(id: string, userId: string) {
  try {
    const docRef = doc(db, "groups", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return { error: "Gruppe nicht gefunden" };
    if (docSnap.data().adminId !== userId) return { error: "Nicht autorisiert" };

    const mediaSnap = await getDocs(collection(db, "groups", id, "media"));
    const urls = mediaSnap.docs.map(d => d.data().url).filter(Boolean);
    
    if (urls.length > 0) {
      await del(urls);
    }

    const batch = writeBatch(db);
    mediaSnap.docs.forEach(d => batch.delete(d.ref));
    
    const membersSnap = await getDocs(collection(db, "groups", id, "members"));
    membersSnap.docs.forEach(d => batch.delete(d.ref));

    const requestsSnap = await getDocs(collection(db, "groups", id, "joinRequests"));
    requestsSnap.docs.forEach(d => batch.delete(d.ref));
    
    batch.delete(docRef);
    
    await batch.commit();

    revalidatePath("/modules/qloud");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting group:", error);
    return { error: `Fehler beim Löschen: ${error.message}` };
  }
}
