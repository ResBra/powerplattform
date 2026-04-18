"use client";

import React from "react";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import AuthGuard from "@/components/AuthGuard";
import { ShieldCheck, Lock, Eye, ArrowLeft, Database, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DatenschutzPage() {
  const router = useRouter();

  return (
    <AuthGuard>
      <SiteLayoutClient activePage="legal">
        <div className="max-w-4xl mx-auto space-y-12 pb-32">
          
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-4 text-[10px] font-black uppercase text-foreground/40 italic hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Zurück
          </button>

          <header className="space-y-4">
            <div className="flex items-center gap-4 text-primary">
               <Lock size={40} />
               <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-foreground leading-[0.9]">
                  Datenschutz.
               </h1>
            </div>
            <p className="text-[10px] font-black uppercase text-primary italic tracking-widest">DSGVO-Konforme Datenverarbeitung</p>
          </header>

          <div className="bg-card border border-white/5 rounded-[3rem] p-10 md:p-16 shadow-2xl space-y-12 text-sm md:text-base text-foreground/60 font-medium italic leading-relaxed">
            
            <section className="space-y-6">
              <h2 className="text-xl font-black italic uppercase text-foreground/40 tracking-widest border-b border-white/5 pb-4">1. Datenschutz auf einen Blick</h2>
              <p>
                Diese Anwendung dient als Showcase für die Programmierdienstleistungen von PowerPlattform. Alle erhobenen Daten (z.B. Logins, Marktplatz-Inserate) werden ausschließlich zur Demonstration technischer Funktionalitäten verarbeitet.
              </p>
            </section>

            <section className="space-y-8">
              <h2 className="text-xl font-black italic uppercase text-foreground/40 tracking-widest border-b border-white/5 pb-4 text-primary">2. Hosting & Cloud-Struktur</h2>
              
              <div className="grid gap-6">
                 <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center gap-3 text-white mb-2">
                       <Database size={18} className="text-primary" />
                       <span className="text-sm font-black uppercase tracking-widest">Firebase (Google Cloud)</span>
                    </div>
                    <p className="text-xs">
                       Wir nutzen Google Firebase für Authentifizierung (Anmeldung) und Firestore als Datenbank. Die Daten werden verschlüsselt auf Servern von Google verarbeitet, um eine Echtzeit-Synchronisierung zu gewährleisten.
                    </p>
                 </div>

                 <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center gap-3 text-white mb-2">
                       <Globe size={18} className="text-primary" />
                       <span className="text-sm font-black uppercase tracking-widest">Vercel Hosting & Blob</span>
                    </div>
                    <p className="text-xs">
                       Die App wird auf Vercel gehostet. Medieninhalte (Bilder im Marktplatz) werden über den Vercel Blob Storage gespeichert. Hierbei werden Zugriffsdaten wie die IP-Adresse kurzzeitig zur Bereitstellung der Inhalte verarbeitet.
                    </p>
                 </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-black italic uppercase text-foreground/40 tracking-widest border-b border-white/5 pb-4">3. Deine Rechte</h2>
              <p>
                Du hast jederzeit das Recht auf unentgeltliche Auskunft über Herkunft, Empfänger und Zweck deiner gespeicherten personenbezogenen Daten. Du hast außerdem ein Recht auf Berichtigung oder Löschung dieser Daten.
              </p>
            </section>

            <section className="space-y-6">
               <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2rem] text-primary space-y-4">
                  <div className="flex items-center gap-3 font-black uppercase italic tracking-widest">
                     <ShieldCheck size={20} /> Datensicherheit
                  </div>
                  <p className="text-xs leading-relaxed opacity-80">
                     Alle Verbindungen sind SSL-verschlüsselt. Wir setzen modernste Sicherheitsstandards ein, um die Integrität deiner Testdaten im Rahmen dieses Portals zu gewährleisten.
                  </p>
               </div>
            </section>
          </div>

          <footer className="text-center opacity-20">
             <p className="text-[8px] font-black uppercase tracking-[0.5em] italic">Updated: April 2026 | PowerPlattform Security Policy</p>
          </footer>
        </div>
      </SiteLayoutClient>
    </AuthGuard>
  );
}
