"use client";

import React from "react";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import AuthGuard from "@/components/AuthGuard";
import { ShieldCheck, Scale, FileText, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ImpressumPage() {
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
               <Scale size={40} />
               <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-foreground leading-[0.9]">
                  Impressum.
               </h1>
            </div>
            <p className="text-[10px] font-black uppercase text-primary italic tracking-widest">Gesetzliche Anbieterkennzeichnung</p>
          </header>

          <div className="bg-card border border-white/5 rounded-[3rem] p-10 md:p-16 shadow-2xl space-y-12">
            <section className="space-y-6">
              <h2 className="text-xl font-black italic uppercase text-foreground/40 tracking-widest border-b border-white/5 pb-4">Angaben gemäß § 5 TMG</h2>
              <div className="space-y-2 text-foreground/80 font-medium italic">
                <p className="text-2xl font-black text-white not-italic uppercase mb-4">PowerPlattform Digital Solutions</p>
                <p>[Dein Vorname Nachname]</p>
                <p>[Deine Straße und Hausnummer]</p>
                <p>[PLZ und Stadt]</p>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-black italic uppercase text-foreground/40 tracking-widest border-b border-white/5 pb-4">Kontakt</h2>
              <div className="space-y-2 text-foreground/80 font-medium italic">
                <p>Telefon: [Deine Telefonnummer]</p>
                <p>E-Mail: [Deine E-Mail-Adresse]</p>
                <p>Webseite: www.powerplattform.de</p>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-black italic uppercase text-foreground/40 tracking-widest border-b border-white/5 pb-4">Unternehmensgegenstand</h2>
              <p className="text-foreground/60 italic leading-relaxed">
                PowerPlattform ist ein spezialisierter Dienstleister für kundenspezifische Softwarelösungen. 
                Unsere Kernkompetenz liegt in der Entwicklung hochperformanter Webapplikationen, dem Cloud-Hosting 
                sowie der Konzeption und Veröffentlichung nativer App-Lösungen für iOS und Android. 
                Dieses Portal dient ausschließlich als Showcase zur Veranschaulichung unserer Programmier-Expertise.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-black italic uppercase text-foreground/40 tracking-widest border-b border-white/5 pb-4">Verantwortlich für den Inhalt</h2>
              <p className="text-foreground/80 font-medium italic">[Dein Vorname Nachname]</p>
            </section>
          </div>

          <footer className="text-center opacity-20">
             <div className="flex justify-center gap-8 mb-6">
                <ShieldCheck size={20} />
                <FileText size={20} />
             </div>
             <p className="text-[8px] font-black uppercase tracking-[0.5em] italic">PowerPlattform Legal Framework v1.0</p>
          </footer>
        </div>
      </SiteLayoutClient>
    </AuthGuard>
  );
}
