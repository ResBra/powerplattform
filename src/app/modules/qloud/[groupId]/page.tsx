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
  Check,
  X,
  Download,
  ShieldCheck,
  Image as ImageIcon
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp,
  doc,
  getDocs
} from "firebase/firestore";
import { 
  getGroupDetails, 
  deleteGroup, 
  saveMediaMetadataAction, 
  joinGroupAction,
  approveMediaAction,
  deleteMediaAction,
  toggleModeratorAction
} from "../actions";
import { QRCodeSVG } from "qrcode.react";
import { upload } from '@vercel/blob/client';

export default function GroupPage() {
  const { groupId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"chat" | "gallery" | "admin" | "moderation">("chat");
  const [group, setGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [media, setMedia] = useState<any[]>([]);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dbStatus, setDbStatus] = useState<"connected" | "error" | "linking">("linking");
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  // 1. Initial Load & Real-time Group Sync
  useEffect(() => {
    if (!groupId) return;

    // Real-time group listener (Metalogs + Members)
    const unsubGroup = onSnapshot(doc(db, "groups", groupId as string), async (docSnap) => {
      if (!docSnap.exists()) return router.push("/modules/qloud");
      
      const data = docSnap.data();
      
      // Load members separately to stay reactive
      const membersSnap = await getDocs(collection(db, "groups", groupId as string, "members"));
      const memberList = membersSnap.docs.map(d => ({ userId: d.id, ...d.data() }));

      const details = {
        id: docSnap.id,
        ...data,
        members: memberList
      };
      
      setGroup(details);

      // Auth logic inside group listener
      const u = auth.currentUser;
      if (u) {
        setUser(u);
        const isOwner = u.uid === data.adminId;
        const isMod = data.moderatorIds?.includes(u.uid) || isOwner;
        setIsAdmin(isOwner);
        setIsModerator(isMod);

        // Auto-Join / Profile Sync
        await joinGroupAction(groupId as string, u.uid, u.displayName || u.email?.split('@')[0] || "Nutzer");
      }
    });

    const unsubAuth = auth.onAuthStateChanged((u) => {
        if (u) setUser(u);
    });

    return () => { unsubGroup(); unsubAuth(); };
  }, [groupId, router]);

  // 2. Real-time Listeners (Chat & Media)
  useEffect(() => {
    if (!groupId) return;

    const msgCol = collection(db, "groups", groupId as string, "messages");
    const unsubMessages = onSnapshot(msgCol, (snap) => {
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

    return () => { unsubMessages(); unsubMedia(); };
  }, [groupId]);

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
    setUploadStatus("Uploading Moments...");
    try {
      const newBlob = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/upload' });
      const result = await saveMediaMetadataAction({
        url: newBlob.url,
        groupId: groupId as string,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || "Nutzer"
      });
      if (!result.success) throw new Error(result.error);
      setUploadStatus("Gesendet! Wartet auf Freigabe.");
      setTimeout(() => setUploadStatus(""), 3000);
      setActiveTab("gallery");
    } catch (err: any) { alert("Fehler beim Upload."); } finally { 
      setIsUploading(false); 
      if (e.target) e.target.value = "";
    }
  };

  const handleApprove = async (mediaId: string) => {
    if (!isModerator) return;
    await approveMediaAction(groupId as string, mediaId);
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!isModerator || !window.confirm("Dieses Bild permanent entfernen?")) return;
    await deleteMediaAction(groupId as string, mediaId);
  };

  const handleToggleModerator = async (targetUserId: string, currentIsMod: boolean) => {
    if (!isAdmin) return;
    await toggleModeratorAction(groupId as string, targetUserId, currentIsMod);
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("Bist du sicher? Alle Daten dieser Qloud werden permanent gelöscht.")) return;
    const res = await deleteGroup(groupId as string, user.uid);
    if (res.success) router.push("/modules/qloud");
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) { window.open(url, '_blank'); }
  };

  const handleNativeShare = async () => {
    const shareData = { title: group.name, text: `Komm in meine Qloud Gruppe '${group.name}'!`, url: window.location.href };
    try { if (navigator.share) { await navigator.share(shareData); } else { copyInviteLink(); } } catch (err) { console.log(err); }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!group) return <div className="p-20 text-center font-black animate-pulse opacity-10 uppercase tracking-widest text-white">Bridging Cloud Nodes...</div>;

  const pendingMedia = media.filter(m => m.status === "PENDING");
  const approvedMedia = media.filter(m => m.status === "APPROVED");

  return (
    <SiteLayoutClient activePage="qloud">
      {/* 🔴 CONNECTION MONITOR */}
      <div className="fixed bottom-6 left-6 md:top-24 md:right-8 md:bottom-auto md:left-auto z-[999] flex items-center gap-3 px-4 py-2.5 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl">
         <div className="relative"><div className={`w-2.5 h-2.5 rounded-full ${dbStatus === 'connected' ? 'bg-primary' : 'bg-red-500 animate-pulse'}`} /></div>
         <span className="text-[9px] font-black uppercase text-white tracking-[0.2em] italic">
            {dbStatus === 'connected' ? 'Cloud Link: ACTIVE' : 'Cloud Link: OFFLINE'}
         </span>
      </div>

      <div className="space-y-8 pb-32 print:hidden relative px-4 md:px-0">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
           <div className="flex items-center gap-6">
              <button onClick={() => router.push("/modules/qloud")} className="p-4 bg-foreground/5 rounded-2xl text-foreground/40 hover:bg-foreground/10 transition-colors"><ArrowLeft size={20} /></button>
              <div>
                 <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">{group.name}</h1>
                 <p className="text-[10px] font-black uppercase text-primary italic tracking-widest mt-1">Authorized Access Network</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <button onClick={() => setIsQrOpen(true)} className="px-6 md:px-8 py-4 bg-primary text-secondary rounded-2xl flex items-center gap-3 text-[10px] font-black italic uppercase shadow-xl shadow-primary/20"><QrCode size={18} /> Invite Guests</button>
           </div>
        </header>

        <nav className="flex items-center gap-2 p-1.5 bg-foreground/5 rounded-2xl border border-white/5 w-fit overflow-x-auto max-w-full no-scrollbar">
           <button onClick={() => setActiveTab("chat")} className={`px-8 py-4 rounded-xl text-[10px] font-black italic uppercase transition-all whitespace-nowrap ${activeTab === 'chat' ? 'bg-primary text-secondary' : 'text-foreground/40'}`}>Feed</button>
           <button onClick={() => setActiveTab("gallery")} className={`px-8 py-4 rounded-xl text-[10px] font-black italic uppercase transition-all whitespace-nowrap ${activeTab === 'gallery' ? 'bg-primary text-secondary' : 'text-foreground/40'}`}>Galerie {approvedMedia.length > 0 && `(${approvedMedia.length})`}</button>
           {isModerator && (
             <button onClick={() => setActiveTab("moderation")} className={`px-8 py-4 rounded-xl text-[10px] font-black italic uppercase transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'moderation' ? 'bg-amber-500 text-black shadow-lg animate-pulse' : 'text-amber-500/40'}`}>
                Moderation {pendingMedia.length > 0 && <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded-md text-[8px]">{pendingMedia.length}</span>}
             </button>
           )}
           {isAdmin && (
             <button onClick={() => setActiveTab("admin")} className={`px-8 py-4 rounded-xl text-[10px] font-black italic uppercase transition-all whitespace-nowrap ${activeTab === 'admin' ? 'bg-white text-black' : 'text-foreground/40'}`}>Admin</button>
           )}
        </nav>

        <main className="min-h-[400px]">
           <AnimatePresence mode="wait">
              {activeTab === "chat" && (
                <motion.section key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-[550px] md:h-[650px] bg-card border border-white/5 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden">
                   <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 custom-scrollbar">
                      {messages.map((msg, idx) => (
                         <div key={idx} className={`flex flex-col ${msg.userId === user?.uid ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-[2.5rem] ${msg.userId === user?.uid ? 'bg-primary text-secondary shadow-xl shadow-primary/10' : 'bg-foreground/5 text-foreground border border-white/5'}`}>
                               <p className="text-[7px] font-black uppercase mb-1 opacity-40 italic">{msg.userName}</p>
                               <p className="text-sm font-medium leading-relaxed font-sans">{msg.content}</p>
                            </div>
                         </div>
                      ))}
                      <div ref={chatEndRef} />
                   </div>
                   <form onSubmit={sendMessage} className="p-6 md:p-8 bg-foreground/[0.02] border-t border-white/5 flex gap-4">
                      <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="DEINE NACHRICHT..." className="flex-1 bg-card border border-white/5 rounded-2xl px-6 md:px-10 py-5 text-xs font-black italic outline-none focus:border-primary transition-all uppercase" />
                      <button className="p-5 md:p-6 bg-primary text-secondary rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all outline-none"><Send size={24} /></button>
                   </form>
                </motion.section>
              )}

              {activeTab === "gallery" && (
                <motion.section key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div>
                        <h2 className="text-3xl font-black italic uppercase text-white">Live-Moments</h2>
                        <p className="text-[10px] font-black uppercase text-foreground/40 italic tracking-widest mt-1">Nur freigegebene Highlights erscheinen hier</p>
                      </div>
                      <label htmlFor="media-upload" className="px-10 py-5 bg-primary text-secondary font-black italic uppercase rounded-2xl text-xs flex items-center gap-3 cursor-pointer shadow-2xl transition-all relative overflow-hidden group">
                         <input type="file" id="media-upload" accept="image/*" className="hidden" onChange={uploadMedia} />
                         {isUploading ? <><Clock className="animate-spin" size={18} /><span className="relative z-10">{uploadStatus || "Process..."}</span></> : <><Upload size={18} className="group-hover:-translate-y-1 transition-transform" /><span>BILD HOCHLADEN</span></>}
                      </label>
                   </div>
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {approvedMedia.map((item) => (
                        <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} key={item.id} className="group relative aspect-square bg-foreground/5 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-lg cursor-pointer">
                           <img src={item.url} onClick={() => setSelectedImage(item)} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" loading="lazy" />
                           <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleDownload(item.url, `${group.name}-${item.userName}.jpg`)} className="p-2.5 bg-black/60 backdrop-blur-md text-white rounded-xl hover:bg-primary hover:text-secondary transition-all"><Download size={14} /></button>
                              {isModerator && <button onClick={() => handleDeleteMedia(item.id)} className="p-2.5 bg-red-500/80 backdrop-blur-md text-white rounded-xl hover:bg-red-600 transition-all"><Trash2 size={14} /></button>}
                           </div>
                           <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-[10px] font-black text-white italic uppercase tracking-widest flex items-center gap-2"><ImageIcon size={12} /> {item.userName}</p>
                           </div>
                        </motion.div>
                      ))}
                   </div>
                </motion.section>
              )}

              {isModerator && activeTab === "moderation" && (
                <motion.section key="moderation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                   <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-amber-500 rounded-2xl text-black"><ShieldAlert size={28} /></div>
                        <div><h2 className="text-2xl font-black italic uppercase text-amber-500">Moderations-Schleife</h2><p className="text-[10px] font-black uppercase text-amber-500/60 italic tracking-widest leading-none">Prüfung vor Veröffentlichung</p></div>
                      </div>
                      <div className="px-6 py-3 bg-amber-500/20 rounded-full border border-amber-500/30 text-amber-500 font-bold italic text-xs uppercase tracking-widest">{pendingMedia.length} Wartend</div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {pendingMedia.map((item) => (
                        <div key={item.id} className="group bg-card border border-white/5 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
                           <img src={item.url} onClick={() => setSelectedImage(item)} className="aspect-video object-cover cursor-pointer" />
                           <div className="p-8 space-y-6 text-slate-900 bg-white">
                              <div className="flex items-center justify-between text-slate-900 underline decoration-primary decoration-4 underline-offset-4">
                                  <span className="text-sm font-black italic uppercase">{item.userName}</span>
                                  <span className="text-[8px] font-black uppercase text-amber-600 italic tracking-widest">Wartet...</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <button onClick={() => handleApprove(item.id)} className="py-4 bg-primary text-secondary rounded-2xl font-black italic uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:scale-105 transition-all"><Check size={16} /> Freigeben</button>
                                 <button onClick={() => handleDeleteMedia(item.id)} className="py-4 bg-red-500 text-white rounded-2xl font-black italic uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-red-600 transition-all"><Trash2 size={16} /> Ablehnen</button>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.section>
              )}

              {isAdmin && activeTab === "admin" && (
                <motion.section key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                   <div className="bg-card border border-white/5 rounded-[3.5rem] p-8 md:p-12 space-y-12 shadow-2xl">
                      <div className="flex items-center gap-8 text-white"><div className="p-6 bg-foreground/10 rounded-[2rem]"><ShieldAlert size={40} /></div><h2 className="text-3xl font-black italic uppercase">Netzwerk Admin</h2></div>
                      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-12">
                         <div className="p-10 bg-white rounded-[3rem] border-8 border-slate-50 shadow-inner">
                            <h3 className="text-xs font-black uppercase italic tracking-[0.3em] text-slate-400 mb-8 border-b border-slate-100 pb-4">Mitglieder-Verzeichnis</h3>
                            <div className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                               {group.members.sort((a:any, b:any) => (b.role === 'admin' ? 1 : -1)).map((m: any, i: number) => {
                                 const isUserMod = m.role === 'moderator' || m.role === 'admin';
                                 const isUserOwner = group.adminId === m.userId;
                                 return (
                                   <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex justify-between items-center transition-all hover:bg-white hover:border-primary">
                                      <div className="flex items-center gap-4">
                                         <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-black italic text-sm border-2 border-white shadow-sm">
                                            {m.name?.[0]?.toUpperCase() || 'N'}
                                         </div>
                                         <div className="flex flex-col">
                                            <span className="text-base font-black italic uppercase text-slate-900 tracking-tighter leading-none">{m.name || "Gast"}</span>
                                            <span className="text-[9px] font-black uppercase text-slate-400 italic tracking-widest mt-1 opacity-60">
                                              {isUserOwner ? 'Primärer Admin' : m.role === 'moderator' ? 'Moderator' : 'Gast-Node'}
                                            </span>
                                         </div>
                                      </div>
                                      {!isUserOwner && (
                                        <button 
                                          onClick={() => handleToggleModerator(m.userId, m.role === 'moderator')}
                                          className={`px-5 py-3 rounded-2xl transition-all flex items-center gap-2 border shadow-sm ${m.role === 'moderator' ? 'bg-amber-100 border-amber-200 text-amber-700 font-black italic uppercase text-[10px]' : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200'}`}
                                        >
                                          <ShieldCheck size={18} /> {m.role === 'moderator' ? 'Mod Entziehen' : 'Ernennen'}
                                        </button>
                                      )}
                                   </div>
                                 );
                               })}
                            </div>
                         </div>
                         <div className="p-10 bg-red-500/5 rounded-[3rem] border border-red-500/10 space-y-10 flex flex-col justify-center items-center text-center">
                            <div className="p-8 bg-red-500/10 rounded-full text-red-500 animate-pulse"><Trash2 size={48} /></div>
                            <div>
                               <h3 className="text-xl font-black uppercase italic text-red-500 tracking-tighter">Netzwerk-Zerstörung</h3>
                               <p className="text-[10px] font-medium text-red-500/60 uppercase tracking-widest mt-2">Diesen Node permanent aus der Qloud entfernen</p>
                            </div>
                            <button onClick={handleDeleteGroup} className="w-full py-6 bg-red-500 text-white font-black italic uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-red-500/20 hover:bg-black transition-all outline-none">Node löschen</button>
                         </div>
                      </div>
                   </div>
                </motion.section>
              )}
           </AnimatePresence>
        </main>
      </div>

      {/* LIGHTBOX VIEWER */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4">
             <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-[2100]"><X size={32} /></button>
             <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="relative max-w-6xl w-full max-h-[85vh] flex flex-col items-center">
                <img src={selectedImage.url} className="max-w-full max-h-[75vh] object-contain rounded-[3rem] shadow-2xl border-4 border-white/5" />
                <div className="mt-8 flex items-center gap-10">
                   <div className="flex flex-col text-left border-l-4 border-primary pl-6">
                      <span className="text-[8px] font-black uppercase text-primary tracking-[0.3em] italic mb-1">Captured Node</span>
                      <span className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">{selectedImage.userName}</span>
                   </div>
                   <button onClick={() => handleDownload(selectedImage.url, `${group.name}-${selectedImage.userName}.jpg`)} className="px-10 py-5 bg-primary text-secondary rounded-[1.5rem] font-black italic uppercase tracking-widest text-xs flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20"><Download size={20} /> Download</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isQrOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsQrOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white text-black w-full max-w-lg shadow-2xl rounded-[3.5rem] overflow-hidden flex flex-col">
                <div className="p-10 space-y-12 overflow-y-auto">
                   <h3 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 leading-none text-center">Join the <br /> <span className="text-slate-400">Qloud.</span></h3>
                   <div className="flex justify-center flex-col items-center gap-8">
                      <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-slate-50"><QRCodeSVG value={window.location.href} size={220} level="H" /></div>
                      <div className="bg-slate-50 p-6 rounded-3xl w-full border border-slate-100 flex items-center justify-between"><code className="text-[10px] font-bold text-slate-400 truncate mr-4">{window.location.href}</code><button onClick={copyInviteLink} className={`p-3 rounded-xl transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-slate-900 shadow-sm'}`}>{copied ? <Check size={18} /> : <Copy size={18} />}</button></div>
                   </div>
                </div>
                <div className="p-8 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-4">
                   <button onClick={handleNativeShare} className="flex items-center justify-center gap-3 py-5 bg-white text-slate-900 rounded-2xl font-black italic uppercase tracking-widest text-[10px] border border-slate-200">Share</button>
                   <button onClick={() => window.print()} className="flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-2xl font-black italic uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200">Print</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        font-family: 'Inter', sans-serif;
      `}</style>
    </SiteLayoutClient>
  );
}
