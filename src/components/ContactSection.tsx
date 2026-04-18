"use client";

import { useState } from "react";
import { Phone, Mail, Globe, Camera, MessageCircle, Send, CheckCircle, ChevronRight, X } from "lucide-react";
import { CONTACT_CONFIG, SUBJECT_OPTIONS } from "@/data/contactConfig";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ContactSection({ settings }: { settings?: any }) {
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Fallback to static config if no DB settings provided
  const config = {
    phone: settings?.phone || CONTACT_CONFIG.phone,
    emergencyPhone: settings?.emergencyPhone || "0173 4149664",
    email: settings?.email || CONTACT_CONFIG.email,
    address: settings?.address || CONTACT_CONFIG.address,
    whatsapp: settings?.whatsapp ? `https://wa.me/${settings.whatsapp}` : CONTACT_CONFIG.whatsapp,
    instagram: settings?.instagram || CONTACT_CONFIG.socials.instagram,
    facebook: settings?.facebook || CONTACT_CONFIG.socials.facebook,
    mapsEmbedUrl: CONTACT_CONFIG.mapsEmbedUrl
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      status: "NEU",
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "contact_requests"), data);
      setFeedback({ success: true, message: "Anfrage erfolgreich gesendet! Wir melden uns bei Ihnen." });
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Firebase Error:", error);
      setFeedback({ success: false, message: "Fehler beim Senden. Bitte versuchen Sie es später erneut." });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section id="kontakt" className="relative z-30 py-24 px-4">
      <div className="max-w-[1500px] mx-auto overflow-hidden rounded-[3rem] shadow-2xl flex flex-col lg:flex-row bg-white/10 backdrop-blur-2xl border border-white/10">
        
        {/* LEFT COLUMN: Contact Info & Map */}
        <div className="w-full lg:w-5/12 bg-gradient-to-br from-green-800/90 to-green-950/95 p-10 md:p-16 text-white flex flex-col gap-12 relative overflow-hidden">
          {/* Decorative background logo */}
          <div className="absolute top-0 right-0 opacity-10 -translate-y-1/4 translate-x-1/4">
             <img src="/logo_light.png" alt="" className="w-80 h-auto grayscale brightness-200" />
          </div>

          <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left gap-10">
            <div className="flex flex-col md:flex-row gap-10 lg:gap-20 w-full text-center lg:text-left">
              {/* Regular Phone Block */}
              <div className="flex flex-col items-center lg:items-start gap-4 group">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-all duration-500 shadow-xl shadow-black/10">
                  <Phone size={32} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white/40 text-[11px] font-black uppercase tracking-widest mb-1">Rufnummer</span>
                  <a href={`tel:${config.phone.replace(/\s/g, '')}`} className="text-xl md:text-2xl font-black italic tracking-tight hover:text-primary-light transition-colors">
                    {config.phone}
                  </a>
                </div>
              </div>

              {/* 24/7 Emergency Block */}
              <div className="flex flex-col items-center lg:items-start gap-4 group">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center animate-pulse shadow-xl shadow-red-600/40 relative">
                  <Phone size={32} />
                  <span className="absolute -top-3 -right-3 bg-white text-red-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-lg">24/7</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-red-400 text-[11px] font-black uppercase tracking-widest mb-1">24/7 Notrufnummer</span>
                  <a href={`tel:${config.emergencyPhone.replace(/\s/g, '')}`} className="text-xl md:text-2xl font-black italic tracking-tight text-white hover:text-red-400 transition-colors">
                    {config.emergencyPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Email Block */}
            <div className="flex flex-col items-center lg:items-start gap-4 group">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-all duration-500">
                <Mail size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">E-Mail Adresse</span>
                <a href={`mailto:${config.email}`} className="text-xl md:text-2xl font-black italic tracking-tight hover:text-primary-light transition-colors">
                  {config.email}
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-4 mt-4">
              {/* Facebook */}
              <a href={config.facebook} target="_blank" className="w-12 h-12 bg-[#1877F2]/80 hover:bg-[#1877F2] rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              
              {/* Instagram */}
              <a href={config.instagram} target="_blank" className="w-12 h-12 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* WhatsApp */}
              <a href={config.whatsapp} target="_blank" className="w-12 h-12 bg-[#25D366]/80 hover:bg-[#25D366] rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Map Embed & Address */}
          <div className="mt-auto flex flex-col gap-6">
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-xl h-[300px] group transition-all duration-500 hover:scale-[1.02]">
              <iframe 
                src={config.mapsEmbedUrl} 
                className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-1000"
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              <div className="absolute inset-0 pointer-events-none border-[3px] border-white/5 rounded-[2rem]"></div>
            </div>

            {/* Address Display Below Map */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex items-start gap-4 group hover:bg-white/10 transition-all duration-500">
               <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Globe size={20} />
               </div>
               <div className="flex flex-col">
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Standort</span>
                  <p className="text-sm md:text-base font-bold text-white/90 leading-relaxed italic">
                    {config.address}
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Contact Form */}
        <div className="w-full lg:w-7/12 p-10 md:p-16 bg-white/5 flex flex-col relative">
          
          <div className="mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-secondary italic uppercase mb-4">Kontakt-<span className="text-primary italic">Anfrage.</span></h2>
            <p className="text-text-muted">Schreiben Sie uns eine Nachricht und wir melden uns schnellstmöglich bei Ihnen.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary/40 ml-2">Ihr Name</label>
                <input required name="name" type="text" placeholder="Beispiel Name" className="w-full bg-white/50 border border-black/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary/40 ml-2">Telefonnummer</label>
                <input name="phone" type="tel" placeholder="0176 / ..." className="w-full bg-white/50 border border-black/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary/40 ml-2">E-Mail Adresse</label>
              <input required name="email" type="email" placeholder="name@beispiel.de" className="w-full bg-white/50 border border-black/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary/40 ml-2">Betreff / Anliegen</label>
              <select name="subject" className="w-full bg-white/50 border border-black/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer">
                {SUBJECT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary/40 ml-2">Ihre Nachricht</label>
              <textarea required name="message" rows={4} placeholder="Wie können wir Ihnen weiterhelfen?" className="w-full bg-white/50 border border-black/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"></textarea>
            </div>

            {/* Privacy Checkbox */}
            <div className="mt-4 flex flex-col gap-4">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative mt-1">
                  <input required type="checkbox" className="peer sr-only" />
                  <div className="w-6 h-6 border-2 border-secondary/20 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                  <X className="absolute inset-0 text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-75 transition-all" />
                </div>
                <span className="text-xs text-text-muted leading-relaxed group-hover:text-secondary transition-colors">
                  Ich bin mit der Speicherung meiner eingegebenen Daten zur Kontaktaufnahme einverstanden. Weitere Informationen finden Sie in unserer Datenschutzerklärung.
                </span>
              </label>
            </div>

            {/* SECURITY LAYER 1 & 2: Honeypot & Timestamp */}
            <div className="hidden" aria-hidden="true">
              <input type="text" name="hp_field" tabIndex={-1} autoComplete="off" />
              <input type="hidden" name="form_token" value={Date.now()} />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <button 
                type="submit" 
                disabled={isPending}
                className="flex-1 btn-primary py-5 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-wait uppercase italic"
              >
                {isPending ? "Wird gesendet..." : "Anfrage absenden"}
                {!isPending && <Send size={20} />}
              </button>

              <a 
                href={config.whatsapp} 
                target="_blank" 
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-5 rounded-full px-8 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] shadow-xl hover:shadow-green-500/20 uppercase italic text-sm md:text-base whitespace-nowrap"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30">
                  <MessageCircle size={20} />
                </div>
                WhatsApp Nachricht
              </a>
            </div>

            {/* Feedback Messages */}
            {feedback && (
              <div className={`mt-6 p-5 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ${feedback.success ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {feedback.success ? <CheckCircle size={24} /> : <X size={24} />}
                <p className="font-bold">{feedback.message}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
