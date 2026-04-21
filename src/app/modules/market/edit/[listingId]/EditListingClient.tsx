"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import AuthGuard from "@/components/AuthGuard";
import { 
  ArrowLeft, 
  MapPin, 
  Type, 
  FileText, 
  Layers,
  Clock,
  Save,
  Upload,
  DollarSign,
  Plus
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { updateListingAction } from "../../actions";
import { uploadImage } from "@/lib/storage";

const CATEGORIES = [
  "Elektronik",
  "Fashion",
  "Home & Garden",
  "Fahrzeuge",
  "Services",
  "Sonstiges"
];

export default function EditListingClient() {
  const { listingId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    category: "Elektronik",
    imageUrls: [] as string[]
  });

  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);

  useEffect(() => {
    async function loadListing() {
      if (!listingId) return;
      const docRef = doc(db, "market_listings", listingId as string);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const urls = data.imageUrls || (data.imageUrl ? [data.imageUrl] : []);
        setFormData({
          title: data.title,
          description: data.description,
          price: data.price.toString(),
          city: data.city,
          category: data.category,
          imageUrls: urls
        });
        
        const previews: (string | null)[] = [null, null, null];
        urls.forEach((url: string, i: number) => {
          if (i < 3) previews[i] = url;
        });
        setImagePreviews(previews);
        setLoading(false);
      } else {
        router.push("/modules/market");
      }
    }
    loadListing();
  }, [listingId, router]);

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...imageFiles];
      newFiles[index] = file;
      setImageFiles(newFiles);

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...imagePreviews];
        newPreviews[index] = reader.result as string;
        setImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    newPreviews[index] = null;
    setImagePreviews(newPreviews);
    
    // Also remove from existing URLs if it was an existing one
    const newUrls = [...formData.imageUrls];
    if (index < newUrls.length) {
       newUrls.splice(index, 1);
       setFormData(prev => ({ ...prev, imageUrls: newUrls }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setIsPending(true);
    try {
      // 1. Determine which images to keep and which to upload
      const finalImageUrls: string[] = [];
      
      for (let i = 0; i < 3; i++) {
        const file = imageFiles[i];
        const preview = imagePreviews[i];
        
        if (file) {
          // New upload
          const url = await uploadImage(file, "market_listings");
          finalImageUrls.push(url);
        } else if (preview && preview.startsWith("http")) {
          // Existing image
          finalImageUrls.push(preview);
        }
      }

      const result = await updateListingAction(listingId as string, auth.currentUser.uid, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        city: formData.city,
        category: formData.category,
        imageUrls: finalImageUrls
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
        <div className="max-w-5xl mx-auto space-y-10 pb-32 px-4 md:px-0">
          
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
            </div>
          </header>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
               <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 shadow-2xl h-full flex flex-col gap-6">
                  <h3 className="text-xl font-black italic uppercase text-foreground">Produktbilder</h3>
                  
                  <div className="space-y-4">
                     {/* MAPPING OVER 3 SLOTS */}
                     {[0, 1, 2].map(idx => (
                        <div key={idx} className="relative group">
                           <label className={`relative block rounded-[2rem] border-2 border-white/5 border-dashed hover:border-primary/40 transition-all cursor-pointer overflow-hidden ${idx === 0 ? 'h-[250px]' : 'h-[100px]'}`}>
                              <input type="file" accept="image/*" onChange={(e) => handleImageChange(idx, e)} className="hidden" />
                              {imagePreviews[idx] ? (
                                 <img src={imagePreviews[idx]!} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              ) : (
                                 <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/10 text-[8px] font-black uppercase italic">
                                    {idx === 0 ? "Hauptbild" : `Bild ${idx + 1}`}
                                    <Upload size={idx === 0 ? 32 : 16} className="mt-2" />
                                 </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                 <Upload size={idx === 0 ? 32 : 20} className="text-white" />
                              </div>
                           </label>
                           {imagePreviews[idx] && (
                              <button 
                                type="button"
                                onClick={() => removeImage(idx)} 
                                className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              >✕</button>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="lg:col-span-7">
               <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-8">
                  <div className="grid gap-6">
                     <div className="space-y-group">
                        <label className="text-[10px] font-black uppercase text-foreground/30 italic group-focus-within:text-primary transition-colors flex items-center gap-2">
                           <Type size={12} /> Titel
                        </label>
                        <input 
                          type="text" 
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-black italic uppercase tracking-widest outline-none focus:border-primary/50 transition-all text-foreground"
                        />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                           <label className="flex items-center gap-2 text-[10px] font-black uppercase text-foreground/30 italic group-focus-within:text-primary transition-colors">
                              <Layers size={12} /> Kategorie
                           </label>
                           <div className="relative">
                              <select 
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-black italic uppercase tracking-widest outline-none focus:border-primary/50 transition-all text-foreground appearance-none cursor-pointer"
                              >
                                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#050a10] text-foreground">{c}</option>)}
                              </select>
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/20 group-focus-within:text-primary transition-colors">
                                 <Plus className="rotate-45" size={18} />
                              </div>
                           </div>
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
                             className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-black italic uppercase tracking-widest outline-none focus:border-primary/50 transition-all text-foreground"
                           />
                        </div>
                     </div>

                     <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-foreground/30 italic group-focus-within:text-primary transition-colors">
                           <MapPin size={12} /> Standort
                        </label>
                        <input 
                          type="text" 
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-black italic uppercase tracking-widest outline-none focus:border-primary/50 transition-all text-foreground"
                        />
                     </div>

                     <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-foreground/30 italic group-focus-within:text-primary transition-colors">
                           <FileText size={12} /> Beschreibung
                        </label>
                        <textarea 
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          rows={6}
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
                         <Clock className="animate-spin" /> SYNCHRONISIERUNG...
                       </>
                    ) : (
                       <>
                         <Save size={20} /> SPEICHERN
                       </>
                    )}
                  </button>
               </div>
            </div>
          </form>
        </div>
      </SiteLayoutClient>
    </AuthGuard>
  );
}
