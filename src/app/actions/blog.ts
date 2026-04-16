"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/upload";

export async function createBlogPost(formData: FormData) {
  try {
    const title = (formData.get("title") as string)?.trim();
    const content = (formData.get("content") as string)?.trim();
    const published = formData.get("published") === "on";
    
    // Support single image or multiple (harmonized with properties)
    const imageFiles = formData.getAll("image") as File[];
    const mainImage = imageFiles.length > 0 ? imageFiles[0] : null;

    if (!title || !content) {
      return { success: false, message: "Titel und Inhalt sind erforderlich." };
    }

    let imageUrl = (formData.get("imageUrl") as string) || "/blog/default.jpg";
    
    // Only upload on server if not already uploaded by client
    if (imageUrl === "/blog/default.jpg" && mainImage && mainImage.size > 0 && typeof mainImage.arrayBuffer === 'function') {
      try {
        imageUrl = await uploadFile(mainImage, "blog");
      } catch (uploadError: any) {
        console.error("BLOB_LOG: Image upload failed for blog post:", uploadError.message);
        return { success: false, message: `Bilder-Upload fehlgeschlagen: ${uploadError.message}` };
      }
    }

    console.log("DB_LOG: Attempting to create blog post:", { title, published, imageUrl });

    const newPost = await prisma.blogPost.create({
      data: {
        title,
        content,
        imageUrl,
        published,
      },
    });

    console.log("DB_LOG: Blog post created successfully:", newPost.id);

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/admin");
    revalidatePath("/admin/blog");
    return { success: true, message: "Blog Beitrag veröffentlicht!", id: newPost.id };
  } catch (error: any) {
    console.error("DB_LOG: CRITICAL error in createBlogPost:", error);
    return { success: false, message: `Fehler beim Speichern: ${error.message || "Unbekannter Fehler"}` };
  }
}

export async function updateBlogPost(id: string, formData: FormData) {
  try {
    const title = (formData.get("title") as string)?.trim();
    const content = (formData.get("content") as string)?.trim();
    const published = formData.get("published") === "on";
    const imageFiles = formData.getAll("image") as File[];
    const mainImage = imageFiles.length > 0 ? imageFiles[0] : null;

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return { success: false, message: "Beitrag nicht gefunden." };

    let imageUrl = (formData.get("imageUrl") as string) || existing.imageUrl || "/blog/default.jpg";

    if (formData.get("imageUrl") === null && mainImage && mainImage.size > 0 && typeof mainImage.arrayBuffer === 'function') {
      try {
        imageUrl = await uploadFile(mainImage, "blog");
      } catch (uploadError: any) {
        console.error("BLOB_LOG: Image update failed for blog post:", uploadError.message);
        return { success: false, message: `Bilder-Upload fehlgeschlagen: ${uploadError.message}` };
      }
    }

    await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        content,
        imageUrl,
        published,
      },
    });

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${id}`);
    revalidatePath("/admin/blog");
    return { success: true, message: "Beitrag aktualisiert!" };
  } catch (error: any) {
    console.error("DB_LOG: Error updating blog post:", error);
    return { success: false, message: `Fehler beim Aktualisieren: ${error.message}` };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    await prisma.blogPost.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    return { success: true, message: "Beitrag gelöscht." };
  } catch (error) {
    console.error("DB_LOG: Error deleting blog post:", error);
    return { success: false, message: "Löschen fehlgeschlagen." };
  }
}
