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
  Image as ImageIcon,
  Lock,
  UserPlus
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
  toggleModeratorAction,
  getPendingRequestsAction,
  resolveJoinRequestAction,
  requestJoinAction
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
  const [isMember, setIsMember] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dbStatus, setDbStatus] = useState<"connected" | "error" | "linking">("linking");
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // 1. AUTH LISTENER
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u: any) => {
        setUser(u);
    });
    return () => unsub();
  }, []);

  // 2. ROLE CALCULATOR & ACCESS CONTROL
  useEffect(() => {
    if (user && group) {
      const isOwner = user.uid === group.adminId;
      const isActuallyMember = group.memberIds?.includes(user.uid) || isOwner;
      const isMod = group.moderatorIds?.includes(user.uid) || isOwner;
      
      setIsMember(isActuallyMember);
      setIsAdmin(isOwner);
      setIsModerator(isMod);

      // Falls Mitglied: Profile Sync (falls nötig)
      if (isActuallyMember) {
        joinGroupAction(groupId as string, user.uid, user.displayName || user.email?.split('@')[0] || "Nutzer");
      }
    }
  }, [user, group, groupId]);

  // 3. REAL-TIME DATA LISTENERS
  useEffect(() => {
    if (!groupId) return;

    // A. Meta Data
    const unsubGroup = onSnapshot(doc(db, "groups", groupId as string), (docSnap) => {
      if (!docSnap.exists()) return router.push("/modules/qloud");
      const data = docSnap.data();
      setGroup((prev: any) => ({ ...prev, id: docSnap.id, ...data }));
    });

    // B. Members
    const unsubMembers = onSnapshot(collection(db, "groups", groupId as string, "members"), (snap) => {
      const memberList = snap.docs.map(d => ({ userId: d.id, ...d.data() }));
      setGroup((prev: any) => ({ ...prev, members: memberList }));
    });

    // C. Join Requests (Only for Mods/Admins)
    let unsubRequests: any = null;
    if (isModerator) {
      unsubRequests = onSnapshot(collection(db, "groups", groupId as string, "joinRequests"), (snap) => {
         const reqs = snap.docs.map(d => ({ requestId: d.id, ...d.data() }));
         setJoinRequests(reqs);
      });
    }

    // D. Messages
    const msgCol = collection(db, "groups", groupId as string, "messages");
    const unsubMessages = onSnapshot(msgCol, (snap) => {
        setDbStatus("connected");
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data(), time: d.data().createdAt?.toMillis() || d.data().fallbackTime || 0 }));
        setMessages(msgs.sort((a, b) => a.time - b.time).slice(-30));
    });

    // E. Media
    const unsubMedia = onSnapshot(collection(db, "groups", groupId as string, "media"), (snap) => {
       const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
       setMedia(items.sort((a: any, b: any) => (b.uploadedAt?.toMillis() || 0) - (a.uploadedAt?.toMillis() || 0)));
    });

    return () => { 
      unsubGroup(); 
      unsubMembers(); 
      unsubMessages(); 
      unsubMedia(); 
      if (unsubRequests) unsubRequests();
    };
  }, [groupId, router, isModerator]);

  const handleRequestAccess = async () => {
    if (!user) return;
    setIsRequesting(true);
    const result = await requestJoinAction(groupId as string, user.uid, user.displayName || "Nutzer");
    if (result.success) setRequestSent(true);
    setIsRequesting(false);
  };

  const handleResolveRequest = async (requestId: string, reqName: string, approve: boolean) => {
    if (!isModerator) return;
    await resolveJoinRequestAction(groupId as string, requestId, reqName, approve);
  };

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
    try {
      const uniqueFilename = `${Date.now()}-${file.name}`;
      const newBlob = await upload(uniqueFilename, file, { access: 'public', handleUploadUrl: '/api/upload' });
      await saveMediaMetadataAction({ url: newBlob.url, groupId: groupId as string, userId: user.uid, userName: user.displayName || user.email || "Nutzer" });
      setActiveTab("gallery");
    } catch (err: any) { alert("Upload fehlgeschlagen."); } finally { setIsUploading(false); }
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
      link.href = blobUrl; link.download = filename;
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); window.URL.revokeObjectURL(blobUrl);
    } catch (error) { window.open(url, '_blank'); }
  };

  if (!group || !user) return <div className="p-20 text-center font-black animate-pulse opacity-10 uppercase tracking-widest text-foreground">Authorizing...</div>;

  // 🔴 LOCK SCREEN FOR NON-MEMBERS
  if (!isMember) {
    return (
      <SiteLayoutClient activePage="qloud">
        <div className="min-h-[70vh] flex items-center justify-center p-6">
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl bg-card border border-border rounded-[4rem] p-12 text-center shadow-2xl space-y-10">
              <div className="flex justify-center">
                 <div className="p-10 bg-primary/10 rounded-[2.5rem] text-primary relative">
                    <Lock size={64} />
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
                 </div>
              </div>
              <div className="space-y-4">
                 <h1 className="text-5xl font-black italic uppercase tracking-tighter text-foreground">{group.name}</h1>
                 <p className="text-xs font-black uppercase text-primary italic tracking-[0.3em]">Authorized Members Only</p>
                 <p className="text-foreground/40 text-sm italic max-w-sm mx-auto">Dieser Node ist verschlüsselt. Bitte sende eine Beitrittsanfrage an den Admin, um Zugriff auf den Content zu erhalten.</p>
              </div>
              <div className="pt-6">
                 {requestSent ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-10 py-6 bg-primary text-secondary rounded-2xl font-black italic uppercase text-xs flex items-center justify-center gap-3">
                       <CheckCircle2 size={24} /> Anfrage Gesendet!
                    </motion.div>
                 ) : (
                    <button 
                       onClick={handleRequestAccess}
                       disabled={isRequesting}
                       className="w-full py-8 bg-foreground text-background rounded-[2rem] font-black italic uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-4"
                    >
                       {isRequesting ? <Clock className="animate-spin" /> : <UserPlus size={24} />} 
                       Zutritt Anfordern
                    </button>
                 )}
              </div>
              <button onClick={() => router.push("/modules/qloud")} className="text-[10px] font-black uppercase text-foreground/20 italic tracking-widest hover:text-foreground transition-colors">Zurück zum Dashboard</button>
           </motion.div>
        </div>
      </SiteLayoutClient>
    );
  }

  const pendingMedia = media.filter(m => m.status === "PENDING");
  const approvedMedia = media.filter(m => m.status === "APPROVED");

  return (
    <SiteLayoutClient activePage="qloud">
      {/* REST OF THE UI AS BEFORE... */}
      <div className="space-y-8 pb-32 relative px-4 md:px-0">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border">
           <div className="flex items-center gap-6">
              <button onClick={() => router.push("/modules/qloud")} className="p-4 bg-foreground/5 rounded-2xl text-foreground/40 hover:bg-foreground/10 transition-colors"><ArrowLeft size={20} /></button>
              <div>
                 <h1 className="text-3xl md:text-5xl font-black text-foreground italic uppercase">{group.name}</h1>
                 <p className="text-[10px] font-black uppercase text-primary italic tracking-widest mt-1">Authorized Access Network</p>
              </div>
           </div>
           <button onClick={() => setIsQrOpen(true)} className="px-8 py-4 bg-primary text-secondary rounded-2xl flex items-center gap-3 text-[10px] font-black italic uppercase shadow-xl shadow-primary/20"><QrCode size={18} /> Invite guests</button>
        </header>

        <nav className="flex items-center gap-2 p-1.5 bg-foreground/5 rounded-2xl border border-border w-fit overflow-x-auto max-w-full">
           <button onClick={() => setActiveTab("chat")} className={`px-8 py-4 rounded-xl text-[10px] font-black italic uppercase transition-all ${activeTab === 'chat' ? 'bg-primary text-secondary' : 'text-foreground/40'}`}>Feed</button>
           <button onClick={() => setActiveTab("gallery")} className={`px-8 py-4 rounded-xl text-[10px] font-black italic uppercase transition-all ${activeTab === 'gallery' ? 'bg-primary text-secondary' : 'text-foreground/40'}`}>Galerie {approvedMedia.length > 0 && `(${approvedMedia.length})`}</button>
           {isModerator && <button onClick={() => setActiveTab("moderation")} className={`px-8 py-4 rounded-xl text-[10px] font-black italic uppercase transition-all ${activeTab === 'moderation' ? 'bg-amber-500 text-black shadow-lg animate-pulse' : 'text-amber-500/40'}`}>Moderation {pendingMedia.length > 0 && <span className="text-[8px]">{pendingMedia.length}</span>}</button>}
           {isAdmin && <button onClick={() => setActiveTab("admin")} className={`px-8 py-4 rounded-xl text-[10px] font-black italic uppercase transition-all ${activeTab === 'admin' ? 'bg-foreground text-background shadow-lg' : 'text-foreground/40'}`}>Admin</button>}
        </nav>

        <main className="min-h-[400px]">
           <AnimatePresence mode="wait">
              {activeTab === "chat" && (
                <motion.section key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-[650px] bg-card border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
                   <div className="flex-1 p-8 overflow-y-auto space-y-6">
                      {messages.map((msg, idx) => (
                         <div key={idx} className={`flex flex-col ${msg.userId === user?.uid ? 'items-end' : 'items-start'}`}>
                            <div className={`p-5 rounded-[2.5rem] shadow-sm ${msg.userId === user?.uid ? 'bg-primary text-secondary' : 'bg-foreground/5 text-foreground border border-border'}`}>
                               <p className="text-[7px] font-black uppercase mb-1 opacity-40 italic">{msg.userName}</p>
                               <p className="text-sm font-medium">{msg.content}</p>
                            </div>
                         </div>
                      ))}
                      <div ref={chatEndRef} />
                   </div>
                   <form onSubmit={sendMessage} className="p-8 bg-foreground/[0.02] border-t border-border flex gap-4">
                      <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="DEINE NACHRICHT..." className="flex-1 bg-card border border-border rounded-2xl px-10 py-5 text-xs font-black italic outline-none focus:border-primary transition-all text-foreground placeholder:text-foreground/20" />
                      <button className="p-6 bg-primary text-secondary rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"><Send size={24} /></button>
                   </form>
                </motion.section>
              )}

              {activeTab === "gallery" && (
                <motion.section key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                   <div className="flex items-center justify-between border-b border-border pb-6">
                      <h2 className="text-3xl font-black italic uppercase text-foreground">Live-Moments</h2>
                      <label htmlFor="media-upload" className="px-10 py-5 bg-primary text-secondary rounded-2xl text-xs font-black italic uppercase flex items-center gap-3 cursor-pointer shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                         <input type="file" id="media-upload" accept="image/*" className="hidden" onChange={uploadMedia} />
                         {isUploading ? <Clock className="animate-spin" /> : <Upload />} BILD HOCHLADEN
                      </label>
                   </div>
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {approvedMedia.map((item) => (
                        <div key={item.id} className="group relative aspect-square bg-foreground/5 rounded-[2.5rem] overflow-hidden border border-border shadow-sm">
                           <img src={item.url} onClick={() => setSelectedImage(item)} className="w-full h-full object-cover transition-transform group-hover:scale-110 cursor-pointer" />
                           <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleDownload(item.url, "bild.jpg")} className="p-2.5 bg-background/80 backdrop-blur-md rounded-xl text-foreground hover:bg-primary hover:text-secondary shadow-lg"><Download size={14} /></button>
                              {isModerator && <button onClick={() => handleDeleteMedia(item.id)} className="p-2.5 bg-red-500/80 rounded-xl text-white shadow-lg"><Trash2 size={14} /></button>}
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.section>
              )}

              {isAdmin && activeTab === "admin" && (
                <motion.section key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                   {/* 🚨 JOIN REQUESTS SECTION */}
                   {joinRequests.length > 0 && (
                     <div className="bg-primary/5 border border-primary/20 rounded-[3rem] p-10 space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="p-4 bg-primary rounded-2xl text-secondary"><UserPlus size={24} /></div>
                           <div>
                              <h3 className="text-2xl font-black italic uppercase text-primary">Offene Beitrittsanfragen</h3>
                              <p className="text-[10px] font-black uppercase text-primary/60 italic tracking-widest mt-1">Status: Restricted Nodes wait for Auth</p>
                           </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                           {joinRequests.map((req) => (
                             <div key={req.requestId} className="p-6 bg-card border border-primary/20 rounded-3xl flex items-center justify-between">
                                <div className="flex items-center gap-3 text-foreground">
                                   <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black italic">{req.userName[0]}</div>
                                   <div className="font-black italic uppercase text-xs">{req.userName}</div>
                                </div>
                                <div className="flex gap-2">
                                   <button onClick={() => handleResolveRequest(req.userId, req.userName, true)} className="p-3 bg-primary text-secondary rounded-xl hover:scale-105 transition-all"><Check size={18} /></button>
                                   <button onClick={() => handleResolveRequest(req.userId, req.userName, false)} className="p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X size={18} /></button>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                                 <div className="bg-card border border-border rounded-[3.5rem] p-12 space-y-12 shadow-2xl">
                      <div className="flex items-center gap-8 text-foreground"><ShieldAlert size={40} className="text-primary" /><h2 className="text-3xl font-black italic uppercase">Netzwerk Admin</h2></div>
                      <div className="p-10 bg-foreground/5 rounded-[3rem] border border-border">
                         <h3 className="text-xs font-black uppercase italic tracking-[0.3em] text-foreground/40 mb-8 border-b border-border pb-4 text-center">Mitglieder-Verzeichnis</h3>
                         <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                            {group.members?.map((m: any, i: number) => (
                               <div key={i} className="p-6 bg-card border border-border rounded-[2rem] flex justify-between items-center shadow-sm hover:border-primary/20 transition-all">
                                  <div className="flex items-center gap-4 text-foreground">
                                     <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/60 font-black italic">{m.name?.[0]}</div>
                                     <div className="flex flex-col"><span className="text-base font-black italic uppercase">{m.name || "Gast"}</span><span className="text-[9px] font-black uppercase text-foreground/30 italic tracking-widest">{m.role}</span></div>
                                  </div>
                                  {group.adminId !== m.userId && (
                                    <button onClick={() => handleToggleModerator(m.userId, m.role === 'moderator')} className={`px-5 py-3 rounded-2xl transition-all text-[10px] font-black uppercase italic shadow-sm ${m.role === 'moderator' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-foreground/5 text-foreground/40 border border-border'}`}>Moderator</button>
                                  )}
                               </div>
                            ))}
                         </div>
                      </div>
                      <div className="pt-12 border-t border-border flex flex-col items-center">
                         <button onClick={handleDeleteGroup} className="w-full py-8 bg-red-500/10 text-red-500 border border-red-500/20 font-black italic uppercase rounded-[2.5rem] hover:bg-red-500 hover:text-white transition-all shadow-sm">Node permanent löschen</button>
                      </div>
                   </div>
    </div>
                </motion.section>
              )}
           </AnimatePresence>
        </main>
      </div>

      {/* QR MODAL */}
      <AnimatePresence>
        {isQrOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsQrOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-card text-foreground w-full max-w-lg shadow-2xl rounded-[3.5rem] p-10 border border-border">
                <div className="space-y-12 flex flex-col items-center">
                   <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-center">Join the <span className="text-primary italic">Qloud.</span></h3>
                   <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-slate-50"><QRCodeSVG value={typeof window !== 'undefined' ? window.location.href : '/'} size={220} level="H" /></div>
                   <div className="w-full space-y-4">
                      <div className="p-6 bg-foreground/5 border border-border rounded-3xl flex items-center justify-between shadow-inner"><code className="text-[10px] font-bold text-foreground/40 truncate mr-4 italic">Identifier: {groupId}</code><button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`p-4 rounded-xl transition-all shadow-md ${copied ? 'bg-green-500 text-white' : 'bg-foreground/10 text-foreground'}`}>{copied ? <Check size={20} /> : <Copy size={20} />}</button></div>
                      <p className="text-center text-[10px] font-black uppercase text-foreground/40 italic tracking-widest leading-relaxed">Gäste müssen eine Beitrittsanfrage senden.<br /> Genehmigung erfolgt durch den Admin.</p>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4">
             <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"><X size={32} /></button>
             <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="relative max-w-6xl w-full flex flex-col items-center">
                <img src={selectedImage.url} className="max-w-full max-h-[75vh] object-contain rounded-[3rem] shadow-2xl border-4 border-white/5" />
                <div className="mt-8 flex items-center gap-10">
                   <div className="flex flex-col text-left border-l-4 border-primary pl-6">
                      <span className="text-[8px] font-black uppercase text-primary tracking-[0.3em] italic mb-1">Captured Node</span>
                      <span className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">{selectedImage.userName}</span>
                   </div>
                   <button onClick={() => handleDownload(selectedImage.url, "bild.jpg")} className="px-10 py-5 bg-primary text-secondary rounded-[1.5rem] font-black italic uppercase text-xs flex items-center gap-4 shadow-2xl shadow-primary/20"><Download size={20} /> Download</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SiteLayoutClient>
  );
}
