"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import AuthGuard from "@/components/AuthGuard";
import { 
  ArrowLeft, 
  MessageSquare, 
  ChevronRight, 
  ShoppingBag,
  Inbox,
  Clock,
  Sparkles
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from "firebase/firestore";

export default function MarketInbox() {
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "market_chats"),
      where("participants", "array-contains", auth.currentUser.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const chatList = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        time: d.data().updatedAt?.toMillis() || Date.now()
      }));
      setChats(chatList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthGuard>
      <SiteLayoutClient activePage="market">
        <div className="max-w-4xl mx-auto space-y-10 pb-32 px-4 md:px-0">
          
          {/* HEADER */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => router.push("/modules/market")}
                className="p-4 bg-foreground/5 rounded-2xl text-foreground/40 hover:bg-foreground/10 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                 <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground">
                    Mein <span className="text-primary">Postfach.</span>
                 </h1>
                 <p className="text-[10px] md:text-xs font-black uppercase text-primary italic tracking-widest mt-1">Little Market Communication Hub</p>
              </div>
            </div>
          </header>

          {/* CHAT LIST */}
          <main className="min-h-[500px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-20">
                <div className="w-12 h-12 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Accessing Encrypted Channels...</p>
              </div>
            ) : chats.length > 0 ? (
              <div className="grid gap-4">
                <AnimatePresence>
                  {chats.map((chat, idx) => (
                    <motion.div 
                      key={chat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => router.push(`/modules/market/messages/${chat.id}`)}
                      className="group relative bg-card border border-white/5 rounded-[2rem] p-6 hover:bg-foreground/[0.04] hover:border-primary/20 transition-all cursor-pointer shadow-xl"
                    >
                       <div className="flex items-center gap-6">
                          {/* PRODUCT IMAGE PREVIEW */}
                          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                             <img src={chat.listingImage} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          
                          {/* CHAT INFO */}
                          <div className="flex-1 min-w-0 space-y-2">
                             <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black italic uppercase text-foreground leading-none truncate pr-4">
                                   {chat.listingTitle}
                                </h3>
                                <div className="text-[8px] font-black uppercase text-foreground/20 italic tracking-widest shrink-0">
                                   {new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                             </div>
                             <p className="text-xs text-foreground/40 italic truncate font-medium">
                                {chat.lastMessage}
                             </p>
                          </div>

                          <div className="p-4 bg-foreground/5 rounded-xl text-foreground/10 group-hover:text-primary transition-colors">
                             <ChevronRight size={20} />
                          </div>
                       </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-foreground/[0.02] border border-dashed border-border rounded-[3rem]">
                 <div className="p-8 bg-foreground/5 rounded-full text-foreground/10">
                    <Inbox size={64} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black italic uppercase text-foreground/40 leading-none">Postfach ist leer</h3>
                    <p className="text-[10px] font-black uppercase text-foreground/20 italic tracking-widest">Du hast noch keine Anfragen gesendet oder erhalten.</p>
                 </div>
                 <button 
                  onClick={() => router.push("/modules/market")}
                  className="px-10 py-5 border border-primary/20 text-primary rounded-2xl text-[10px] font-black italic uppercase hover:bg-primary hover:text-secondary transition-all"
                 >
                   Zum Marktplatz
                 </button>
              </div>
            )}
          </main>
          
          {/* DECORATION */}
          <div className="flex justify-center items-center gap-8 opacity-5 pt-10">
             <div className="flex flex-col items-center">
                <Sparkles size={40} className="mb-2" />
                <span className="text-[8px] font-black uppercase tracking-[0.5em]">Direct Connect</span>
             </div>
          </div>

        </div>
      </SiteLayoutClient>
    </AuthGuard>
  );
}
