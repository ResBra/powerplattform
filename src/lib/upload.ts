import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function uploadFile(file: File, folder: string): Promise<string> {
    // 1. Primärer Versuch: Vercel Blob (für Produktion)
    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
    
    if (token) {
      try {
        console.log(`BLOB_LOG: Processing upload for "${file.name}"...`);
        
        // Sanitize name: remove non-ascii/special chars
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const blobPath = `${folder}/${uuidv4().slice(0, 8)}-${safeName}`;
        
        const { url } = await put(blobPath, file, {
          access: 'public',
          token: token 
        });
        
        console.log(`BLOB_LOG: Upload success: ${url}`);
        return url;
      } catch (error: any) {
        console.error("BLOB_LOG: Upload failed:", error.message);
        throw new Error(`Upload fehlgeschlagen: ${error.message}`);
      }
    } else {
      console.warn("BLOB_LOG: Vercel Blob Token NICHT gefunden.");
    }

  // 2. Fallback: Lokales Dateisystem (für lokale Entwicklung)
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure the folder exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    
    // In Vercel Umgebungen wird mkdir fehlschlagen, wenn es nicht /tmp ist
    // Aber lokal ist es notwendig.
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignorieren falls Verzeichnis nicht erstellt werden kann (z.B. Read-only FS)
    }

    const extension = path.extname(file.name) || ".jpg";
    const fileName = `${uuidv4()}${extension}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    return `/uploads/${folder}/${fileName}`;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Fehler beim Hochladen der Datei. Bitte prüfen Sie, ob Vercel Blob konfiguriert ist.");
  }
}
