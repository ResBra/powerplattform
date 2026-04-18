"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import AuthGuard from "@/components/AuthGuard";
import { 
  ArrowLeft, 
  DollarSign, 
  MapPin, 
  Type, 
  FileText, 
  Layers,
  Clock,
  Zap,
  ShieldCheck,
  Save
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { updateListingAction } from "../../actions";

const CATEGORIES = [
  "Elektronik",
  "Fashion",
  "Home & Garden",
  "Fahrzeuge",
  "Services",
  "Sonstiges"
];

export default function EditListing() {
  const { listingId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    category: "Elektronik"
  });

  useEffect(() => {
    async function loadListing() {
      if (!auth.currentUser) return;
      const docRef = doc(db, "market_listings", listingId as string);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        // Sicherheit: Nur Inhaber darf editieren
        if (data.sellerId !== auth.currentUser.uid) {
           router.push("/modules/market");
           return;
        }
        setFormData({
          title: data.title,
          description: data.description,
          price: data.price.toString(),
          city: data.city,
          category: data.category
        });
        setLoading(false);
      } else {
        router.push("/modules/market");
      }
    }
    loadListing();
  }, [listingId, auth.currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setIsPending(true);
    try {
      const result = await updateListingAction(listingId as string, auth.currentUser.uid, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        city: formData.city,
        category: formData.category
      });

      if (result.success) {
        router.push(`/modules/market/listing/${listingId}`);
      } else {
        alert(result.error || "Fehler beim Aktualisieren.");
        setIsPending(false);
      }
    } catch (err) {
      console.error(err);
      alert("Systemfehler beim Speichern.");
      setIsPending(false);
    }
  };

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
        <div className="max-w-4xl mx-auto space-y-10 pb-32 px-4 md:px-0">
          
          <header className="flex items-center gap-6">
            <button 
              onClick={() => router.back()}
              className="p-4 bg-foreground/5 rounded-2xl text-foreground/40 hover:bg-foreground/10 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
               <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground">
                  Angebot <span className="text-primary">bearbeiten.</span>
               </h1>
               <p className="text-[10px] md:text-xs font-black uppercase text-primary italic tracking-widest mt-1">Modify your product details</p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
               <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-8">
                  
                  <div className="grid gap-6">
                     {/* TITLE */}
                     <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-foreground/30 italic group-focus-within:text-primary transition-colors">
                           <Type size={12} /> Titel des Inserats
                        </label>
                        <input 
                          type="text" 
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          placeholder="Titel..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-black italic uppercase tracking-widest outline-none focus:border-primary/50 transition-all text-foreground"
                        />
                     </div>

                     {/* CATEGORY & PRICE */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                           <label className="flex items-center gap-2 text-[10px] font-black uppercase text-foreground/30 italic group-focus-within:text-primary transition-colors">
                              <Layers size={12} /> Kategorie
                           </label>
                           <select 
                             value={formData.category}
                             onChange={(e) => setFormData({...formData, category: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-black italic uppercase tracking-widest outline-none focus:border-primary/50 transition-all text-foreground appearance-none"
                           >
                             {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#050a10]">{c}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2 group">
                           <label className="flex items-center gap-2 text-[10px] font-black uppercase text-foreground/30 italic group-focus-within:text-primary transition-colors">
                              <DollarSign size={12} /> Preis (€)
                           </label>
                           <input 
                             type="number" 
                             required
                             value={formData.price}
                             onChange={(e) => setFormData({...formData, price: e.target.value})}
                             placeholder="0.00"
                             className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-black italic uppercase tracking-widest outline-none focus:border-primary/50 transition-all text-foreground"
                           />
                        </div>
                     </div>

                     {/* CITY */}
                     <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-foreground/30 italic group-focus-within:text-primary transition-colors">
                           <MapPin size={12} /> Standort (Stadt)
                        </label>
                        <input 
                          type="text" 
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          placeholder="Stadt..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-black italic uppercase tracking-widest outline-none focus:border-primary/50 transition-all text-foreground"
                        />
                     </div>

                     {/* DESCRIPTION */}
                     <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-foreground/30 italic group-focus-within:text-primary transition-colors">
                           <FileText size={12} /> Beschreibung
                        </label>
                        <textarea 
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          rows={6}
                          placeholder="Beschreibe dein Produkt..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-black italic uppercase tracking-widest outline-none focus:border-primary/50 transition-all text-foreground resize-none"
                        />
                     </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-primary text-secondary font-black italic uppercase tracking-widest py-8 rounded-[2rem] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {isPending ? (
                       <>
                         <Clock className="animate-spin" /> SPEICHERE ÄNDERUNGEN...
                       </>
                    ) : (
                       <>
                         <Save size={20} /> ÄNDERUNGEN SPEICHERN
                       </>
                    )}
                  </button>
                  
                  <div className="flex justify-center items-center gap-6 opacity-20">
                     <span className="text-[8px] font-black uppercase italic tracking-[0.3em] flex items-center gap-1"><ShieldCheck size={10} /> Secure Node Transaction</span>
                     <span className="text-[8px] font-black uppercase italic tracking-[0.3em] flex items-center gap-1"><Zap size={10} /> Instant Sync</span>
                  </div>
               </div>
          </form>

        </div>
      </SiteLayoutClient>
    </AuthGuard>
  );
}
