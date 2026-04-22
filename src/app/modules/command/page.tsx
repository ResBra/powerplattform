"use client";

import React from "react";
import { Terminal, Activity, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CommandPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background p-6 md:p-20 space-y-12">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors font-black uppercase text-xs tracking-widest italic"
      >
        <ArrowLeft size={16} /> Zurück zum Dashboard
      </button>

      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="p-6 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/20 text-indigo-500">
            <Terminal size={48} />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-foreground">Command Center</h1>
            <p className="text-indigo-500 font-black uppercase tracking-[0.3em] italic text-[10px] md:text-xs mt-2">Real-time Monitoring & Control</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
          <div className="p-8 bg-card border border-border rounded-[2.5rem] space-y-6 shadow-2xl">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <Activity className="text-indigo-500" />
              <h2 className="text-xl font-black italic uppercase text-foreground">System Auslastung</h2>
            </div>
            <div className="space-y-4">
              <p className="text-foreground/60 italic font-medium">Alle Knotenpunkte laufen im optimalen Bereich. Die globale Latenz liegt unter 12ms.</p>
              <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full w-fit">
                <span className="text-[10px] font-black uppercase text-primary italic tracking-widest">Optimal Performance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
