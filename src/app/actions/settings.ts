import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * GLOBAL SETTINGS ACTIONS (FIRESTORE)
 * Vollständig entkernt und auf Cloud-Sync umgestellt.
 * Ermöglicht native Unabhängigkeit für Android/iOS.
 */

// 🛠️ EINSTELLUNGEN LADEN (Firestore)
export async function getGlobalSettings() {
  try {
    const docRef = doc(db, "admin_config", "global");
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      return snap.data();
    }
    
    // Professionelle Standardwerte für das Showcase
    const defaults = {
      appName: "Power Plattform",
      companyName: "Power Plattform Digital Solutions",
      email: "info@power-plattform.de",
      primaryColor: "#2eb64a",
      secondaryColor: "#4ade80",
      status: "Operational"
    };

    // Beim ersten Aufruf direkt in Firestore anlegen (Seeding)
    await setDoc(docRef, defaults);
    return defaults;
  } catch (error) {
    console.error("❌ CLOUD SETTINGS ERROR:", error);
    return null;
  }
}

// 📝 EINSTELLUNGEN AKTUALISIEREN (Firestore)
export async function updateGlobalSettings(data: any) {
  try {
    const docRef = doc(db, "admin_config", "global");
    await setDoc(docRef, data, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error("❌ CLOUD UPDATE ERROR:", error);
    return { success: false, error: error.message };
  }
}
