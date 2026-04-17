"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import { 
  Cloud, 
  Plus, 
  Users, 
  ArrowRight, 
  Zap,
  Lock,
  MessageSquare,
  AlertCircle,
  Scan,
  Search,
  X,
  CheckCircle2,
  Clock
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { 
  createGroup, 
  getGroupsForUser, 
  searchGroupsAction, 
  requestJoinAction 
} from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Dynamischer Import für den QR-Scanner (Client-Side only)
const QrScanner = dynamic(() => import("@/components/QrScanner"), { 
  ssr: false,
  loading: () => <div className="aspect-square w-full bg-black/40 rounded-[2rem] animate-pulse flex items-center justify-center font-black text-white italic">Kamera wird kalibriert...</div>
});

export default function QloudPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Join Modal State
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [joinStatus, setJoinStatus] = useState<string | null>(null);

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

  // SEARCH LOGIC
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        const results = await searchGroupsAction(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setIsLoading(true);
    
    const result = await createGroup({
      name: groupName,
      description: groupDesc,
      adminId: user.uid,
      adminName: user.displayName || "Admin"
    });

    if (result.success) {
      const updatedGroups = await getGroupsForUser(user.uid);
      setMyGroups(updatedGroups);
      setIsCreateOpen(false);
      setGroupName("");
      setGroupDesc("");
    } else {
      setError(result.error || "Fehler beim Erstellen.");
    }
    setIsLoading(false);
  };

  const handleRequestJoin = async (groupId: string) => {
    if (!user) return;
    setIsSearching(true);
    const result = await requestJoinAction(groupId, user.uid, user.displayName || "Nutzer");
    if (result.success) {
      setJoinStatus(groupId);
      setTimeout(() => setJoinStatus(null), 3000);
    }
    setIsSearching(false);
  };

  const onQrScan = (decodedText: string) => {
    // Wenn es eine URL ist, extrahiere die ID
    if (decodedText.includes("/modules/qloud/")) {
       const parts = decodedText.split("/");
       const scannedId = parts[parts.length - 1];
       if (scannedId) {
          setIsScanning(false);
          setIsJoinOpen(false);
          router.push(`/modules/qloud/${scannedId}`);
       }
    } else {
       // Falls es eine reine ID ist
       setIsScanning(false);
       setIsJoinOpen(false);
       router.push(`/modules/qloud/${decodedText}`);
    }
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
                   <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Network Online</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-foreground italic uppercase tracking-tighter leading-none mb-6">
                Cloud <br /> <span className="text-gradient">Social Hub.</span>
              </h1>
              <p className="text-foreground/40 text-lg font-medium italic leading-relaxed">
                Management-Zentrale für deine Qloud-Nodes. Suche Gruppen, scanne Invites oder starte deine eigene Instanz.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
               <button 
                onClick={() => setIsJoinOpen(true)}
                className="px-8 py-5 bg-white text-black font-black italic uppercase rounded-2xl tracking-widest text-sm hover:scale-105 transition-all shadow-xl flex items-center gap-3"
               >
                  <Search size={20} /> Beitreten
               </button>
               <button 
                onClick={() => { setIsCreateOpen(true); setError(null); }}
                className="px-8 py-5 bg-primary text-secondary font-black italic uppercase rounded-2xl tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
               >
                  <Plus size={20} /> Gründen
               </button>
            </div>
          </motion.div>
        </header>

        {/* YOUR GROUPS GRID */}
        <section className="space-y-8">
           <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-black text-foreground/40 uppercase tracking-[0.3em] italic">Deine Nodes</h2>
              <span className="text-[10px] font-black text-primary uppercase italic tracking-widest px-3 py-1 bg-primary/10 rounded-lg">Sync Active</span>
           </div>
           
           {fetching ? (
             <div className="py-20 flex justify-center italic font-black text-foreground/10 animate-pulse uppercase tracking-[0.5em]">Lade Nodes...</div>
           ) : myGroups.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.map((group, idx) => (
                   <Link key={group.id} href={`/modules/qloud/${group.id}`}>
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="group p-8 bg-card border border-white/5 rounded-[2.5rem] hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-2xl relative overflow-hidden">
                         <div className="relative z-10 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                               <div className="p-3 bg-foreground/5 rounded-xl text-primary"><Users size={20} /></div>
                               <span className="text-[10px] font-black uppercase text-foreground/20 italic tracking-widest">{group._count.members} User</span>
                            </div>
                            <div>
                               <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tighter mb-1 group-hover:text-primary transition-colors">{group.name}</h3>
                               <p className="text-foreground/40 text-xs italic line-clamp-1">{group.description || "Authorized Qloud Node"}</p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-all uppercase italic tracking-[0.2em]">Betreten <ArrowRight size={14} /></div>
                         </div>
                      </motion.div>
                   </Link>
                ))}
             </div>
           ) : (
             <div className="py-20 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center border border-dashed border-foreground/20 italic font-black text-foreground/20">Empty</div>
                <p className="font-black italic uppercase text-foreground/20 tracking-widest text-sm">Bereit für deine erste Qloud?</p>
             </div>
           )}
        </section>
      </div>

      {/* JOIN MODAL */}
      <AnimatePresence>
        {isJoinOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsJoinOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-white text-black shadow-2xl rounded-[3rem] overflow-hidden flex flex-col">
                <div className="flex-1 p-10 space-y-8 overflow-y-auto max-h-[85vh]">
                   <header className="flex items-center justify-between">
                      <div>
                         <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Find your <br /><span className="text-primary tracking-widest">Qloud.</span></h2>
                         <div className="mt-4 flex gap-4">
                            <button onClick={() => setIsScanning(false)} className={`text-[10px] font-black uppercase italic tracking-widest pb-1 border-b-2 transition-all ${!isScanning ? 'border-primary text-black' : 'border-transparent text-slate-300'}`}>Suche</button>
                            <button onClick={() => setIsScanning(true)} className={`text-[10px] font-black uppercase italic tracking-widest pb-1 border-b-2 transition-all ${isScanning ? 'border-primary text-black' : 'border-transparent text-slate-300'}`}>Scan</button>
                         </div>
                      </div>
                      <button onClick={() => setIsJoinOpen(false)} className="p-4 bg-slate-100 rounded-full text-slate-400 hover:text-black transition-colors"><X size={24} /></button>
                   </header>

                   {isScanning ? (
                     <div className="space-y-6">
                        <QrScanner onScan={onQrScan} />
                        <p className="text-center text-[10px] font-black uppercase text-slate-400 italic tracking-[0.2em]">QR-Code in den Rahmen halten</p>
                     </div>
                   ) : (
                     <div className="space-y-8">
                        <div className="relative">
                           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                           <input 
                              type="text" 
                              placeholder="GRUPPENNAME SUCHEN..." 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-6 pl-14 pr-6 font-black italic uppercase text-sm outline-none focus:border-primary transition-all"
                           />
                        </div>

                        <div className="space-y-4">
                           {isSearching ? (
                             <div className="py-10 text-center animate-pulse italic font-black text-slate-200 uppercase text-xs tracking-[0.3em]">Scanne Verzeichnis...</div>
                           ) : searchResults.length > 0 ? (
                             searchResults.map((g) => (
                               <div key={g.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:border-black transition-all">
                                  <div className="flex items-center gap-4">
                                     <div className="p-3 bg-white rounded-xl text-slate-400 shadow-sm"><Users size={18} /></div>
                                     <div>
                                        <h4 className="font-black italic uppercase text-slate-900 leading-none">{g.name}</h4>
                                        <p className="text-[9px] font-black uppercase text-slate-300 italic tracking-widest mt-1">{g.memberCount} Nodes aktiv</p>
                                     </div>
                                  </div>
                                  {joinStatus === g.id ? (
                                    <div className="px-6 py-3 bg-green-500 text-white rounded-xl text-[10px] font-black italic uppercase flex items-center gap-2 animate-bounce"><CheckCircle2 size={14} /> Anfrage raus!</div>
                                  ) : (
                                    <button onClick={() => handleRequestJoin(g.id)} className="px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black italic uppercase hover:bg-primary hover:text-secondary transition-all flex items-center gap-2">Anfragen <ArrowRight size={14} /></button>
                                  )}
                               </div>
                             ))
                           ) : searchQuery.length >= 2 ? (
                             <div className="py-10 text-center font-black text-slate-200 uppercase text-[10px] italic tracking-widest">Keine Gruppe mit diesem Namen gefunden.</div>
                           ) : null}
                        </div>
                     </div>
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg bg-card border border-white/5 rounded-[3.5rem] p-10 shadow-2xl overflow-hidden" >
                <div className="space-y-8">
                   <div className="flex items-center gap-4 text-white">
                      <div className="p-4 bg-primary rounded-2xl text-secondary"><Plus size={24} /></div>
                      <div>
                         <h2 className="text-2xl font-black italic uppercase tracking-tighter">Event <span className="text-primary underline decoration-4 underline-offset-4">Gründen.</span></h2>
                         <p className="text-[10px] font-black uppercase text-foreground/40 italic mt-1 tracking-widest leading-none">Status: Authorized to build</p>
                      </div>
                   </div>
                   {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase text-red-500 italic tracking-widest">{error}</div>}
                   <form onSubmit={handleCreateGroup} className="space-y-6">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase italic text-foreground/30 ml-2 tracking-widest">Identifier</label><input type="text" required placeholder="GÜLER WEDDING, ETC..." value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full bg-foreground/5 border border-white/5 rounded-2xl py-6 px-8 font-black italic uppercase text-sm outline-none focus:border-primary transition-all text-white placeholder:text-foreground/10" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase italic text-foreground/30 ml-2 tracking-widest">Mission Context</label><textarea required placeholder="DETAILS ZUM EVENT..." value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} className="w-full bg-foreground/5 border border-white/5 rounded-2xl py-6 px-8 font-medium italic text-sm outline-none focus:border-primary transition-all min-h-[120px] text-white placeholder:text-foreground/10" /></div>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                         <button type="button" onClick={() => setIsCreateOpen(false)} className="py-6 bg-foreground/5 text-foreground/40 font-black italic uppercase tracking-widest text-[10px] rounded-2xl hover:bg-foreground/10 transition-all">Abort</button>
                         <button type="submit" disabled={isLoading} className={`py-6 font-black italic uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-xl ${isFormValid ? 'bg-primary text-secondary' : 'bg-foreground/5 text-foreground/10 cursor-not-allowed grayscale'}`}>{isLoading ? "Syncing..." : "Launch Qloud"}</button>
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
