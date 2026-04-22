"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  User,
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
import { getGlobalSettings } from "@/app/actions/settings";

export default function ClientHome({ settings: initialSettings }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(initialSettings);
  const router = useRouter();
  
  const [metrics, setMetrics] = useState({
    cpu: 12,
    memory: 0,
    uptime: "00:00:00",
    start: Date.now()
  });

  useEffect(() => {
    // Firebase Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cloud Settings Loader
    const loadSettings = async () => {
      const cloudSettings = await getGlobalSettings();
      if (cloudSettings) setSettings(cloudSettings);
    };
    loadSettings();

    const interval = setInterval(() => {
      // @ts-ignore
      const performanceObj = typeof window !== 'undefined' ? window.performance : null;
      // @ts-ignore
      const memInfo = performanceObj ? performanceObj.memory : null;
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
      unsubscribeAuth();
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
      bgImage: "/images/showcase/market_bg.png",
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
      bgImage: "/images/showcase/qloud_bg.png",
      color: "from-blue-500/5"
    },
    {
      id: "profile",
      title: "User Profile",
      desc: "Zentrale Identitäts- & Sicherheitsverwaltung",
      icon: <User className="text-amber-500" size={32} />,
      status: "Verified",
      metrics: "Identity Core",
      href: "/modules/profile",
      bgImage: "/images/showcase/profile_bg.png",
      color: "from-amber-500/10"
    },
    {
      id: "command",
      title: "Command Center",
      desc: "Echtzeit-Überwachung & Systemsteuerung",
      icon: <Terminal className="text-indigo-500" size={32} />,
      status: "Active",
      metrics: "Root Access",
      href: "/modules/command",
      bgImage: "/images/showcase/command_bg.png",
      color: "from-indigo-500/10"
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
      desc: "Skalierbare Infrastrukturen mit globaler Node-Verteilung.",
      icon: <Globe className="text-blue-400" size={24} />
    },
    {
      title: "Native Apps",
      desc: "Konzeption und Deployment in App Stores (iOS & Android).",
      icon: <Smartphone className="text-amber-400" size={24} />
    }
  ];

  return (
    <div className="space-y-12 md:space-y-20 pb-20 max-w-full overflow-hidden">
      
      {/* SHOWCASE HERO SECTION - LIQUID BRANDING V1.6.2 */}
      <section className="relative p-6 md:p-16 lg:p-20 bg-card border border-white/5 rounded-[2.5rem] md:rounded-[4rem] lg:rounded-[5rem] overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none -rotate-12 translate-x-1/4 hidden lg:block">
            <Terminal size={400} />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="space-y-6 md:space-y-10">
            <div className="space-y-0 -mt-2">
               <div className="flex flex-col">
                  <span className="text-[clamp(2.5rem,10vw,7rem)] font-black italic uppercase tracking-tighter text-foreground leading-[0.85] drop-shadow-xl whitespace-nowrap">
                     Power
                  </span>
                  <span className="text-[clamp(2.5rem,10vw,7rem)] font-black italic uppercase tracking-tighter text-primary leading-[0.85] mt-2 drop-shadow-xl whitespace-nowrap">
                     Plattform.
                  </span>
               </div>
               <div className="pt-8">
                  <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full w-fit">
                     <span className="text-[8px] md:text-[10px] font-black uppercase text-primary italic tracking-[0.2em]">Service Showcase v1.6.2</span>
                  </div>
               </div>
            </div>

            <p className="text-muted text-sm md:text-xl italic font-medium leading-relaxed max-w-xl">
               Dieses Portal dient zur Veranschaulichung unserer Programmierdienstleistungen. 
               Wir entwickeln <span className="text-primary font-bold italic underline decoration-primary/40 underline-offset-8">Boutique-Software</span>, die exakt deinen Anforderungen entspricht.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
               {services.map((s) => (
                 <div key={s.title} className="p-4 md:p-6 bg-foreground/5 border border-white/5 rounded-2xl space-y-2 md:space-y-3 hover:bg-foreground/10 transition-colors group">
                    <div className="flex items-center gap-3">
                       <span className="group-hover:scale-110 transition-transform duration-500">{s.icon}</span>
                       <span className="text-[10px] md:text-xs font-black uppercase italic tracking-widest text-foreground">{s.title}</span>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-foreground/40 font-medium italic leading-relaxed">{s.desc}</p>
                 </div>
               ))}
            </div>
          </div>

          <div className="relative w-full lg:max-w-md ml-auto">
             <div className="absolute inset-0 bg-primary/10 blur-[40px] md:blur-[60px] rounded-full"></div>
             <div className="relative glass rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 space-y-6 md:space-y-8 shadow-2xl">
                <div className="flex items-center gap-4 border-b border-white/5 pb-4 md:pb-6">
                   <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary flex items-center justify-center text-secondary shadow-lg shadow-primary/20">
                      <Layers size={24} />
                   </div>
                   <div>
                      <h3 className="text-lg md:text-xl font-black italic uppercase text-foreground leading-none">Core Competence</h3>
                      <p className="text-[9px] md:text-[10px] font-black uppercase text-primary italic tracking-widest mt-1">Our Strategy</p>
                   </div>
                </div>
                <div className="space-y-4 md:space-y-6">
                   <div className="flex gap-4 md:gap-6">
                      <div className="text-primary font-black italic text-xl md:text-2xl">01</div>
                      <p className="text-[10px] md:text-xs text-foreground/60 italic font-medium leading-relaxed">Entwicklung individueller Softwärelösungen für komplexe Prozesse.</p>
                   </div>
                   <div className="flex gap-4 md:gap-6">
                      <div className="text-primary font-black italic text-xl md:text-2xl">02</div>
                      <p className="text-[10px] md:text-xs text-foreground/60 italic font-medium leading-relaxed">Optimierung für PWA inkl. Offline-Support & High-Speed Performance.</p>
                   </div>
                   <div className="flex gap-4 md:gap-6">
                      <div className="text-primary font-black italic text-xl md:text-2xl">03</div>
                      <p className="text-[10px] md:text-xs text-foreground/60 italic font-medium leading-relaxed">Integration nativer Schnittstellen und professionelles Store-Deployment.</p>
                   </div>
                </div>
                <div className="pt-2 md:pt-4 flex justify-center">
                   <div className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-2 md:py-3 bg-primary/10 border border-primary/20 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-primary italic text-center">
                      <Sparkles size={12} /> Ready for Global Production
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ACTIVE MODULES GRID - WITH BACKGROUND IMAGES */}
      <section className="space-y-6 md:space-y-8 px-2 md:px-0">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg md:text-xl font-black text-foreground/40 uppercase tracking-[0.3em] italic">Deployte Module.</h2>
          <span className="text-[9px] md:text-[10px] font-black text-primary uppercase italic tracking-widest px-3 py-1 bg-primary/10 rounded-lg flex items-center gap-2">
            <Rocket size={12} /> Live & Testbar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {activeModules.map((engine, idx) => (
            <motion.div 
              key={engine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => router.push(engine.href)}
              className="group relative p-8 md:p-12 bg-card border border-border rounded-[3rem] md:rounded-[4rem] shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-700 cursor-pointer overflow-hidden min-h-[350px] md:min-h-[400px] flex flex-col justify-between"
            >
               <div className="absolute inset-0 z-0">
                 <img 
                   src={engine.bgImage} 
                   alt="" 
                   className="w-full h-full object-cover opacity-20 md:opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-1000" 
                 />
                 {/* GRADIENT CONTROL: 'from-card' (Light Mode: White / Dark Mode: Dark) - Adjust here for shadow/depth */}
                 <div className={`absolute inset-0 bg-gradient-to-t from-card via-card/80 md:via-card/40 to-transparent group-hover:from-primary/20 transition-all duration-700`}></div>
              </div>
              
              <div className="relative z-10 flex flex-col h-full gap-10">
                <div className="flex items-start justify-between">
                  <div className="p-5 md:p-6 bg-foreground/10 backdrop-blur-md rounded-3xl group-hover:scale-110 group-hover:bg-primary transition-all duration-500 group-hover:text-secondary group-hover:shadow-xl group-hover:shadow-primary/30">
                    {engine.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary mb-1">{engine.status}</p>
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-foreground/20 leading-none">{engine.metrics}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-3xl md:text-5xl font-black text-foreground italic uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors leading-none">{engine.title}</h3>
                  <p className="text-foreground/40 text-xs md:text-lg font-medium italic max-w-sm leading-relaxed">{engine.desc}</p>
                </div>

                <div className="mt-4 flex items-center gap-4 text-[10px] md:text-sm font-black text-foreground group-hover:gap-6 transition-all uppercase tracking-[0.2em] italic">
                  Showcase betreten <ArrowRight size={20} className="text-primary" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-20 px-2 md:px-0">
          <div className="bg-card p-4 md:p-6 rounded-2xl md:rounded-3xl border border-border flex flex-col gap-3">
             <Cpu className="text-foreground/20" size={16} />
             <div>
                <p className="text-[7px] md:text-[8px] font-black uppercase text-foreground/20 italic tracking-widest">CPU Engine</p>
                <p className="text-md md:text-lg font-black text-foreground italic tracking-tighter">{metrics.cpu}%</p>
             </div>
          </div>
          <div className="bg-card p-4 md:p-6 rounded-2xl md:rounded-3xl border border-border flex flex-col gap-3">
             <Database className="text-foreground/20" size={16} />
             <div>
                <p className="text-[7px] md:text-[8px] font-black uppercase text-foreground/20 italic tracking-widest">Memory</p>
                <p className="text-md md:text-lg font-black text-foreground italic tracking-tighter">{metrics.memory} MB</p>
             </div>
          </div>
          <div className="bg-card p-4 md:p-6 rounded-2xl md:rounded-3xl border border-border flex flex-col gap-3">
             <Zap className="text-foreground/20" size={16} />
             <div>
                <p className="text-[7px] md:text-[8px] font-black uppercase text-foreground/20 italic tracking-widest">Session</p>
                <p className="text-md md:text-lg font-black text-foreground italic tracking-tighter tabular-nums">{metrics.uptime}</p>
             </div>
          </div>
          <div className="bg-card p-4 md:p-6 rounded-2xl md:rounded-3xl border border-border flex flex-col gap-3">
             <Activity className="text-foreground/20" size={16} />
             <div>
                <p className="text-[7px] md:text-[8px] font-black uppercase text-foreground/20 italic tracking-widest">Network</p>
                <p className="text-md md:text-lg font-black italic tracking-tighter text-primary">AUTHORIZED</p>
             </div>
          </div>
      </div>
    </div>
  );
}
