// STUBBED FOR ANDROID BUILD
// import { put } from "@vercel/blob";
// import { writeFile, mkdir } from "fs/promises";
// import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function uploadFile(file: File, folder: string): Promise<string> {
  // This function is deprecated for Native build.
  // Use uploadImage from @/lib/storage which uses client-side Firebase Storage.
  console.warn("SERVER_UPLOAD_CALLED: This should not happen in native build.");
  return "/uploads/stubbed.jpg";
}
