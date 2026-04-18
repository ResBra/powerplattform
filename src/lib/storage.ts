import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

/**
 * Universelle Upload-Funktion für Firebase Storage
 * Ersetzt den Vercel Blob Dienst für Standalone-App Support.
 */
export async function uploadImage(file: File, path: string = "uploads"): Promise<string> {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized");
  }

  // Generiere einen eindeutigen Dateinamen
  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, `${path}/${fileName}`);

  try {
    // Lade die Datei hoch
    const snapshot = await uploadBytes(storageRef, file);
    
    // Hole die finale Public-URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log("✅ CLOUD STORAGE: Upload successful ->", downloadURL);
    return downloadURL;
  } catch (error: any) {
    console.error("❌ CLOUD STORAGE ERROR:", error);
    throw new Error(error.message || "Fehler beim Hochladen des Bildes.");
  }
}
