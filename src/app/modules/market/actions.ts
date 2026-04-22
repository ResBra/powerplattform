"use client";

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
  deleteDoc,
  arrayUnion,
  Timestamp
} from "firebase/firestore";

export interface MarketListing {
  id?: string;
  title: string;
  description: string;
  price: number;
  city: string;
  category: string;
  imageUrls: string[]; // Changed from single imageUrl
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
    return { success: true, id: docRef.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 🔍 ANGEBOTE LADEN (Mit Filtern)
// HINWEIS: Bei Verwendung von Filtern (Kategorie) + orderBy (createdAt) ist ein zusammengesetzter Index erforderlich.
// Link zum Erstellen: https://console.firebase.google.com/v1/r/project/powerautomate-3afbd/firestore/indexes?create_composite=Cltwcm9qZWN0cy9wb3dlcmF1dG9tYXRlLTNhZmJkL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9tYXJrZXRfbGlzdGluZ3MvaW5kZXhlcy9fEAEaDAoIY2F0ZWdvcnkQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC
export async function getListingsAction(filters?: { category?: string; city?: string }) {
  try {
    let q = query(collection(db, "market_listings"), orderBy("createdAt", "desc"));
    
    if (filters?.category && filters.category !== "All") {
      q = query(q, where("category", "==", filters.category));
    }
    
    const snap = await getDocs(q);
    const listings = snap.docs.map(d => {
      const data = d.data();
      return { 
        id: d.id, 
        ...data,
        createdAt: data.createdAt?.toMillis?.() || Date.now()
      };
    });
    
    // Clientseitige Filterung für Stadt
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

// 📝 ANGEBOT AKTUALISIEREN
export async function updateListingAction(listingId: string, userId: string, data: Partial<MarketListing>) {
  try {
    const docRef = doc(db, "market_listings", listingId);
    const snap = await getDoc(docRef);
    
    if (!snap.exists() || snap.data().sellerId !== userId) {
      return { success: false, error: "Nicht autorisiert oder Inserat nicht gefunden." };
    }

    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 🗑️ ANGEBOT LÖSCHEN
export async function deleteListingAction(listingId: string, userId: string) {
  try {
    const docRef = doc(db, "market_listings", listingId);
    const snap = await getDoc(docRef);

    if (!snap.exists() || snap.data().sellerId !== userId) {
      return { success: false, error: "Nicht autorisiert." };
    }

    await deleteDoc(docRef);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 📦 BESTELLUNG ERSTELLEN
export async function createOrderAction(orderData: {
  buyerId: string;
  buyerName: string;
  items: any[];
  totalPrice: number;
  paymentMethod: string;
}) {
  try {
    const docRef = await addDoc(collection(db, "market_orders"), {
      ...orderData,
      status: "COMPLETED",
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 📊 BESTELLUNGEN LADEN (Für Analytics)
export async function getOrdersAction() {
  try {
    const q = query(collection(db, "market_orders"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toMillis() || Date.now()
      };
    });
  } catch (err) {
    console.error(err);
    return [];
  }
}
