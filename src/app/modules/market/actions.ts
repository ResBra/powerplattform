"use server";

import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  updateDoc,
  arrayUnion,
  Timestamp
} from "firebase/firestore";
import { revalidatePath } from "next/cache";

export interface MarketListing {
  id?: string;
  title: string;
  description: string;
  price: number;
  city: string;
  category: string;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  createdAt?: any;
}

// 🛒 ANBOT ERSTELLEN
export async function createListingAction(data: MarketListing) {
  try {
    const docRef = await addDoc(collection(db, "market_listings"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    revalidatePath("/modules/market");
    return { success: true, id: docRef.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 🔍 ANGEBOTE LADEN (Mit Filtern)
export async function getListingsAction(filters?: { category?: string; city?: string }) {
  try {
    let q = query(collection(db, "market_listings"), orderBy("createdAt", "desc"));
    
    if (filters?.category && filters.category !== "All") {
      q = query(q, where("category", "==", filters.category));
    }
    
    const snap = await getDocs(q);
    const listings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Clientseitige Filterung für Stadt (da Firestore multiple Inequality/Queries einschränkt ohne Indizes)
    if (filters?.city) {
      return listings.filter((l: any) => l.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    
    return listings;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// 💬 CHAT INITIALISIEREN ODER FINDEN
export async function getOrCreateChatAction(listingId: string, buyerId: string, sellerId: string, listingTitle: string, listingImage: string) {
  try {
    // Suche nach existierendem Chat für dieses Produkt zwischen diesen beiden Personen
    const q = query(
      collection(db, "market_chats"),
      where("listingId", "==", listingId),
      where("participants", "array-contains", buyerId)
    );
    
    const snap = await getDocs(q);
    const existingChat = snap.docs.find(d => {
      const data = d.data();
      return data.participants.includes(sellerId);
    });

    if (existingChat) {
      return { success: true, chatId: existingChat.id };
    }

    // Neuer Chat
    const docRef = await addDoc(collection(db, "market_chats"), {
      listingId,
      participants: [buyerId, sellerId],
      listingTitle,
      listingImage,
      lastMessage: "Noch keine Nachrichten",
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    return { success: true, chatId: docRef.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ✉️ NACHRICHT SENDEN
export async function sendMessageAction(chatId: string, senderId: string, text: string) {
  try {
    await addDoc(collection(db, "market_chats", chatId, "messages"), {
      text,
      senderId,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "market_chats", chatId), {
      lastMessage: text,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
