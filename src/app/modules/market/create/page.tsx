"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import AuthGuard from "@/components/AuthGuard";
import { 
  ArrowLeft, 
  Upload, 
  DollarSign, 
  MapPin, 
  Type, 
  FileText, 
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { upload } from '@vercel/blob/client';
import { createListingAction } from "../actions";

const CATEGORIES = [
  "Elektronik",
  "Fashion",
  "Home & Garden",
  "Fahrzeuge",
  "Services",
  "Sonstiges"
];

export default function CreateListing() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    category: "Elektronik"
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !imageFile) {
        alert("Bitte wähle ein Bild aus.");
        return;
    }
    
    setIsPending(true);
    try {
      // 1. Upload to Vercel Blob
      const uniqueFilename = `market-${Date.now()}-${imageFile.name}`;
      const newBlob = await upload(uniqueFilename, imageFile, { 
        access: 'public', 
        handleUploadUrl: '/api/upload' 
      });

      // 2. Create Listing in Firestore
      const result = await createListingAction({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        city: formData.city,
        category: formData.category,
        imageUrl: newBlob.url,
        sellerId: auth.currentUser.uid,
        sellerName: auth.currentUser.displayName || auth.currentUser.email || "Unbekannter Verkäufer"
      });

      if (result.success) {
        router.push("/modules/market");
      } else {
        alert("Fehler beim Erstellen des Inserats.");
        setIsPending(false);
      }
    } catch (err) {
      console.error(err);
      alert("Systemfehler beim Upload.");
      setIsPending(false);
    }
  };

  return (
    <AuthGuard>
      <SiteLayoutClient activePage="market">
        <div className="max-w-4xl mx-auto space-y-10 pb-32 px-4 md:px-0">
          
          {/* HEADER */}
          <header className="flex items-center gap-6">
            <button 
              onClick={() => router.back()}
              className="p-4 bg-foreground/5 rounded-2xl text-foreground/40 hover:bg-foreground/10 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
               <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground">
                  Neues <span className="text-primary">Angebot.</span>
               </h1>
               <p className="text-[10px] md:text-xs font-black uppercase text-primary italic tracking-widest mt-1">Create a professional listing</p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT: MEDIA UPLOAD */}
            <div className="lg:col-span-5 space-y-6">
               <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                     <Sparkles size={200} />
                  </div>
                  
                  <div className="relative space-y-8 h-full flex flex-col justify-between">
                     <div className="space-y-2">
                        <h3 className="text-xl font-black italic uppercase text-foreground">Produktbild</h3>
                        <p className="text-[10px] font-black uppercase text-foreground/30 italic">Lade ein hochwertiges Foto hoch</p>
                     </div>

                     <label className="relative flex-1 group cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        <div className="w-full h-full min-h-[300px] border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center p-8 transition-all group-hover:border-primary/40 group-hover:bg-primary/5 relative overflow-hidden">
                           {imagePreview ? (
                              <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
                           ) : (
                              <div className="text-center space-y-4">
                                 <div className="p-6 bg-foreground/5 rounded-3xl text-foreground/20 group-hover:text-primary transition-colors inline-block">
                                    <Upload size={32} />
                                 </div>
                                 <p className="text-[10px] font-black uppercase text-foreground/20 italic tracking-widest">Klicken zum Auswählen</p>
                              </div>
                           )}
                        </div>
                     </label>
                  </div>
               </div>
            </div>

            {/* RIGHT: DETAILS */}
            <div className="lg:col-span-7 space-y-6">
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
                          placeholder="Z.B. IPHONE 15 PRO MAX - TOP ZUSTAND"
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
                          placeholder="Z.B. BERLIN ODER HAMBURG"
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
                          placeholder="BESCHREIBE DEIN PRODUKT SO GENAU WIE MÖGLICH..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-black italic uppercase tracking-widest outline-none focus:border-primary/50 transition-all text-foreground resize-none"
                        />
                     </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-primary text-secondary font-black italic uppercase tracking-widest py-8 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {isPending ? (
                       <>
                         <Clock className="animate-spin" /> SYSTEM-SYNCHRONISIERUNG...
                       </>
                    ) : (
                       <>
                         <Zap size={20} /> ANGEBOT LIVE SCHALTEN
                       </>
                    )}
                  </button>
                  
                  <div className="flex justify-center items-center gap-6 opacity-20">
                     <span className="text-[8px] font-black uppercase italic italic tracking-[0.3em] flex items-center gap-1"><ShieldCheck size={10} /> SSL Encrypted</span>
                     <span className="text-[8px] font-black uppercase italic italic tracking-[0.3em] flex items-center gap-1"><Zap size={10} /> Global Node Delivery</span>
                  </div>
               </div>
            </div>

          </form>

        </div>
      </SiteLayoutClient>
    </AuthGuard>
  );
}
