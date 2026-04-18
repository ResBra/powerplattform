"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Terminal, 
  ArrowRight, 
  Activity,
  Zap,
  Cpu,
  Database,
  Code2,
  Globe,
  Smartphone,
  Sparkles,
  ShoppingBag,
  Box,
  Layers,
  Rocket
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function ClientHome({ settings }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    cpu: 12,
    memory: 0,
    uptime: "00:00:00",
    start: Date.now()
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    const interval = setInterval(() => {
      // @ts-ignore
      const memInfo = window.performance.memory;
      const memGB = memInfo ? (memInfo.usedJSHeapSize / (1024 * 1024)).toFixed(1) : "0.4";
      const randomLoad = Math.floor(Math.random() * 8) + 8;
      const diff = Math.floor((Date.now() - metrics.start) / 1000);
      const h = Math.floor(diff / 3600).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');

      setMetrics(prev => ({
        ...prev,
        cpu: randomLoad,
        memory: parseFloat(memGB),
        uptime: `${h}:${m}:${s}`
      }));
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [metrics.start]);

  const activeModules = [
    {
      id: "market",
      title: "Little Market",
      desc: "Vollständiger Marktplatz mit P2P-Messaging",
      icon: <ShoppingBag className="text-primary" size={32} />,
      status: "Operational",
      metrics: "Live Framework",
      href: "/modules/market",
      color: "from-primary/10"
    },
    {
      id: "qloud",
      title: "Qloud Hub",
      desc: "Zentralisiertes Node- & Group Management",
      icon: <Box className="text-blue-500" size={32} />,
      status: "Connected",
      metrics: "Safe Hub",
      href: "/modules/qloud",
      color: "from-blue-500/5"
    }
  ];

  const services = [
    {
      title: "Programmierung",
      desc: "Maßgeschneiderte Full-Stack Lösungen auf Basis von Next.js & React.",
      icon: <Code2 className="text-primary" size={24} />
    },
    {
      title: "Cloud Hosting",
      desc: "Skalierbare Infrastrukturen mit globaler Node-Verteilung und SSL.",
      icon: <Globe className="text-blue-400" size={24} />
    },
    {
      title: "Native Apps",
      desc: "Konzeption und Deployment in App Stores (iOS & Android).",
      icon: <Smartphone className="text-amber-400" size={24} />
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* SHOWCASE HERO SECTION */}
      <section className="relative p-10 md:p-20 bg-card border border-white/5 rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none -rotate-12 translate-x-1/4">
            <Terminal size={400} />
        </div>
        
        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
               <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full w-fit">
                  <span className="text-[10px] font-black uppercase text-primary italic tracking-[0.2em]">Service Showcase v1.5</span>
               </div>
               <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-foreground leading-[0.85]">
                  Power<span className="text-primary">Plattform.</span>
               </h1>
            </div>

            <p className="text-foreground/60 text-lg md:text-xl italic font-medium leading-relaxed max-w-xl">
              Dieses Portal dient zur Veranschaulichung unserer Programmierdienstleistungen. 
              Wir entwickeln hochspezifische <span className="text-white italic">Boutique-Software</span>, die exakt auf die 
              Anforderungen unserer Kunden zugeschnitten ist.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {services.map((s) => (
                 <div key={s.title} className="p-6 bg-foreground/5 border border-white/5 rounded-2xl space-y-3 hover:bg-foreground/10 transition-colors">
                    <div className="flex items-center gap-3">
                       {s.icon}
                       <span className="text-xs font-black uppercase italic tracking-widest text-foreground">{s.title}</span>
                    </div>
                    <p className="text-[10px] text-foreground/40 font-medium italic leading-relaxed">{s.desc}</p>
                 </div>
               ))}
            </div>
          </div>

          <div className="relative">
             <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full"></div>
             <div className="relative bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 space-y-8 shadow-2xl">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                   <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-secondary shadow-lg shadow-primary/20">
                      <Layers size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black italic uppercase text-foreground leading-none">Core Competence</h3>
                      <p className="text-[10px] font-black uppercase text-primary italic tracking-widest mt-1">Our Strategy</p>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="flex gap-6">
                      <div className="text-primary font-black italic text-2xl">01</div>
                      <p className="text-xs text-foreground/60 italic font-medium leading-relaxed">Entwicklung individueller Softwärelösungen für komplexe Geschäftsprozesse.</p>
                   </div>
                   <div className="flex gap-6">
                      <div className="text-primary font-black italic text-2xl">02</div>
                      <p className="text-xs text-foreground/60 italic font-medium leading-relaxed">Optimierung für Progressive Web Apps (PWA) inkl. Offline-Support.</p>
                   </div>
                   <div className="flex gap-6">
                      <div className="text-primary font-black italic text-2xl">03</div>
                      <p className="text-xs text-foreground/60 italic font-medium leading-relaxed">Integration nativer Schnittstellen und Store-Deployment Expertise.</p>
                   </div>
                </div>
                <div className="pt-4 flex justify-center">
                   <div className="flex items-center gap-4 px-6 py-3 bg-primary/10 border border-primary/20 rounded-full text-[8px] font-black uppercase tracking-[0.3em] text-primary italic">
                      <Sparkles size={12} /> Ready for Production
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ACTIVE MODULES GRID */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-black text-foreground/40 uppercase tracking-[0.3em] italic">Deployte Module.</h2>
          <span className="text-[10px] font-black text-primary uppercase italic tracking-widest px-3 py-1 bg-primary/10 rounded-lg flex items-center gap-2">
            <Rocket size={12} /> Live & Testbar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeModules.map((engine, idx) => (
            <motion.div 
              key={engine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => router.push(engine.href)}
              className="group relative p-10 bg-card border border-border rounded-[3.5rem] shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer overflow-hidden lg:min-h-[300px] flex flex-col justify-between"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${engine.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative z-10 flex flex-col h-full gap-10">
                <div className="flex items-start justify-between">
                  <div className="p-6 bg-foreground/5 rounded-3xl group-hover:scale-110 group-hover:bg-primary transition-all duration-500 group-hover:text-secondary">
                    {engine.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{engine.status}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 leading-none">{engine.metrics}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-3xl md:text-4xl font-black text-foreground italic uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">{engine.title}</h3>
                  <p className="text-foreground/40 text-sm md:text-base font-medium italic max-w-sm">{engine.desc}</p>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs font-black text-foreground group-hover:gap-6 transition-all uppercase tracking-[0.2em] italic">
                  Showcase betreten <ArrowRight size={18} className="text-primary" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* METRICS & FOOTER PREVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-20 opacity-40 hover:opacity-100 transition-opacity">
          <div className="bg-card p-6 rounded-3xl border border-border flex flex-col gap-3">
             <Cpu className="text-foreground/20" size={16} />
             <div>
                <p className="text-[8px] font-black uppercase text-foreground/20 italic tracking-widest">CPU Engine</p>
                <p className="text-lg font-black text-foreground italic tracking-tighter">{metrics.cpu}%</p>
             </div>
          </div>
          <div className="bg-card p-6 rounded-3xl border border-border flex flex-col gap-3">
             <Database className="text-foreground/20" size={16} />
             <div>
                <p className="text-[8px] font-black uppercase text-foreground/20 italic tracking-widest">Memory</p>
                <p className="text-lg font-black text-foreground italic tracking-tighter">{metrics.memory} MB</p>
             </div>
          </div>
          <div className="bg-card p-6 rounded-3xl border border-border flex flex-col gap-3">
             <Zap className="text-foreground/20" size={16} />
             <div>
                <p className="text-[8px] font-black uppercase text-foreground/20 italic tracking-widest">Session</p>
                <p className="text-lg font-black text-foreground italic tracking-tighter tabular-nums">{metrics.uptime}</p>
             </div>
          </div>
          <div className="bg-card p-6 rounded-3xl border border-border flex flex-col gap-3">
             <Activity className="text-foreground/20" size={16} />
             <div>
                <p className="text-[8px] font-black uppercase text-foreground/20 italic tracking-widest">Network</p>
                <p className="text-lg font-black italic tracking-tighter text-primary">AUTHORIZED</p>
             </div>
          </div>
      </div>
    </div>
  );
}
