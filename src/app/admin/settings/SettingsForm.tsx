"use client";

import { useState } from "react";
import { updateGlobalSettings } from "@/app/actions/settings";
import { Save, Mail, Phone, MessageCircle, Instagram, Facebook, MapPin, Server, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateGlobalSettings(formData);

    setMessage({ success: result.success, text: result.message });
    setIsPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. CONTACT INFO */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-black/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
        
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4 mb-8 flex items-center gap-3">
          <Phone size={18} /> Kontakt-Informationen
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Standard Rufnummer</label>
            <input name="phone" type="text" defaultValue={initialSettings?.phone} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-red-400 ml-2">24/7 Notrufnummer</label>
            <input name="emergencyPhone" type="text" defaultValue={initialSettings?.emergencyPhone} className="w-full bg-red-50/30 border border-red-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-red-500/10 outline-none font-bold italic text-red-600" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Offizielle E-Mail</label>
            <input name="email" type="email" defaultValue={initialSettings?.email} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">WhatsApp Nummer (Nur Zahlen, exkl. +)</label>
            <input name="whatsapp" type="text" defaultValue={initialSettings?.whatsapp} placeholder="49151..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Standort / Adresse</label>
          <input name="address" type="text" defaultValue={initialSettings?.address} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
        </div>
      </div>

      {/* 2. SOCIAL MEDIA */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-black/5 relative overflow-hidden group">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4 mb-8 flex items-center gap-3">
          <Instagram size={18} /> Social Media Links
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Instagram URL</label>
            <div className="relative">
              <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input name="instagram" type="text" defaultValue={initialSettings?.instagram} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Facebook URL</label>
            <div className="relative">
              <Facebook className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input name="facebook" type="text" defaultValue={initialSettings?.facebook} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. SMTP SETTINGS */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-bl-[10rem] -mr-20 -mt-20 blur-3xl"></div>
        
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary border-b border-white/10 pb-4 mb-8 flex items-center gap-3">
          <Server size={18} /> E-Mail Server (SMTP) Konfiguration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">SMTP Host</label>
            <input name="smtpHost" type="text" defaultValue={initialSettings?.smtpHost} placeholder="smtp.strato.de" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/20 outline-none font-bold italic text-white" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">SMTP Port</label>
            <input name="smtpPort" type="number" defaultValue={initialSettings?.smtpPort} placeholder="465" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/20 outline-none font-bold italic text-white" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">SMTP Benutzer</label>
            <input name="smtpUser" type="text" defaultValue={initialSettings?.smtpUser} placeholder="info@..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/20 outline-none font-bold italic text-white" />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 max-w-md">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2 flex items-center gap-2">
            <ShieldCheck size={12} /> SMTP Passwort
          </label>
          <div className="relative">
            <input 
              name="smtpPassword" 
              type={showPassword ? "text" : "password"} 
              defaultValue={initialSettings?.smtpPassword} 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/20 outline-none font-bold tracking-widest text-white" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <p className="mt-6 text-[10px] text-white/30 italic">
          * Diese Daten werden benötigt, um Kontaktanfragen direkt von Ihrer Strato-Mailadresse zu versenden.
        </p>
      </div>

      {message && (
        <div className={`p-6 rounded-3xl text-center font-bold italic animate-in zoom-in duration-300 ${message.success ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-red-500 text-white shadow-lg shadow-red-500/20"}`}>
          {message.text}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-primary hover:bg-primary-dark text-white font-black py-6 rounded-[2rem] text-xl flex items-center justify-center gap-4 transition-all hover:scale-[1.01] shadow-xl shadow-primary/20 disabled:opacity-50 uppercase italic"
      >
        <Save size={24} />
        {isPending ? "Speichern..." : "Einstellungen speichern"}
      </button>

    </form>
  );
}
