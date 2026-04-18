"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import AuthGuard from "@/components/AuthGuard";
import { 
  ArrowLeft, 
  MapPin, 
  MessageCircle, 
  User, 
  Tag, 
  Calendar,
  ShieldCheck,
  Zap,
  Info,
  DollarSign,
  Edit,
  Trash2
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getOrCreateChatAction, deleteListingAction } from "../../actions";

export default function ListingDetail() {
  const { listingId } = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadListing() {
      const docRef = doc(db, "market_listings", listingId as string);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setListing({ id: snap.id, ...snap.data() });
      } else {
        router.push("/modules/market");
      }
      setLoading(false);
    }
    loadListing();
  }, [listingId, router]);

  const handleContactSeller = async () => {
    if (!auth.currentUser || !listing) return;
    
    // Eigener Artikel? Dann zum Postfach
    if (auth.currentUser.uid === listing.sellerId) {
      router.push("/modules/market/messages");
      return;
    }

    setIsRedirecting(true);
    const result = await getOrCreateChatAction(
      listing.id,
      auth.currentUser.uid,
      listing.sellerId,
      listing.title,
      listing.imageUrl
    );

    if (result.success) {
      router.push(`/modules/market/messages/${result.chatId}`);
    } else {
      alert("Fehler beim Öffnen des Chats.");
      setIsRedirecting(false);
    }
  };

  const handleDelete = async () => {
    if (!auth.currentUser || !listing) return;
    if (!confirm("Möchtest du dieses Inserat wirklich löschen?")) return;

    setIsDeleting(true);
    const result = await deleteListingAction(listing.id, auth.currentUser.uid);
    if (result.success) {
      router.push("/modules/market");
    } else {
      alert("Fehler beim Löschen.");
      setIsDeleting(false);
    }
  };

  const isOwner = auth.currentUser?.uid === listing?.sellerId;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050a10] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <SiteLayoutClient activePage="market">
        <div className="max-w-6xl mx-auto space-y-10 pb-32 px-4 md:px-0">
          
          {/* HEADER / BACK */}
          <button 
            onClick={() => router.push("/modules/market")}
            className="flex items-center gap-4 text-[10px] font-black uppercase text-foreground/40 italic hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Zurück zur Übersicht
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT: BIG IMAGE */}
            <div className="lg:col-span-7">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-card border border-white/5 rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl"
               >
                  <img src={listing.imageUrl} className="w-full aspect-square object-cover" />
               </motion.div>
            </div>

            {/* RIGHT: INFO & ACTIONS */}
            <div className="lg:col-span-5 space-y-8">
               <div className="bg-card border border-white/5 rounded-[3rem] p-10 md:p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none -rotate-12">
                     <Tag size={200} />
                  </div>
                  
                  <div className="relative space-y-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary italic uppercase tracking-widest">{listing.category}</span>
                        <div className="flex items-center gap-2 text-foreground/40 text-[10px] font-black uppercase italic">
                           <MapPin size={12} /> {listing.city}
                        </div>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                         {listing.title}
                      </h1>
                    </div>

                    <div className="p-8 bg-foreground/[0.03] border border-white/5 rounded-3xl">
                       <span className="text-[10px] font-black uppercase text-foreground/30 italic block mb-2 tracking-[0.3em]">Unverbindlicher Preis</span>
                       <div className="text-5xl font-black italic uppercase text-foreground">
                          {listing.price}<span className="text-primary ml-2">€</span>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                             <User size={24} />
                          </div>
                          <div>
                             <p className="text-[8px] font-black uppercase text-foreground/30 italic">Verkäufer</p>
                             <p className="text-sm font-black italic uppercase text-foreground">{listing.sellerName}</p>
                          </div>
                       </div>
                       
                       {isOwner ? (
                         <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => router.push(`/modules/market/edit/${listing.id}`)}
                              className="w-full bg-white/10 text-white font-black italic uppercase tracking-widest py-6 rounded-[2rem] border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                            >
                               <Edit size={18} /> Bearbeiten
                            </button>
                            <button 
                              onClick={handleDelete}
                              disabled={isDeleting}
                              className="w-full bg-red-500/10 text-red-500 font-black italic uppercase tracking-widest py-6 rounded-[2rem] border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                               {isDeleting ? <div className="w-5 h-5 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div> : <><Trash2 size={18} /> Löschen</>}
                            </button>
                         </div>
                       ) : (
                         <button 
                           onClick={handleContactSeller}
                           disabled={isRedirecting}
                           className="w-full bg-primary text-secondary font-black italic uppercase tracking-widest py-8 rounded-[2rem] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                         >
                           {isRedirecting ? (
                              <div className="w-6 h-6 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
                           ) : (
                              <>
                                <MessageCircle size={20} /> Verkäufer Kontaktieren
                              </>
                           )}
                         </button>
                       )}
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-6">
                       <div className="flex items-center gap-3 text-foreground/40">
                          <Info size={16} className="text-primary" />
                          <p className="text-[10px] font-black uppercase italic tracking-widest">Beschreibung</p>
                       </div>
                       <p className="text-foreground/60 text-sm italic leading-relaxed">
                          {listing.description}
                       </p>
                    </div>

                    <div className="flex items-center justify-center gap-8 opacity-20 pt-4">
                       <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className="text-primary" />
                          <span className="text-[8px] font-black uppercase italic tracking-widest">Safe Network</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <Zap size={14} className="text-primary" />
                          <span className="text-[8px] font-black uppercase italic tracking-widest">Encrypted Direct</span>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

          </div>

        </div>
      </SiteLayoutClient>
    </AuthGuard>
  );
}
