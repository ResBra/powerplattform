"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/upload";

export async function createProperty(formData: FormData) {
  try {
    console.log("Starting createProperty execution...");
    
    // Validate and parse numeric fields
    const rawPrice = (formData.get("price") as string) || "0";
    const rawSqm = formData.get("sqm") as string;
    const rawRooms = formData.get("rooms") as string;
    
    const parseSafeFloat = (val: string | null) => {
      if (!val) return null;
      const parsed = parseFloat(val.replace(',', '.'));
      return isNaN(parsed) ? null : parsed;
    };

    const price = parseFloat(rawPrice.replace(',', '.')) || 0;
    const sqm = parseSafeFloat(rawSqm);
    const rooms = parseSafeFloat(rawRooms);
    const lotSize = parseSafeFloat(formData.get("lotSize") as string);
    const yearBuilt = formData.get("yearBuilt") ? parseInt(formData.get("yearBuilt") as string) : null;
    const energyClass = (formData.get("energyClass") as string) || null;
    const title = formData.get("title") as string;
    const address = formData.get("address") as string;
    const type = formData.get("type") as string;
    const listingType = formData.get("listingType") as string;
    const description = (formData.get("description") as string) || "";
    const features = formData.get("features") as string;
    const imageFiles = formData.getAll("images") as File[];
    const isSold = formData.get("isSold") === "on";
    const isReserved = formData.get("isReserved") === "on";
    const isRented = formData.get("isRented") === "on";
    const externalLink = formData.get("externalLink") as string;
    const assignedMemberIds = formData.getAll("assignedMemberIds") as string[];

    console.log(`Processing ${imageFiles.length} images and ${assignedMemberIds.length} team members...`);

    const uploadedPaths: string[] = [];
    for (const file of imageFiles) {
      if (file && file.size > 0 && typeof file.arrayBuffer === 'function') {
        const path = await uploadFile(file, "properties");
        uploadedPaths.push(path);
      }
    }

    const mainImageUrl = uploadedPaths[0] || "/properties/default.jpg";

    console.log("Database insertion starting...");
    const newProperty = await prisma.propertyListing.create({
      data: {
        title,
        address,
        price,
        sqm,
        rooms,
        type,
        listingType,
        imageUrl: mainImageUrl,
        description,
        features,
        lotSize,
        yearBuilt,
        energyClass,
        isSold,
        isReserved,
        isRented,
        externalLink,
        images: {
          create: uploadedPaths.map(path => ({ url: path }))
        },
        assignedStaff: {
          connect: assignedMemberIds.map(id => ({ id }))
        }
      },
    });

    console.log("Property created successfully:", newProperty.id);

    revalidatePath("/");
    revalidatePath("/immobilien");
    revalidatePath("/admin/properties");
    return { success: true, message: "Immobilie erfolgreich erstellt!" };
  } catch (error: any) {
    console.error("CRITICAL ERROR in createProperty:", {
      message: error.message,
      stack: error.stack,
      code: error.code // Prisma error codes
    });
    return { success: false, message: `Fehler beim Erstellen: ${error.message || "Unbekannter Fehler"}` };
  }
}

export async function deleteProperty(id: string) {
  try {
    await prisma.propertyListing.delete({
      where: { id },
    });
    revalidatePath("/");
    revalidatePath("/immobilien");
    revalidatePath("/admin/properties");
    return { success: true, message: "Immobilie gelöscht!" };
  } catch (error) {
    return { success: false, message: "Löschen fehlgeschlagen." };
  }
}

export async function togglePropertyStatus(id: string, field: "isSold" | "isReserved" | "isRented", value: boolean) {
  try {
    await prisma.propertyListing.update({
      where: { id },
      data: { [field]: value }
    });
    revalidatePath("/");
    revalidatePath("/immobilien");
    revalidatePath("/admin/properties");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deletePropertyImage(imageId: string) {
  try {
    const image = await prisma.propertyImage.findUnique({ where: { id: imageId } });
    if (!image) return { success: false, message: "Bild nicht gefunden." };

    await prisma.propertyImage.delete({ where: { id: imageId } });
    
    revalidatePath("/admin/properties");
    revalidatePath(`/admin/properties/${image.propertyId}`);
    return { success: true, message: "Bild gelöscht!" };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { success: false, message: "Löschen fehlgeschlagen." };
  }
}
export async function updateProperty(id: string, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const address = formData.get("address") as string;
    const rawPrice = formData.get("price") as string;
    const rawSqm = formData.get("sqm") as string;
    const rawRooms = formData.get("rooms") as string;

    const parseSafeFloat = (val: string | null) => {
      if (!val) return null;
      const parsed = parseFloat(val.replace(',', '.'));
      return isNaN(parsed) ? null : parsed;
    };

    const price = parseSafeFloat(rawPrice) || 0;
    const sqm = parseSafeFloat(rawSqm);
    const rooms = parseSafeFloat(rawRooms);
    const type = formData.get("type") as string;
    const listingType = formData.get("listingType") as string;
    const description = formData.get("description") as string;
    const features = formData.get("features") as string;
    const lotSize = parseSafeFloat(formData.get("lotSize") as string);
    const yearBuilt = formData.get("yearBuilt") ? parseInt(formData.get("yearBuilt") as string) : null;
    const energyClass = (formData.get("energyClass") as string) || null;
    const imageFiles = formData.getAll("images") as File[];
    const isSold = formData.get("isSold") === "on";
    const isReserved = formData.get("isReserved") === "on";
    const isRented = formData.get("isRented") === "on";
    const externalLink = formData.get("externalLink") as string;
    const assignedMemberIds = formData.getAll("assignedMemberIds") as string[];

    const existing = await prisma.propertyListing.findUnique({ 
      where: { id },
      include: { images: true }
    });
    
    if (!existing) return { success: false, message: "Immobilie nicht gefunden." };

    let mainImageUrl = existing.imageUrl;
    const newPaths: string[] = [];

    for (const file of imageFiles) {
      if (file && file.size > 0 && file.name !== 'undefined') {
        const path = await uploadFile(file, "properties");
        newPaths.push(path);
      }
    }

    // If new images were uploaded and no main image exists (or user wants to replace it)
    if (newPaths.length > 0 && (!mainImageUrl || mainImageUrl === "/properties/default.jpg")) {
      mainImageUrl = newPaths[0];
    }

    await prisma.propertyListing.update({
      where: { id },
      data: {
        title,
        address,
        price,
        sqm,
        rooms,
        type,
        listingType,
        imageUrl: mainImageUrl,
        description,
        features,
        lotSize,
        yearBuilt,
        energyClass,
        isSold,
        isReserved,
        isRented,
        externalLink,
        images: {
          create: newPaths.map(path => ({ url: path }))
        },
        assignedStaff: {
          set: assignedMemberIds.map(id => ({ id }))
        }
      },
    });

    revalidatePath("/");
    revalidatePath("/immobilien");
    revalidatePath(`/immobilien/${id}`);
    revalidatePath("/admin/properties");
    revalidatePath(`/admin/properties/${id}`);
    
    return { success: true, message: "Immobilie erfolgreich aktualisiert!" };
  } catch (error: any) {
    console.error("Error updating property:", error);
    return { success: false, message: `Fehler: ${error.message}` };
  }
}
