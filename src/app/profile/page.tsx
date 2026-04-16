"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import { 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  Calendar, 
  Fingerprint,
  Zap,
  Globe,
  Settings,
  ChevronRight
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center italic font-black text-foreground/20">
      AUTHENTICATING NODE...
    </div>
  );

  return (
    <SiteLayoutClient activePage="profile">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        
        {/* HEADER */}
        <header>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-primary blur-[30px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="relative w-24 h-24 md:w-32 md:h-32 rounded-[2rem] border-2 border-primary object-cover"
                />
              ) : (
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-card border-2 border-primary flex items-center justify-center">
                  <UserIcon size={48} className="text-primary" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-primary text-secondary p-2 rounded-xl shadow-lg">
                <ShieldCheck size={20} />
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-foreground italic uppercase tracking-tighter leading-none mb-2">
                User <br /> <span className="text-primary">Profile.</span>
              </h1>
              <div className="flex items-center gap-3">
                 <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">Identity Verified</span>
                 </div>
              </div>
            </div>
          </motion.div>
        </header>

        {/* CORE DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm space-y-8"
           >
              <div>
                <p className="text-[10px] font-black uppercase text-foreground/40 italic tracking-[0.3em] mb-4">Verifizierte Daten</p>
                <div className="space-y-6">
                   <div className="flex items-start gap-5">
                      <div className="p-3 bg-foreground/5 rounded-xl"><Mail size={20} className="text-primary" /></div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-foreground/20 italic tracking-widest">Primäre E-Mail</p>
                         <p className="text-lg font-black text-foreground italic tracking-tighter">{user?.email}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-5">
                      <div className="p-3 bg-foreground/5 rounded-xl"><Fingerprint size={20} className="text-blue-400" /></div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-foreground/20 italic tracking-widest">Name / Display</p>
                         <p className="text-lg font-black text-foreground italic tracking-tighter">{user?.displayName || "System Node #412"}</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="pt-8 border-t border-border">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-foreground/20" />
                      <span className="text-[10px] font-black uppercase text-foreground/20 italic tracking-widest">Member since</span>
                   </div>
                   <span className="text-xs font-black text-foreground italic">{user?.metadata.creationTime?.split(',')[1].split('2026')[0]} 2026</span>
                </div>
              </div>
           </motion.div>

           <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card p-8 rounded-[2rem] border border-border shadow-sm flex items-center justify-between group cursor-pointer hover:border-primary/40 transition-all"
              >
                 <div className="flex items-center gap-5">
                    <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform"><Zap className="text-primary" size={24} /></div>
                    <div>
                       <h3 className="font-black italic uppercase tracking-widest text-xs">Auth Method</h3>
                       <p className="text-xs text-foreground/40 italic font-medium">{user?.providerData[0]?.providerId === 'google.com' ? 'Connected with Google' : 'Local System Account'}</p>
                    </div>
                 </div>
                 <ChevronRight size={20} className="text-foreground/10 group-hover:text-primary transition-colors" />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card p-8 rounded-[2rem] border border-border shadow-sm flex items-center justify-between group cursor-pointer hover:border-blue-500/40 transition-all"
              >
                 <div className="flex items-center gap-5">
                    <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform"><Globe size={24} className="text-blue-400" /></div>
                    <div>
                       <h3 className="font-black italic uppercase tracking-widest text-xs">Network Node</h3>
                       <p className="text-xs text-foreground/40 italic font-medium">Auto-Syncing with powerplattform</p>
                    </div>
                 </div>
                 <ChevronRight size={20} className="text-foreground/10 group-hover:text-blue-400 transition-colors" />
              </motion.div>
           </div>
        </div>

        {/* SECURITY & ACTION ZONE */}
        <section className="bg-card border border-border rounded-[3rem] p-12 relative overflow-hidden group">
           <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[120%] bg-red-500/5 blur-[80px] rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="space-y-4 text-center md:text-left">
                 <h2 className="text-3xl font-black text-foreground italic uppercase tracking-tighter leading-tight">Gefahrenzone & <br /><span className="text-red-500">System-Reset.</span></h2>
                 <p className="text-xs text-foreground/40 italic font-medium max-w-sm">
                   Hier kannst du dich sicher vom System abmelden. Alle lokalen Cache-Daten werden dabei gelöscht und deine Session beendet.
                 </p>
              </div>
              <div className="flex gap-4">
                 <button className="px-8 py-4 bg-foreground/5 border border-border text-foreground font-black italic uppercase rounded-2xl tracking-widest text-sm hover:bg-foreground/10 transition-all flex items-center gap-3">
                    <Settings size={18} /> Settings
                 </button>
                 <button 
                  onClick={handleLogout}
                  className="px-8 py-4 bg-red-500 text-white font-black italic uppercase rounded-2xl tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-red-500/20 flex items-center gap-3"
                 >
                    <LogOut size={18} /> Logout
                 </button>
              </div>
           </div>
        </section>

        {/* WATERMARK */}
        <div className="text-center opacity-10">
           <div className="flex justify-center gap-1 mb-2">
              {[1,2,3,4,5].map(i => <div key={i} className="w-12 h-1 bg-foreground/20 rounded-full"></div>)}
           </div>
           <p className="text-[10px] font-black uppercase text-foreground tracking-[1em] italic">Identity verified // Identity secured</p>
        </div>
      </div>
    </SiteLayoutClient>
  );
}
