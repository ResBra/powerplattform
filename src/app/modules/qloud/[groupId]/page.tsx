"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import { 
  QrCode, 
  ArrowLeft,
  Send,
  Upload,
  Clock,
  Trash2,
  ShieldAlert,
  Users,
  Copy,
  CheckCircle2,
  Share2,
  Printer,
  Image as ImageIcon
} from "lucide-react";
import { auth, db, storage } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp,
  doc,
  updateDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getGroupDetails, deleteGroup, saveMediaMetadataAction } from "../actions";
import { QRCodeSVG } from "qrcode.react";
import { upload } from '@vercel/blob/client';

export default function GroupPage() {
  const { groupId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"chat" | "gallery" | "admin">("chat");
  const [group, setGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [media, setMedia] = useState<any[]>([]);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dbStatus, setDbStatus] = useState<"connected" | "error" | "linking">("linking");
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    async function init() {
      const details = await getGroupDetails(groupId as string);
      if (!details) return router.push("/modules/qloud");
      setGroup(details);
    }
    init();
  }, [groupId, router]);

  useEffect(() => {
    if (!group) return;

    // Fix: Proper Auth Listener (outside the loop)
    const unsubAuth = auth.onAuthStateChanged((u: any) => {
      setUser(u);
      if (u?.uid === group.adminId) setIsAdmin(true);
      console.log("AUTH STATE:", u ? "Logged In" : "Not Logged In");
    });

    const msgCol = collection(db, "groups", groupId as string, "messages");
    const unsub = onSnapshot(msgCol, (snap) => {
        setDbStatus("connected");
        const msgs = snap.docs.map(d => ({ 
          id: d.id, 
          ...d.data(),
          time: d.data().createdAt?.toMillis() || d.data().fallbackTime || 0 
        }));
        setMessages(msgs.sort((a, b) => a.time - b.time).slice(-30));
    });

    const unsubMedia = onSnapshot(collection(db, "groups", groupId as string, "media"), (snap) => {
       const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
       setMedia(items.sort((a: any, b: any) => (b.uploadedAt?.toMillis() || 0) - (a.uploadedAt?.toMillis() || 0)));
    });

    return () => { unsub(); unsubMedia(); unsubAuth(); };
  }, [groupId, group]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !user) return;
    setNewMessage("");
    await addDoc(collection(db, "groups", groupId as string, "messages"), {
      content: text,
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || "Nutzer",
      createdAt: serverTimestamp(),
      fallbackTime: Date.now()
    });
  };

  const uploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploading(true);
    setUploadStatus("Initialisiere Cloud...");

    try {
      // 1. Direct Client-to-Cloud Upload (Bypasses all Server-side limits)
      setUploadStatus("Sende an Vercel Cloud...");
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      // 2. Save Metadata to Firestore
      setUploadStatus("Synchronisiere Gruppe...");
      const result = await saveMediaMetadataAction({
        url: newBlob.url,
        groupId: groupId as string,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || "Nutzer"
      });
      
      if (!result.success) throw new Error(result.error);

      setUploadStatus("Erfolgreich!");
      setActiveTab("gallery");
    } catch (err: any) { 
      console.error("Cloud Upload Error:", err); 
      alert("Fehler bei der Cloud-Übertragung: " + (err.message || "Unbekannter Fehler"));
    } finally { 
      setIsUploading(false); 
      setUploadStatus("");
      if (e.target) e.target.value = "";
    }
  };

  const approveMedia = async (mediaId: string) => {
    if (!isAdmin) return;
    await updateDoc(doc(db, "groups", groupId as string, "media", mediaId), { status: "APPROVED" });
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("Bist du sicher? Alle Daten dieser Qloud werden permanent gelöscht.")) return;
    const res = await deleteGroup(groupId as string, user.uid);
    if (res.success) router.push("/modules/qloud");
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: group.name,
      text: `Tritt meiner Qloud Gruppe '${group.name}' bei!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) { await navigator.share(shareData); } else { copyInviteLink(); }
    } catch (err) { console.log(err); }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!group) return <div className="p-20 text-center font-black animate-pulse opacity-10">Establishing Bridge...</div>;

  return (
    <SiteLayoutClient activePage="qloud">
      {/* 🟢 RESPONSIVE CONNECTION MONITOR (Floating Badge) */}
      <div className="fixed bottom-6 left-6 md:top-24 md:right-8 md:bottom-auto md:left-auto z-[999] flex items-center gap-3 px-4 py-2.5 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all animate-in fade-in slide-in-from-bottom-5 duration-500">
         <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full ${dbStatus === 'connected' ? 'bg-primary shadow-[0_0_10px_#22c55e]' : 'bg-red-500 animate-pulse'}`} />
            {dbStatus === 'connected' && (
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary animate-ping opacity-75" />
            )}
         </div>
         <span className="text-[9px] font-black uppercase text-white tracking-[0.2em] italic">
            {dbStatus === 'connected' ? 'Cloud Link: ACTIVE' : 'Cloud Link: OFFLINE'}
         </span>
      </div>

      {/* UI LAYER */}
      <div className="space-y-8 pb-32 print:hidden relative">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5 mx-4 md:mx-0">
           <div className="flex items-center gap-6">
              <button onClick={() => router.push("/modules/qloud")} className="p-4 bg-foreground/5 rounded-2xl text-foreground/40 hover:bg-foreground/10 transition-colors"><ArrowLeft size={20} /></button>
              <div>
                 <h1 className="text-3xl md:text-4xl font-black text-foreground italic uppercase tracking-tighter leading-none">{group.name}</h1>
                 <p className="text-[10px] font-black uppercase text-primary italic tracking-widest mt-1">Authorized Access</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <button onClick={() => setIsQrOpen(true)} className="px-6 md:px-8 py-4 bg-primary text-secondary rounded-2xl flex items-center gap-3 text-[10px] font-black italic uppercase shadow-xl shadow-primary/20"><QrCode size={18} /> Invite guests</button>
              {isAdmin && (
                <button onClick={() => setActiveTab("admin")} className={`px-6 py-4 rounded-2xl border border-white/5 flex items-center gap-3 text-[10px] font-black italic uppercase transition-all ${activeTab === 'admin' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-foreground/5 text-foreground/40'}`}>
                   <ShieldAlert size={18} /> Admin
                </button>
              )}
           </div>
        </header>

        <nav className="flex items-center gap-2 p-1.5 bg-foreground/5 rounded-2xl border border-white/5 w-fit">
           <button onClick={() => setActiveTab("chat")} className={`px-8 md:px-10 py-4 rounded-xl text-[10px] font-black italic uppercase transition-all ${activeTab === 'chat' ? 'bg-primary text-secondary shadow-lg' : 'text-foreground/40'}`}>Feed</button>
           <button onClick={() => setActiveTab("gallery")} className={`px-8 md:px-10 py-4 rounded-xl text-[10px] font-black italic uppercase transition-all ${activeTab === 'gallery' ? 'bg-primary text-secondary shadow-lg' : 'text-foreground/40'}`}>Galerie</button>
        </nav>

        <main className="min-h-[400px]">
           <AnimatePresence mode="wait">
              {activeTab === "chat" && (
                <motion.section key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[550px] md:h-[650px] bg-card border border-white/5 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden relative">
                   <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 custom-scrollbar">
                      {messages.map((msg, idx) => (
                         <div key={idx} className={`flex flex-col ${msg.userId === user?.uid ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-[2.5rem] ${msg.userId === user?.uid ? 'bg-primary text-secondary shadow-xl shadow-primary/10' : 'bg-foreground/5 text-foreground border border-white/5'}`}>
                               <p className="text-[7px] font-black uppercase mb-1 opacity-40 italic">{msg.userName}</p>
                               <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                            </div>
                         </div>
                      ))}
                      <div ref={chatEndRef} />
                   </div>
                   <form onSubmit={sendMessage} className="p-6 md:p-8 bg-foreground/[0.02] border-t border-white/5 flex gap-4">
                      <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="NACHRICHT..." className="flex-1 bg-card border border-white/5 rounded-2xl px-6 md:px-10 py-5 text-xs font-black italic outline-none focus:border-primary transition-all uppercase" />
                      <button className="p-5 md:p-6 bg-primary text-secondary rounded-2xl shadow-xl shadow-primary/20"><Send size={24} /></button>
                   </form>
                </motion.section>
              )}

              {activeTab === "gallery" && (
                <motion.section key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
                      <h2 className="text-3xl font-black italic uppercase text-foreground">Cloud Moments</h2>
                      <label htmlFor="media-upload" className="px-10 py-5 bg-primary text-secondary font-black italic uppercase rounded-2xl text-xs flex items-center gap-3 cursor-pointer shadow-2xl transition-all relative overflow-hidden">
                         <input type="file" id="media-upload" accept="image/*" className="hidden" onChange={uploadMedia} />
                         {isUploading ? (
                           <>
                             <Clock className="animate-spin" size={18} />
                             <span className="relative z-10">{uploadStatus || "Process..."}</span>
                             {uploadProgress > 0 && (
                               <div className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                             )}
                           </>
                         ) : (
                           <>
                             <Upload size={18} /> 
                             <span>BILD HOCHLADEN</span>
                           </>
                         )}
                      </label>
                   </div>
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                      {media.filter(m => m.status === "APPROVED" || isAdmin).map((item) => (
                        <div key={item.id} className="group relative aspect-square bg-foreground/5 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-lg">
                           <img src={item.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125" />
                        </div>
                      ))}
                   </div>
                </motion.section>
              )}

              {isAdmin && activeTab === "admin" && (
                <motion.section key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                   <div className="bg-card border border-white/5 rounded-[3.5rem] p-12 space-y-12 shadow-2xl">
                      <div className="flex items-center gap-8 text-amber-500">
                         <div className="p-6 bg-amber-500/10 rounded-[2rem]"><ShieldAlert size={40} /></div>
                         <h2 className="text-3xl font-black italic uppercase">Node Admin</h2>
                      </div>
                      <div className="grid md:grid-cols-2 gap-12">
                         <div className="p-10 bg-foreground/5 rounded-[3rem] border border-white/5">
                            <h3 className="text-xs font-black uppercase italic tracking-[0.3em] text-primary mb-6">User Nodes</h3>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                               {group.members.map((m: any, i: number) => (
                                 <div key={i} className="p-5 bg-card border border-white/5 rounded-xl flex justify-between items-center">
                                    <span className="text-[10px] font-black italic uppercase text-foreground/50">{m.userId.slice(0, 16)}...</span>
                                    <span className="text-[8px] font-black uppercase text-primary bg-primary/10 px-2 py-1 rounded">{m.role}</span>
                                 </div>
                               ))}
                            </div>
                         </div>
                         <div className="p-10 bg-red-500/5 rounded-[3rem] border border-red-500/10 space-y-8">
                            <h3 className="text-xs font-black uppercase italic tracking-[0.3em] text-red-500">Destruction</h3>
                            <button onClick={handleDeleteGroup} className="w-full py-6 bg-red-500 text-white font-black italic uppercase tracking-widest text-xs rounded-[1.5rem] shadow-xl shadow-red-500/20">Node löschen</button>
                         </div>
                      </div>
                   </div>
                </motion.section>
              )}
           </AnimatePresence>
        </main>
      </div>

      {/* --- BROWSER MODAL --- */}
      <AnimatePresence>
        {isQrOpen && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 print:hidden">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsQrOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 50 }} 
               animate={{ opacity: 1, scale: 1, y: 0 }} 
               className="relative bg-white text-black w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] rounded-[3.5rem] border-[12px] border-slate-50"
             >
                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
                   <div className="space-y-4 text-center">
                      <h3 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Einladung zur <br /> <span className="text-slate-400">Qloud.</span></h3>
                      <div className="h-1.5 w-16 bg-slate-900 mx-auto rounded-full" />
                   </div>
                   <p className="text-lg font-medium italic text-slate-500 leading-relaxed text-center max-w-xs mx-auto">
                     Wenn Sie mit Ihrer Community <span className="text-slate-900 font-extrabold">&quot;{group.name}&quot;</span> Ihre Erlebnisse teilen möchten, scannen Sie einfach diesen Code.
                   </p>
                   <div className="flex justify-center">
                      <div className="bg-white p-8 rounded-[3rem] shadow-xl border-2 border-slate-50">
                        <QRCodeSVG value={window.location.href} size={240} level="H" className="mx-auto" />
                      </div>
                   </div>
                </div>
                <div className="px-8 py-6 bg-slate-50 grid grid-cols-2 gap-4 border-t border-slate-100">
                   <button onClick={handleNativeShare} className="flex items-center justify-center gap-3 p-5 bg-white text-slate-400 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200">
                      <Share2 size={16} /> <span className="text-[10px] font-black uppercase italic tracking-widest">Share</span>
                   </button>
                   <button onClick={() => window.print()} className="flex items-center justify-center gap-3 p-5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200">
                      <Printer size={16} /> <span className="text-[10px] font-black uppercase italic tracking-widest">Print A4</span>
                   </button>
                </div>
                <button onClick={() => setIsQrOpen(false)} className="w-full py-5 bg-white text-slate-300 font-black italic text-[10px] uppercase border-t border-slate-50 hover:text-slate-600 transition-colors">Abbrechen</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DEDICATED PRINT MASTER (ULTRA COMPACT) --- */}
      <div id="final-print-master">
          <div className="print-content-wrapper">
              <div className="print-text-group">
                 <h1 className="print-title">Einladung zur <br /> <span className="print-subtitle">Qloud.</span></h1>
                 <div className="print-divider" />
              </div>

              <p className="print-description">
                Wenn Sie mit Ihrer Community <br /> 
                <span className="print-group-name">&quot;{group.name}&quot;</span> <br /> 
                Ihre Erlebnisse teilen möchten, scannen Sie einfach diesen Code.
              </p>

              <div className="print-qr-container">
                 <QRCodeSVG value={window.location.href} size={320} level="H" />
              </div>

              <div className="print-footer">
                 <p className="print-footer-text">PowerPlatform Node OS</p>
              </div>
          </div>
      </div>

      <style jsx global>{`
        @page { size: A4 portrait; margin: 0; }
        
        #final-print-master {
          display: none;
        }

        @media print {
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden !important; }
          
          #final-print-master {
            display: flex !important;
            visibility: visible !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            background: white !important;
            /* No longer full center, but padding top for distance */
            justify-content: flex-start !important;
            align-items: center !important;
            z-index: 9999 !important;
          }

          #final-print-master * {
            visibility: visible !important;
          }

          .print-content-wrapper {
            text-align: center !important;
            width: 100% !important;
            padding-top: 3cm !important; /* REDUCED FROM 5CM TO 3CM */
            padding-left: 2cm !important;
            padding-right: 2cm !important;
          }

          .print-title { font-size: 42pt !important; font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; color: #0f172a !important; line-height: 1 !important; margin: 0 !important; }
          .print-subtitle { color: #94a3b8 !important; }
          .print-divider { height: 6pt !important; width: 60pt !important; background: #0f172a !important; margin: 20pt auto !important; border-radius: 50pt !important; }
          .print-description { font-size: 14pt !important; font-weight: 500 !important; font-style: italic !important; color: #64748b !important; line-height: 1.5 !important; margin: 30pt 0 !important; }
          .print-group-name { color: #0f172a !important; font-weight: 900 !important; font-size: 18pt !important; }
          .print-qr-container { background: white !important; padding: 20pt !important; border: 1pt solid #f1f5f9 !important; display: inline-block !important; border-radius: 30pt !important; }
          .print-footer { margin-top: 50pt !important; }
          .print-footer-text { font-size: 10pt !important; font-weight: 900 !important; text-transform: uppercase !important; color: #cbd5e1 !important; letter-spacing: 0.5em !important; font-style: italic !important; }
        }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </SiteLayoutClient>
  );
}
