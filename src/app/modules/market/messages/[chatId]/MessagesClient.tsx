"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import AuthGuard from "@/components/AuthGuard";
import { 
  ArrowLeft, 
  Send, 
  ShoppingBag, 
  ShieldCheck, 
  Zap,
  Info,
  ChevronRight,
  MessageCircle as LucideMessageCircle
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  doc, 
  getDoc 
} from "firebase/firestore";
import { sendMessageAction } from "../../actions";

export default function MessagesClient() {
  const { chatId } = useParams();
  const router = useRouter();
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId || !auth.currentUser) return;

    async function loadChatMeta() {
      const docRef = doc(db, "market_chats", chatId as string);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (!data.participants.includes(auth.currentUser?.uid)) {
          router.push("/modules/market/messages");
          return;
        }
        setChat({ id: snap.id, ...data });
      }
    }
    loadChatMeta();

    const q = query(
      collection(db, "market_chats", chatId as string, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        time: d.data().createdAt?.toMillis() || Date.now()
      }));
      setMessages(msgs);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [chatId, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || isSending || !auth.currentUser) return;

    setIsSending(true);
    setNewMessage("");
    const result = await sendMessageAction(chatId as string, auth.currentUser.uid, text);
    if (!result.success) {
      alert("Fehler beim Senden.");
      setNewMessage(text);
    }
    setIsSending(false);
  };

  if (!chat) return (
    <div className="min-h-screen bg-[#050a10] flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <AuthGuard>
      <SiteLayoutClient activePage="market">
        <div className="max-w-4xl mx-auto h-[85vh] flex flex-col px-4 md:px-0 pt-4 md:pt-0">
          
          <div className="bg-card border border-white/5 rounded-t-[2.5rem] p-6 shadow-2xl relative overflow-hidden shrink-0">
             <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <button onClick={() => router.back()} className="p-3 bg-foreground/5 rounded-xl text-foreground/40 hover:bg-foreground/10 transition-colors"><ArrowLeft size={18} /></button>
                   <div onClick={() => router.push(`/modules/market/listing/${chat.listingId}`)} className="flex items-center gap-4 cursor-pointer group">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                         <img src={chat.listingImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="min-w-0">
                         <h2 className="text-sm md:text-lg font-black italic uppercase text-foreground leading-none truncate group-hover:text-primary transition-colors">{chat.listingTitle}</h2>
                         <p className="text-[8px] font-black uppercase text-primary italic tracking-widest mt-1 flex items-center gap-1"><Info size={10} /> Zum Inserat</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex-1 bg-card/30 border-x border-white/5 overflow-y-auto p-6 md:p-10 space-y-6">
             {messages.map((msg) => {
                const isMe = msg.senderId === auth.currentUser?.uid;
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] md:max-w-[70%] p-5 rounded-[2rem] shadow-xl relative ${isMe ? 'bg-primary text-secondary rounded-tr-none' : 'bg-card border border-white/5 text-foreground rounded-tl-none'}`}>
                        <p className="text-xs md:text-sm font-medium leading-relaxed">{msg.text}</p>
                        <span className={`text-[7px] font-black uppercase italic block mt-2 opacity-40 ${isMe ? 'text-secondary' : 'text-foreground'}`}>{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                  </motion.div>
                );
             })}
             <div ref={chatEndRef} />
          </div>

          <div className="bg-card border border-white/5 rounded-b-[2.5rem] p-6 md:p-8 shadow-2xl shrink-0">
             <form onSubmit={handleSendMessage} className="flex gap-4">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="DEINE NACHRICHT..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-xs font-black italic uppercase tracking-widest outline-none focus:border-primary/50 transition-all text-foreground" />
                <button type="submit" disabled={isSending || !newMessage.trim()} className="p-5 bg-primary text-secondary rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"><Send size={24} /></button>
             </form>
          </div>
        </div>
      </SiteLayoutClient>
    </AuthGuard>
  );
}
