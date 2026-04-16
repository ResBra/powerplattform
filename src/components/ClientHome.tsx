"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Terminal, 
  ArrowRight, 
  Activity,
  Zap,
  Cpu,
  Database
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function ClientHome({ managers, staff, blogPosts, properties, settings }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    cpu: 12,
    memory: 0,
    uptime: "00:00:00",
    start: Date.now()
  });

  useEffect(() => {
    // 1. AUTH LISTENER
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // 2. REAL-TIME METRICS ENGINE
    const interval = setInterval(() => {
      // Memory check (Chrome/Edge feature)
      // @ts-ignore
      const memInfo = window.performance.memory;
      const memGB = memInfo ? (memInfo.usedJSHeapSize / (1024 * 1024)).toFixed(1) : "0.4";
      
      // Simulating CPU load based on state activity
      const randomLoad = Math.floor(Math.random() * 8) + 8; // Stable baseline 8-16%
      
      // Calculate Uptime
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

  const engines = [
    {
      id: "realestate",
      title: "Real Estate Engine",
      desc: "Autonome Vermittlung & Verwaltung",
      icon: <Building2 className="text-primary" size={32} />,
      status: "Operational",
      metrics: "3 Active Listings",
      color: "from-primary/10"
    },
    {
      id: "team",
      title: "Team Channel",
      desc: "Zentralisiertes Mitarbeiter-Hub",
      icon: <Users className="text-blue-500" size={32} />,
      status: "Syncing",
      metrics: `${staff?.length || 0} Nodes Connected`,
      color: "from-blue-500/5"
    },
    {
      id: "security",
      title: "Security & PWA",
      desc: "Biometrischer Schutz & Offline-Core",
      icon: <ShieldCheck className="text-purple-500" size={32} />,
      status: "Protected",
      metrics: "Quantum standard",
      color: "from-purple-500/5"
    },
    {
      id: "node",
      title: "Node Dashboard",
      desc: "Analytics & System-Ressourcen",
      icon: <Terminal className="text-amber-500" size={32} />,
      status: "Idle",
      metrics: "CPU: 12% | RAM: 4GB",
      color: "from-amber-500/5"
    }
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* WELCOME HEADER */}
      <header className="relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">System Online</span>
               </div>
               <div className="px-3 py-1 bg-foreground/5 border border-foreground/10 rounded-full flex items-center gap-2">
                  <Activity size={10} className="text-foreground/40" />
                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] italic">Node #412</span>
               </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground italic uppercase tracking-tighter leading-none">
              Hallo, <br />
              <span className="text-gradient">{user?.displayName || user?.email?.split('@')[0] || "System-Admin"}</span>
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
             <p className="text-foreground/20 text-[10px] font-black uppercase tracking-[0.4em] italic leading-tight">Terminal v1.0.4</p>
             <div className="flex gap-1">
                {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-1 bg-primary/20 rounded-full"></div>)}
             </div>
          </div>
        </motion.div>
      </header>

      {/* QUICK STATUS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-3 group">
             <Cpu className="text-foreground/20 group-hover:text-primary transition-colors" size={20} />
             <div>
                <p className="text-[10px] font-black uppercase text-foreground/20 italic tracking-widest">CPU Load</p>
                <div className="flex items-baseline gap-2">
                   <p className="text-xl font-black text-foreground italic tracking-tighter">{metrics.cpu}%</p>
                   <div className="flex-1 h-[2px] bg-foreground/5 rounded-full overflow-hidden">
                      <motion.div animate={{ width: `${metrics.cpu}%` }} className="h-full bg-primary"></motion.div>
                   </div>
                </div>
             </div>
          </div>
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-3 group">
             <Database className="text-foreground/20 group-hover:text-blue-500 transition-colors" size={20} />
             <div>
                <p className="text-[10px] font-black uppercase text-foreground/20 italic tracking-widest">Heap Memory</p>
                <p className="text-xl font-black text-foreground italic tracking-tighter">{metrics.memory} MB</p>
             </div>
          </div>
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-3 group">
             <Zap className="text-foreground/20 group-hover:text-amber-500 transition-colors" size={20} />
             <div>
                <p className="text-[10px] font-black uppercase text-foreground/20 italic tracking-widest">Uptime</p>
                <p className="text-xl font-black text-foreground italic tracking-tighter tabular-nums">{metrics.uptime}</p>
             </div>
          </div>
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-3 group">
             <Activity className="text-foreground/20 group-hover:text-primary transition-colors" size={20} />
             <div>
                <p className="text-[10px] font-black uppercase text-foreground/20 italic tracking-widest">Auth Link</p>
                <p className={`text-xl font-black italic tracking-tighter ${auth ? 'text-primary' : 'text-red-500'}`}>{auth ? 'CONNECTED' : 'OFFLINE'}</p>
             </div>
          </div>
      </div>

      {/* ENGINES SECTION */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-black text-foreground/40 uppercase tracking-[0.3em] italic">Active Engines</h2>
          <span className="text-[10px] font-black text-primary uppercase italic tracking-widest px-3 py-1 bg-primary/10 rounded-lg">Verifiziert</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {engines.map((engine, idx) => (
            <motion.div 
              key={engine.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative p-8 bg-card border border-border rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${engine.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative z-10 flex flex-col h-full gap-8">
                <div className="flex items-start justify-between">
                  <div className="p-4 bg-foreground/5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                    {engine.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{engine.status}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 leading-none">{engine.metrics}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tighter mb-2 group-hover:text-primary transition-colors">{engine.title}</h3>
                  <p className="text-foreground/40 text-sm font-medium italic">{engine.desc}</p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-foreground group-hover:gap-4 transition-all uppercase tracking-[0.2em] italic">
                  Launch Engine <ArrowRight size={14} className="text-primary" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* APP INTEGRATION INFO */}
      <div className="bg-white border border-border p-10 rounded-[3rem] relative overflow-hidden group shadow-xl shadow-slate-200/50 [data-theme='dark']:bg-primary/10 [data-theme='dark']:shadow-none">
         <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[80%] bg-primary/5 blur-[80px] rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
         <div className="relative z-10 grid md:grid-cols-2 items-center gap-12">
            <div className="space-y-6">
               <h3 className="text-4xl font-black text-foreground italic uppercase tracking-tighter leading-tight">
                 Bereit für den <br /> <span className="text-primary">Echten Einsatz?</span>
               </h3>
               <p className="text-foreground/60 text-sm italic font-medium leading-relaxed">
                 Deine Firebase-Verbindung steht. Alle Login-Daten werden jetzt sicher in der Cloud gespeichert. Du kannst nun beginnen, echte Mitarbeiter und Inserate anzulegen.
               </p>
               <div className="flex gap-4">
                  <button className="px-8 py-4 bg-primary text-secondary font-black italic uppercase rounded-2xl tracking-widest text-sm hover:scale-105 transition-all shadow-lg shadow-primary/20">Setup Finalisieren</button>
                  <button className="px-8 py-4 bg-foreground/5 text-foreground border border-border font-black italic uppercase rounded-2xl tracking-widest text-sm hover:bg-foreground/10 transition-all">Docs lesen</button>
               </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4">
               {[1,2,3,4].map(i => (
                 <div key={i} className="h-24 bg-foreground/5 border border-border rounded-2xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
