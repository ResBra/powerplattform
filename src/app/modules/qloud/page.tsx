"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import { 
  Cloud, 
  Plus, 
  Users, 
  ArrowRight, 
  Zap,
  Lock,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { createGroup, getGroupsForUser } from "./actions";
import Link from "next/link";

export default function QloudPage() {
  const [user, setUser] = useState<User | null>(null);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const groups = await getGroupsForUser(u.uid);
        setMyGroups(groups);
      }
      setFetching(false);
    });
    return () => unsub();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setIsLoading(true);
    
    const result = await createGroup({
      name: groupName,
      description: groupDesc,
      adminId: user.uid
    });

    if (result.success) {
      const updatedGroups = await getGroupsForUser(user.uid);
      setMyGroups(updatedGroups);
      setIsCreateOpen(false);
      setGroupName("");
      setGroupDesc("");
    } else {
      setError(result.error || "Ein unbekannter Fehler ist aufgetreten.");
    }
    setIsLoading(false);
  };

  const isFormValid = groupName.trim() !== "" && groupDesc.trim() !== "";

  return (
    <SiteLayoutClient activePage="qloud">
      <div className="space-y-12 pb-20">
        
        {/* HERO SECTION */}
        <header className="relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                   <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Module Active</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-foreground italic uppercase tracking-tighter leading-none mb-6">
                Qloud <br /> <span className="text-gradient">Hub & Social.</span>
              </h1>
              <p className="text-foreground/40 text-lg font-medium italic leading-relaxed">
                Erstelle private Gruppen für deine Events. Teile Bilder, chatte in Echtzeit und behalte die volle Kontrolle über deine Inhalte.
              </p>
            </div>
            
            <div className="flex gap-4">
               <button 
                onClick={() => { setIsCreateOpen(true); setError(null); }}
                className="px-8 py-5 bg-primary text-secondary font-black italic uppercase rounded-2xl tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
               >
                  <Plus size={20} /> Gruppe gründen
               </button>
            </div>
          </motion.div>
        </header>

        {/* YOUR GROUPS GRID */}
        <section className="space-y-8">
           <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-black text-foreground/40 uppercase tracking-[0.3em] italic">Deine Aktiven Gruppen</h2>
              <span className="text-[10px] font-black text-primary uppercase italic tracking-widest px-3 py-1 bg-primary/10 rounded-lg">Live Sync</span>
           </div>
           
           {fetching ? (
             <div className="py-20 flex justify-center italic font-black text-foreground/10 animate-pulse uppercase tracking-[0.5em]">Lade Nodes...</div>
           ) : myGroups.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.map((group, idx) => (
                  <Link key={group.id} href={`/modules/qloud/${group.id}`}>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group p-8 bg-card border border-border rounded-[2.5rem] hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-xl relative overflow-hidden"
                    >
                       <div className="relative z-10 flex flex-col gap-6">
                          <div className="flex items-center justify-between">
                             <div className="p-3 bg-foreground/5 rounded-xl text-primary"><Users size={20} /></div>
                             <span className="text-[10px] font-black uppercase text-foreground/20 italic tracking-widest">{group._count.members} Members</span>
                          </div>
                          <div>
                             <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tighter mb-1 group-hover:text-primary transition-colors">{group.name}</h3>
                             <p className="text-foreground/40 text-xs italic line-clamp-1">{group.description || "Keine Beschreibung"}</p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-all uppercase italic tracking-[0.2em]">
                             Beitreten <ArrowRight size={14} />
                          </div>
                       </div>
                       <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-primary/5 blur-3xl rounded-full group-hover:scale-150 transition-transform"></div>
                    </motion.div>
                  </Link>
                ))}
             </div>
           ) : (
             <div className="py-20 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center border border-dashed border-foreground/20">
                   <Users className="text-foreground/20" size={32} />
                 </div>
                 <div>
                    <p className="font-black italic uppercase text-foreground/20 tracking-widest text-sm">Bereit für deine erste Qloud?</p>
                 </div>
              </div>
           )}
        </section>
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
             <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-[3rem] shadow-2xl p-10 overflow-hidden"
             >
                <div className="space-y-8">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-primary rounded-2xl text-secondary"><Plus size={24} /></div>
                      <div>
                         <h2 className="text-2xl font-black italic uppercase tracking-tighter">Neue <span className="text-primary">Gruppe.</span></h2>
                         <p className="text-[10px] font-black uppercase text-foreground/40 italic tracking-widest leading-none">Erstelle deine private Qloud-Instanz</p>
                      </div>
                   </div>

                   {error && (
                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                        <AlertCircle className="text-red-500 shrink-0" size={18} />
                        <p className="text-[10px] font-black uppercase text-red-500 italic tracking-widest">{error}</p>
                     </motion.div>
                   )}

                   <form onSubmit={handleCreateGroup} className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase italic text-foreground/40 ml-2 tracking-widest">Name des Events</label>
                         <input 
                            type="text" 
                            required
                            placeholder="Z.B. GÜLER HOCHZEIT" 
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full bg-foreground/5 border border-border rounded-2xl py-5 px-6 font-black italic uppercase text-sm outline-none focus:border-primary transition-all"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase italic text-foreground/40 ml-2 tracking-widest">Beschreibung</label>
                         <textarea 
                            required
                            placeholder="FAMILIENTREFF, ETC..." 
                            value={groupDesc}
                            onChange={(e) => setGroupDesc(e.target.value)}
                            className="w-full bg-foreground/5 border border-border rounded-2xl py-5 px-6 font-medium italic text-sm outline-none focus:border-primary transition-all min-h-[100px]"
                         />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                         <button 
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                            className="py-5 bg-foreground/5 text-foreground font-black italic uppercase tracking-widest text-xs rounded-2xl border border-border hover:bg-foreground/10 transition-all"
                         >
                            Abbrechen
                         </button>
                         <button 
                            type="submit"
                            disabled={isLoading}
                            className={`py-5 font-black italic uppercase tracking-widest text-[11px] rounded-2xl transition-all text-center relative overflow-hidden group ${isFormValid ? 'bg-primary text-secondary shadow-xl shadow-primary/30 hover:scale-105 active:scale-95' : 'bg-foreground/5 text-foreground/20 border border-border grayscale cursor-not-allowed'}`}
                         >
                            {isLoading ? "Synchronisiere..." : "Gruppe Starten"}
                            {isFormValid && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                         </button>
                      </div>
                   </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SiteLayoutClient>
  );
}
