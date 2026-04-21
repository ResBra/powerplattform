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
   UserPlus,
   MessageCircle,
   UserMinus
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import {
   collection,
   addDoc,
   onSnapshot,
   serverTimestamp,
   doc,
   getDoc,
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
   resolveJoinRequestAction,
   requestJoinAction,
   kickMemberAction
} from "../actions";
import { QRCodeCanvas } from "qrcode.react";
import { uploadImage } from '@/lib/storage';

export default function GroupClient() {
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
   const [processingMemberId, setProcessingMemberId] = useState<string | null>(null);
   const [dbStatus, setDbStatus] = useState<"connected" | "error" | "linking">("linking");
   const [copied, setCopied] = useState(false);
   const chatEndRef = useRef<HTMLDivElement>(null);
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

         if (isActuallyMember) {
            joinGroupAction(groupId as string, user.uid, user.displayName || user.email?.split('@')[0] || "Nutzer");
         }
      }
   }, [user, group, groupId]);

   // 3. REAL-TIME DATA LISTENERS
   useEffect(() => {
      if (!groupId) return;

      const unsubGroup = onSnapshot(doc(db, "groups", groupId as string), (docSnap) => {
         if (!docSnap.exists()) return router.push("/modules/qloud");
         const data = docSnap.data();
         setGroup((prev: any) => ({ ...prev, id: docSnap.id, ...data }));
      });

      const unsubMembers = onSnapshot(collection(db, "groups", groupId as string, "members"), (snap) => {
         const memberList = snap.docs.map(d => ({ userId: d.id, ...d.data() }));
         setGroup((prev: any) => ({ ...prev, members: memberList }));
      });

      let unsubRequests: any = null;
      if (isModerator) {
         unsubRequests = onSnapshot(collection(db, "groups", groupId as string, "joinRequests"), (snap) => {
            const reqs = snap.docs.map(d => ({ requestId: d.id, ...d.data() }));
            setJoinRequests(reqs);
         });
      }

      const msgCol = collection(db, "groups", groupId as string, "messages");
      const unsubMessages = onSnapshot(msgCol, (snap) => {
         setDbStatus("connected");
         const msgs = snap.docs.map(d => ({ id: d.id, ...d.data(), time: d.data().createdAt?.toMillis() || d.data().fallbackTime || 0 }));
         setMessages(msgs.sort((a, b) => a.time - b.time).slice(-50));
      });

      const unsubMedia = onSnapshot(collection(db, "groups", groupId as string, "media"), (snap) => {
         const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
         setMedia(items.sort((a: any, b: any) => (b.uploadedAt?.toMillis() || 0) - (a.uploadedAt?.toMillis() || 0)));
      });

      return () => {
         unsubGroup(); unsubMembers(); unsubMessages(); unsubMedia();
         if (unsubRequests) unsubRequests();
      };
   }, [groupId, router, isModerator]);

   // 4. ACTION HANDLERS
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
         const url = await uploadImage(file, 'qloud');
         await saveMediaMetadataAction({ url, groupId: groupId as string, userId: user.uid, userName: user.displayName || user.email || "Nutzer" });
         setActiveTab("gallery");
      } catch (err: any) { alert("Upload fehlgeschlagen."); } finally { setIsUploading(false); }
   };

   const handleApproveMedia = async (mediaId: string) => {
      if (!isModerator) return;
      await approveMediaAction(groupId as string, mediaId);
   };

   const handleDeleteMedia = async (mediaId: string) => {
      if (!isModerator || !window.confirm("Dieses Bild permanent entfernen?")) return;
      await deleteMediaAction(groupId as string, mediaId);
   };

   const handleToggleModerator = async (targetUserId: string) => {
      if (!isAdmin) return;
      setProcessingMemberId(targetUserId);
      try {
         const res = await toggleModeratorAction(groupId as string, targetUserId);
         if (!res.success) alert("Fehler: " + res.error);
      } catch (err) {
         alert("Verbindungsfehler bei der Rollenänderung.");
      } finally {
         setProcessingMemberId(null);
      }
   };

   const handleKickMember = async (targetUserId: string, targetUserName: string) => {
      if (!isAdmin || !window.confirm(`Möchtest du ${targetUserName} wirklich aus der Qloud entfernen?`)) return;
      setProcessingMemberId(targetUserId);
      try {
         const res = await kickMemberAction(groupId as string, targetUserId);
         if (!res.success) alert("Fehler: " + res.error);
      } catch (err) {
         alert("Verbindungsfehler beim Entfernen des Mitglieds.");
      } finally {
         setProcessingMemberId(null);
      }
   };

   const handlePrintQR = () => {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
         alert("QR-Code noch nicht geladen.");
         return;
      }
      const dataUrl = canvas.toDataURL("image/png");
      const windowContent = `<!DOCTYPE html><html><head><title>Print QR</title></head><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#fff;margin:0;">
         <div style="border:4px solid #000;padding:40px;border-radius:40px;text-align:center;">
            <h1 style="font-size:48px;margin-bottom:10px;text-transform:uppercase;">${group?.name}</h1>
            <p style="font-size:18px;letter-spacing:0.2em;color:#666;margin-bottom:40px;">AUTHORIZED NODE ACCESS</p>
            <img src="${dataUrl}" style="width:400px;height:400px;"/>
            <p style="margin-top:40px;font-size:24px;font-weight:bold;">Scan to join the Qloud.</p>
         </div>
         <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500);}</script>
      </body></html>`;
      const printWin = window.open('', '', 'width=900,height=900');
      printWin?.document.open();
      printWin?.document.write(windowContent);
      printWin?.document.close();
   };

   const handleShare = async () => {
      const shareData = {
         title: `${group?.name} | Qloud Hub`,
         text: `Tritt meiner Qloud "${group?.name}" bei!`,
         url: window.location.href,
      };
      if (navigator.share) {
         try { await navigator.share(shareData); } catch (err) { console.error(err); }
      } else {
         navigator.clipboard.writeText(window.location.href);
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
      }
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

   if (!group || !user) {
      return (
         <SiteLayoutClient activePage="qloud">
            <div className="p-20 text-center font-black animate-pulse opacity-10 uppercase tracking-widest text-foreground">Authorizing...</div>
         </SiteLayoutClient>
      );
   }

   if (!isMember) {
      return (
         <SiteLayoutClient activePage="qloud">
            <div className="min-h-[70vh] flex items-center justify-center p-4 md:p-6">
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl bg-card border border-border rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-12 text-center shadow-2xl space-y-8 md:space-y-10">
                  <div className="flex justify-center">
                     <div className="p-6 md:p-10 bg-primary/10 rounded-[2rem] md:rounded-[2.5rem] text-primary relative">
                        <Lock className="w-12 h-12 md:w-16 md:h-16" />
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
                     </div>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                     <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground">{group.name}</h1>
                     <p className="text-[10px] md:text-xs font-black uppercase text-primary italic tracking-widest">Authorized Members Only</p>
                     <p className="text-foreground/40 text-[10px] md:text-sm italic max-w-sm mx-auto">Dieser Node ist verschlüsselt. Bitte sende eine Beitrittsanfrage an den Admin, um Zugriff auf den Content zu erhalten.</p>
                  </div>
                  <div className="pt-4 md:pt-6">
                     {requestSent ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-6 py-4 md:px-10 md:py-6 bg-primary text-secondary rounded-2xl font-black italic uppercase text-xs flex items-center justify-center gap-3">
                           <CheckCircle2 size={24} /> Anfrage Gesendet!
                        </motion.div>
                     ) : (
                        <button onClick={handleRequestAccess} disabled={isRequesting} className="w-full py-6 md:py-8 bg-foreground text-background rounded-[1.5rem] md:rounded-[2rem] font-black italic uppercase text-xs md:text-sm tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-4">
                           {isRequesting ? <Clock className="animate-spin" /> : <UserPlus size={20} />}
                           Zutritt Anfordern
                        </button>
                     )}
                  </div>
                  <button onClick={() => router.push("/modules/qloud")} className="text-[8px] md:text-[10px] font-black uppercase text-foreground/20 italic tracking-widest hover:text-foreground transition-colors">Zurück zum Dashboard</button>
               </motion.div>
            </div>
         </SiteLayoutClient>
      );
   }

   const pendingMedia = media.filter(m => m.status === "PENDING");
   const approvedMedia = media.filter(m => m.status === "APPROVED");

   return (
      <SiteLayoutClient activePage="qloud">
         <div className="space-y-8 pb-32 relative px-4 md:px-0">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
               <div className="flex items-center gap-4">
                  <button onClick={() => router.push("/modules/qloud")} className="p-3 bg-foreground/5 rounded-2xl text-foreground/40 hover:bg-foreground/10 transition-colors shrink-0"><ArrowLeft size={18} /></button>
                  <div className="min-w-0">
                     <h1 className="text-2xl md:text-5xl font-black text-foreground italic uppercase truncate">{group.name}</h1>
                     <p className="text-[8px] md:text-[10px] font-black uppercase text-primary italic tracking-widest mt-0.5">Authorized Access Network</p>
                  </div>
               </div>
               <button onClick={() => setIsQrOpen(true)} className="w-full md:w-auto px-6 py-4 bg-primary text-secondary rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black italic uppercase shadow-xl shadow-primary/20"><QrCode size={16} /> Invite guests</button>
            </header>

            <nav className="flex items-center gap-2 p-1.5 bg-foreground/5 rounded-2xl border border-border w-fit overflow-x-auto max-w-full">
               <button onClick={() => setActiveTab("chat")} className={`px-8 py-4 rounded-xl text-[10px] font-black italic uppercase transition-all ${activeTab === 'chat' ? 'bg-primary text-secondary' : 'text-foreground/40'}`}>Feed</button>
               <button onClick={() => setActiveTab("gallery")} className={`px-8 py-4 rounded-xl text-[10px] font-black italic uppercase transition-all ${activeTab === 'gallery' ? 'bg-primary text-secondary' : 'text-foreground/40'}`}>Galerie {approvedMedia.length > 0 && `(${approvedMedia.length})`}</button>
               {(isModerator || isAdmin) && <button onClick={() => setActiveTab("moderation")} className={`px-8 py-4 rounded-xl text-[10px] font-black italic uppercase transition-all ${activeTab === 'moderation' ? 'bg-amber-500 text-black shadow-lg animate-pulse' : 'text-amber-500/40'}`}>Moderation {(pendingMedia.length + joinRequests.length) > 0 && <span className="text-[8px] ml-1">({pendingMedia.length + joinRequests.length})</span>}</button>}
               {isAdmin && <button onClick={() => setActiveTab("admin")} className={`px-8 py-4 rounded-xl text-[10px] font-black italic uppercase transition-all ${activeTab === 'admin' ? 'bg-foreground text-background shadow-lg' : 'text-foreground/40'}`}>Admin</button>}
            </nav>

            <main className="min-h-[400px]">
               <AnimatePresence mode="wait">
                  {activeTab === "chat" && (
                     <motion.section key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-[70vh] md:h-[650px] bg-card border border-white/5 rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden">
                        <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-4 md:space-y-6 custom-scrollbar">
                           {messages.map((msg, idx) => (
                              <div key={idx} className={`flex flex-col ${msg.userId === user?.uid ? 'items-end' : 'items-start'}`}>
                                 <div className={`p-4 md:p-5 rounded-2xl md:rounded-[2.5rem] shadow-sm max-w-[85%] ${msg.userId === user?.uid ? 'bg-primary text-secondary' : 'bg-foreground/5 text-foreground border border-border'}`}>
                                    <p className="text-[7px] font-black uppercase mb-1 opacity-40 italic">{msg.userName}</p>
                                    <p className="text-xs md:text-sm font-medium">{msg.content}</p>
                                 </div>
                              </div>
                           ))}
                           <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={sendMessage} className="p-4 md:p-8 bg-foreground/[0.02] border-t border-border flex gap-3">
                           <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="NACHRICHT..." className="flex-1 bg-card border border-border rounded-xl md:rounded-2xl px-6 md:px-10 py-4 md:py-5 text-[10px] md:text-xs font-black italic outline-none focus:border-primary transition-all text-foreground placeholder:text-foreground/20" />
                           <button className="p-4 md:p-6 bg-primary text-secondary rounded-xl md:rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"><Send size={20} /></button>
                        </form>
                     </motion.section>
                  )}

                  {activeTab === "gallery" && (
                     <motion.section key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
                           <h2 className="text-2xl md:text-3xl font-black italic uppercase text-foreground">Live-Moments</h2>
                           <label htmlFor="media-upload" className="w-full sm:w-auto px-6 md:px-10 py-4 md:py-5 bg-primary text-secondary rounded-2xl text-[10px] md:text-xs font-black italic uppercase flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                              <input type="file" id="media-upload" accept="image/*" className="hidden" onChange={uploadMedia} />
                              {isUploading ? <Clock className="animate-spin" /> : <Upload size={18} />} BILD HOCHLADEN
                           </label>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                           {approvedMedia.map((item) => (
                              <div key={item.id} className="group relative aspect-square bg-foreground/5 rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-border shadow-sm">
                                 <img src={item.url} onClick={() => setSelectedImage(item)} className="w-full h-full object-cover transition-transform group-hover:scale-110 cursor-pointer" />
                                 <div className="absolute top-2 right-2 md:top-4 md:right-4 flex gap-1.5 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDownload(item.url, "bild.jpg")} className="p-2 md:p-2.5 bg-background/80 backdrop-blur-md rounded-lg md:rounded-xl text-foreground hover:bg-primary hover:text-secondary shadow-lg"><Download size={14} /></button>
                                    {isModerator && <button onClick={() => handleDeleteMedia(item.id)} className="p-2 md:p-2.5 bg-red-500/80 rounded-lg md:rounded-xl text-white shadow-lg"><Trash2 size={14} /></button>}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </motion.section>
                  )}

                  {activeTab === "moderation" && (isModerator || isAdmin) && (
                     <motion.section key="moderation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                        {/* 1. BEITRITTSANFRAGEN */}
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-6 md:p-10 space-y-8 shadow-xl">
                           <div className="flex items-center gap-4">
                              <div className="p-4 bg-amber-500 rounded-2xl text-black"><CheckCircle2 size={24} /></div>
                              <h2 className="text-2xl font-black italic uppercase text-amber-500">Zutritts-Anfragen</h2>
                           </div>
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {joinRequests.map((req) => (
                                 <div key={req.requestId} className="p-5 bg-card border border-border rounded-[1.5rem] flex items-center justify-between shadow-2xl gap-4">
                                    <span className="font-black italic uppercase text-[10px] truncate">{req.userName}</span>
                                    <div className="flex gap-2 shrink-0">
                                       <button onClick={() => handleResolveRequest(req.userId, req.userName, true)} className="p-2.5 bg-green-500 text-white rounded-xl hover:scale-110 transition-all"><Check size={16} /></button>
                                       <button onClick={() => handleResolveRequest(req.userId, req.userName, false)} className="p-2.5 bg-red-500 text-white rounded-xl hover:scale-110 transition-all"><X size={16} /></button>
                                    </div>
                                 </div>
                              ))}
                              {joinRequests.length === 0 && <p className="col-span-full py-10 text-center text-foreground/20 font-black italic uppercase tracking-widest text-[10px]">Keine offenen Anfragen</p>}
                           </div>
                        </div>

                         {/* 2. BILD-FREIGABE */}
                         <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 md:p-10 space-y-8 shadow-xl">
                            <div className="flex items-center gap-4">
                               <div className="p-4 bg-primary rounded-2xl text-secondary"><ImageIcon size={24} /></div>
                               <h2 className="text-2xl font-black italic uppercase text-primary">Medien Freigabe</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                               {pendingMedia.map((item) => (
                                  <div key={item.id} className="relative flex flex-col bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl group hover:border-primary/20 transition-all">
                                     <div className="aspect-square relative overflow-hidden">
                                        <img src={item.url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/5">
                                           <p className="text-[8px] font-black uppercase text-white italic tracking-widest">{item.userName}</p>
                                        </div>
                                     </div>
                                     <div className="p-5 bg-foreground/[0.03] flex items-center justify-between gap-3 border-t border-white/5 mt-auto">
                                        <button 
                                          onClick={() => handleDeleteMedia(item.id)}
                                          className="flex-1 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black italic uppercase text-[10px] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-lg"
                                        >
                                           <X size={16} /> Ablehnen
                                        </button>
                                        <button 
                                          onClick={() => handleApproveMedia(item.id)}
                                          className="flex-1 py-4 bg-green-500 text-white rounded-xl font-black italic uppercase text-[10px] hover:scale-[1.02] transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                                        >
                                           <Check size={16} /> Freigeben
                                        </button>
                                     </div>
                                  </div>
                               ))}
                               {pendingMedia.length === 0 && <p className="col-span-full py-10 text-center text-foreground/20 font-black italic uppercase tracking-widest text-[10px]">Alle Medien gesichtet</p>}
                            </div>
                         </div>
                      </motion.section>
                  )}

                  {isAdmin && activeTab === "admin" && (
                     <motion.section key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        {/* MITGLIEDER VERWALTUNG 2.0 */}
                        <div className="bg-card border border-border rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-12 space-y-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border-t-white/5 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Users size={300} /></div>
                           
                           <div className="relative">
                              <div className="flex items-center gap-6 mb-12">
                                 <div className="p-5 bg-primary rounded-3xl text-secondary shadow-2xl shadow-primary/30"><Users size={32} /></div>
                                 <div>
                                    <h2 className="text-4xl font-black italic uppercase text-foreground leading-none">Management</h2>
                                    <p className="text-[10px] font-black uppercase text-primary italic tracking-widest mt-2">Node Member Directory & Permissions</p>
                                 </div>
                              </div>

                              <div className="grid gap-6">
                                 {group.members?.map((m: any, i: number) => (
                                    <div key={i} className="group p-6 bg-foreground/[0.03] border border-white/5 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-6 hover:bg-foreground/[0.05] transition-all hover:border-primary/20">
                                       <div className="flex items-center gap-6 w-full sm:w-auto">
                                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black italic text-xl shadow-inner ${m.role === 'admin' ? 'bg-primary text-secondary' : m.role === 'moderator' ? 'bg-amber-500 text-black' : 'bg-foreground/10 text-foreground/40'}`}>
                                             {m.name?.[0] || "?"}
                                          </div>
                                          <div>
                                             <div className="flex items-center gap-3">
                                                <span className="text-xl font-black italic uppercase text-foreground">{m.name || "Gast"}</span>
                                                {m.role === 'admin' && <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase italic rounded-full">Owner</span>}
                                                {m.role === 'moderator' && <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black uppercase italic rounded-full">Mod</span>}
                                             </div>
                                             <p className="text-[8px] font-black uppercase text-foreground/30 italic tracking-widest mt-1">ID: {m.userId.slice(0, 12)}...</p>
                                          </div>
                                       </div>

                                       {group.adminId !== m.userId && (
                                          <div className="flex items-center gap-3 w-full sm:w-auto">
                                             <button 
                                                disabled={processingMemberId === m.userId}
                                                onClick={() => handleToggleModerator(m.userId)} 
                                                className={`flex-1 sm:flex-none px-8 py-4 rounded-xl font-black uppercase italic text-[10px] transition-all flex items-center justify-center gap-3 ${m.role === 'moderator' ? 'bg-amber-500 text-black' : 'bg-foreground/10 text-foreground/40 hover:bg-foreground/20'}`}
                                             >
                                                {processingMemberId === m.userId ? <Clock className="animate-spin" size={12} /> : <ShieldCheck size={16} />}
                                                {m.role === 'moderator' ? 'Mod-Rechte entziehen' : 'Zum Moderator machen'}
                                             </button>
                                             
                                             <button 
                                                disabled={processingMemberId === m.userId}
                                                onClick={() => handleKickMember(m.userId, m.name)} 
                                                className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                             >
                                                {processingMemberId === m.userId ? <Clock className="animate-spin" size={16} /> : <UserMinus size={18} />}
                                             </button>
                                          </div>
                                       )}
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className="pt-12 border-t border-white/5 flex flex-col items-center">
                              <p className="text-[10px] font-black uppercase text-red-500/40 italic mb-6 tracking-tighter">Gefahrenzone: Permanenten Löschvorgang einleiten</p>
                              <button onClick={handleDeleteGroup} className="w-full py-8 md:py-10 bg-red-500/5 text-red-500 border border-red-500/20 font-black italic uppercase rounded-[2rem] md:rounded-[3rem] hover:bg-red-500 hover:text-white transition-all shadow-2xl text-xs md:text-sm tracking-[0.3em]">Destruct Node</button>
                           </div>
                        </div>
                     </motion.section>
                  )}
               </AnimatePresence>
            </main>
         </div>

         {/* QR MODAL (Restored & Enhanced) */}
         <AnimatePresence>
            {isQrOpen && (
               <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsQrOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-card text-foreground w-full max-w-lg shadow-2xl rounded-[3.5rem] p-10 border border-border">
                     <div className="space-y-12 flex flex-col items-center">
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-center">Join the <span className="text-primary italic">Qloud.</span></h3>
                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-slate-50">
                           <QRCodeCanvas 
                              value={typeof window !== 'undefined' ? window.location.href : '/'} 
                              size={220} 
                              level="H"
                              includeMargin={true}
                           />
                        </div>
                        <div className="w-full space-y-4">
                           <div className="flex gap-2 w-full">
                              <button onClick={handleShare} className="flex-1 py-4 bg-primary text-secondary rounded-2xl font-black italic uppercase text-[10px] flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-all"><Share2 size={16} /> Link Teilen</button>
                              <a href={`https://wa.me/?text=${encodeURIComponent(`Tritt meiner Qloud bei: ${window.location.href}`)}`} target="_blank" className="p-4 bg-[#25D366] text-white rounded-2xl shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center"><MessageCircle size={20} /></a>
                           </div>
                           <div className="grid grid-cols-2 gap-2">
                              <button onClick={handlePrintQR} className="py-4 bg-foreground/5 border border-border rounded-2xl font-black italic uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-foreground/10 transition-all text-foreground/60"><Printer size={16} /> Drucken</button>
                              <button onClick={() => { 
                                 const canvas = document.querySelector('canvas'); 
                                 if (!canvas) return; 
                                 const link = document.createElement('a'); 
                                 link.download = `QR-Invite-${group?.name}.png`; 
                                 link.href = canvas.toDataURL("image/png"); 
                                 link.click(); 
                              }} className="py-4 bg-foreground/5 border border-border rounded-2xl font-black italic uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-foreground/10 transition-all text-foreground/60"><Download size={16} /> QR Speichern</button>
                           </div>
                           <div className="p-6 bg-foreground/5 border border-border rounded-3xl flex items-center justify-between shadow-inner">
                              <code className="text-[10px] font-bold text-foreground/40 truncate mr-4 italic">Identifier: {groupId}</code>
                              <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`p-4 rounded-xl transition-all shadow-md ${copied ? 'bg-green-500 text-white' : 'bg-foreground/10 text-foreground'}`}>{copied ? <Check size={20} /> : <Copy size={20} />}</button>
                           </div>
                           <p className="text-center text-[10px] font-black uppercase text-foreground/40 italic tracking-widest leading-relaxed mt-4">Gäste müssen eine Beitrittsanfrage senden.<br /> Genehmigung erfolgt durch den Admin.</p>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* FULL IMAGE MODAL */}
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
                        <button onClick={() => handleDownload(selectedImage.url, `qloud-capture-${selectedImage.userName}.jpg`)} className="px-10 py-5 bg-primary text-secondary rounded-[1.5rem] font-black italic uppercase text-xs flex items-center gap-4 shadow-2xl shadow-primary/20"><Download size={20} /> Download</button>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      </SiteLayoutClient>
   );
}
