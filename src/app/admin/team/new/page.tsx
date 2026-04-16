"use client";

import { useState } from "react";
import { createTeamMember } from "@/app/actions/team";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Image as ImageIcon, Briefcase, Phone, Mail, User } from "lucide-react";
import Link from "next/link";

export default function NewTeamMemberPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await createTeamMember(formData);

    if (result.success) {
      router.push("/admin/team");
      router.refresh();
    } else {
      setIsPending(false);
      alert(result.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 px-4">
      <div className="flex flex-col gap-4">
        <Link href="/admin/team" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> Zurück
        </Link>
        <h1 className="text-3xl md:text-4xl font-black text-secondary italic uppercase leading-none">
          Neuer <span className="text-primary block md:inline">Mitarbeiter.</span>
        </h1>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 shadow-xl border border-black/5 overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
          
          <div className="grid grid-cols-2 gap-6 md:gap-8">
            <div className="flex flex-col gap-3">
              <label className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                <User size={16} className="text-primary" /> Name
              </label>
              <input required name="name" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 md:py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                <Briefcase size={16} className="text-primary" /> Position
              </label>
              <input required name="position" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 md:py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="flex flex-col gap-3">
              <label className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                <Phone size={16} className="text-primary" /> Telefon
              </label>
              <input name="phone" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 md:py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                <Mail size={16} className="text-primary" /> E-Mail
              </label>
              <input name="email" type="email" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 md:py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">Persönliches Statement / Bio</label>
            <textarea 
              name="bio" 
              rows={4}
              placeholder="Wir sind hier, um Ihnen bei Ihren Anliegen rund um Ihre Immobilie mit Rat und Tat zur Seite zu stehen."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 md:py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic resize-none" 
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">
              <ImageIcon size={16} className="text-primary" /> Profilbild hochladen (Vollständig sichtbar)
            </label>
            
            <div className="group relative flex flex-col items-center justify-center w-full aspect-square md:aspect-video border-2 border-dashed border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-100 hover:bg-slate-200/50 hover:border-primary/30 transition-all cursor-pointer overflow-hidden">
               {imagePreview ? (
                  <div className="absolute inset-0 w-full h-full">
                     <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-4" />
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-white text-xs font-black uppercase tracking-widest bg-primary/80 px-4 py-2 rounded-xl">Bild ändern</span>
                     </div>
                  </div>
               ) : (
                  <div className="flex flex-col items-center gap-4 text-slate-400">
                     <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ImageIcon size={24} />
                     </div>
                     <p className="text-[10px] font-bold uppercase tracking-widest">Klicken zum Auswählen</p>
                  </div>
               )}
               <input required name="image" type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
             <label className="flex items-center gap-4 cursor-pointer group flex-1">
                <input name="isManager" type="checkbox" className="w-6 h-6 rounded-md text-primary focus:ring-primary border-slate-300" />
                <span className="text-sm font-bold text-secondary uppercase italic group-hover:text-primary transition-colors">Geschäftsführer</span>
             </label>
             <div className="flex flex-col gap-2 flex-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary/40">Anzeigereihenfolge (Zahl)</label>
                <input name="order" type="number" defaultValue="0" className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none" />
             </div>
          </div>

          <button type="submit" disabled={isPending} className="w-full btn-primary py-5 md:py-6 text-lg md:text-xl flex items-center justify-center gap-4 uppercase italic font-black shadow-lg">
            <Send size={24} /> {isPending ? "Speichern..." : "Mitarbeiter anlegen"}
          </button>
        </form>
      </div>
    </div>
  );
}
