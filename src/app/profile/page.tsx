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
  ChevronRight,
  X,
  Edit3,
  Key,
  Trash2,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { 
  updatePassword, 
  deleteUser, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithPopup
} from "firebase/auth";
import { AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/");
      } else {
        setUser(currentUser);
        setNewName(currentUser.displayName || "");
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    setStatus(null);
    try {
      await updateProfile(user, { displayName: newName });
      setStatus({ type: 'success', msg: "Profil erfolgreich aktualisiert!" });
    } catch (error: any) {
      setStatus({ type: 'error', msg: error.message });
    }
    setIsUpdating(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentPassword || !newPassword) return;
    setIsUpdating(true);
    setStatus(null);
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setStatus({ type: 'success', msg: "Passwort erfolgreich geändert!" });
      setNewPassword("");
      setCurrentPassword("");
    } catch (error: any) {
      setStatus({ type: 'error', msg: "Re-Authentifizierung fehlgeschlagen oder Passwort zu schwach." });
    }
    setIsUpdating(false);
  };

  const handleLinkGoogle = async () => {
    if (!user) return;
    setIsUpdating(true);
    setStatus(null);
    try {
      const provider = new GoogleAuthProvider();
      await linkWithPopup(user, provider);
      setStatus({ type: 'success', msg: "Konto erfolgreich mit Google verknüpft!" });
      // Refresh user data
      setUser(auth.currentUser);
    } catch (error: any) {
      setStatus({ type: 'error', msg: "Verknüpfung fehlgeschlagen: " + error.message });
    }
    setIsUpdating(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirm = window.confirm("Bist du absolut sicher? Dein Account wird unwiderruflich gelöscht.");
    if (!confirm) return;
    
    setIsUpdating(true);
    try {
      await deleteUser(user);
      router.push("/");
    } catch (error: any) {
      alert("Bitte logge dich erneut ein, um deinen Account zu löschen (Sicherheitsmaßnahme).");
    }
    setIsUpdating(false);
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
              <div className="absolute inset-0 bg-gradient-primary blur-[30px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
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
              <div className="absolute -bottom-2 -right-2 bg-gradient-primary text-secondary p-2 rounded-xl shadow-lg">
                <ShieldCheck size={20} />
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-foreground italic uppercase tracking-tighter leading-none mb-2">
                {user?.isAnonymous ? 'Guest' : 'User'} <br /> <span className="text-gradient">Profile.</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                 <div className={`px-3 py-1 ${user?.isAnonymous ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-green-500/10 border-green-500/20 text-green-500'} border rounded-full flex items-center gap-2`}>
                    <div className={`w-2 h-2 ${user?.isAnonymous ? 'bg-amber-500' : 'bg-green-500'} rounded-full animate-pulse`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest italic">{user?.isAnonymous ? 'Gast-Account' : 'Identity Verified'}</span>
                 </div>
                 {user?.isAnonymous && (
                   <button 
                     onClick={() => setIsSettingsOpen(true)}
                     className="px-3 py-1 bg-gradient-primary text-secondary text-[10px] font-black uppercase tracking-widest italic rounded-full shadow-lg shadow-glow-primary hover:scale-105 transition-all"
                   >
                     Konto sichern
                   </button>
                 )}
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
                      <div className="p-3 bg-foreground/5 rounded-xl"><Mail size={20} className="text-gradient" /></div>
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
                    <div className="p-4 bg-gradient-primary opacity-20 rounded-2xl group-hover:scale-110 transition-transform"><Zap className="text-secondary" size={24} /></div>
                    <div>
                       <h3 className="font-black italic uppercase tracking-widest text-xs">Auth Method</h3>
                       <p className="text-xs text-foreground/40 italic font-medium">
                         {user?.isAnonymous ? 'Temporary Guest Access' : (user?.providerData[0]?.providerId === 'google.com' ? 'Connected with Google' : 'Local System Account')}
                       </p>
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
        <section className="bg-card border border-border rounded-[3rem] p-8 md:p-12 relative overflow-hidden group">
           <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[120%] bg-primary/5 blur-[80px] rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
              <div className="space-y-4 text-center md:text-left">
                 <h2 className="text-3xl font-black text-foreground italic uppercase tracking-tighter leading-tight">Identity & <br /><span className="text-gradient">Control.</span></h2>
                 <p className="text-xs text-foreground/40 italic font-medium max-w-sm">
                   Verwalte deine persönlichen Daten, ändere dein Passwort oder lösche dein System-Profil dauerhaft aus der PowerNode-Infrastruktur.
                 </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                 <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-foreground/5 border border-border text-foreground font-black italic uppercase rounded-2xl tracking-widest text-sm hover:bg-foreground/10 transition-all flex items-center justify-center gap-3"
                 >
                    <Settings size={18} /> Settings
                 </button>
                 <button 
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-primary text-secondary font-black italic uppercase rounded-2xl tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-glow-primary flex items-center justify-center gap-3"
                 >
                    <LogOut size={18} /> Logout
                 </button>
              </div>
           </div>
        </section>

        {/* SETTINGS MODAL */}
        <AnimatePresence>
           {isSettingsOpen && (
              <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                 <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  onClick={() => setIsSettingsOpen(false)} 
                  className="absolute inset-0 bg-black/60 backdrop-blur-md" 
                 />
                 <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                  className="relative w-full max-w-2xl bg-card border border-border rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                 >
                    <div className="p-8 border-b border-border flex items-center justify-between bg-foreground/[0.02]">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-primary rounded-2xl text-secondary"><Settings size={24} /></div>
                          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Profile <span className="text-gradient">Settings.</span></h2>
                       </div>
                       <button onClick={() => setIsSettingsOpen(false)} className="p-3 hover:bg-foreground/5 rounded-full transition-colors"><X size={20} /></button>
                    </div>

                    <div className="p-8 space-y-10 overflow-y-auto">
                       {user?.isAnonymous && (
                          <div className="p-6 bg-gradient-primary rounded-[2rem] text-secondary space-y-4 shadow-glow-primary">
                             <div className="flex items-center gap-3">
                                <Zap size={20} />
                                <h3 className="font-black italic uppercase text-sm">Konto jetzt sichern</h3>
                             </div>
                             <p className="text-[10px] font-medium italic opacity-80 leading-relaxed">
                                Dein Gast-Konto ist temporär. Verknüpfe es jetzt mit Google, um deine Daten dauerhaft zu speichern und von überall darauf zuzugreifen.
                             </p>
                             <button 
                                onClick={handleLinkGoogle}
                                disabled={isUpdating}
                                className="w-full py-3 bg-secondary text-primary font-black italic uppercase rounded-xl text-[10px] tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
                             >
                                <Globe size={14} /> Mit Google verknüpfen
                             </button>
                          </div>
                       )}

                       {status && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className={`p-4 rounded-2xl flex items-center gap-3 font-bold italic text-xs uppercase ${status.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                          >
                             {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                             {status.msg}
                          </motion.div>
                       )}

                       {/* 1. DISPLAY NAME */}
                       <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 italic flex items-center gap-2"><Edit3 size={10} /> Identity Mapping</p>
                          <form onSubmit={handleUpdateProfile} className="flex gap-4">
                             <input 
                              type="text" 
                              value={newName} 
                              onChange={(e) => setNewName(e.target.value)}
                              placeholder="Neuer Anzeigename"
                              className="flex-1 bg-foreground/5 border border-border rounded-2xl px-6 py-4 font-bold italic text-sm outline-none focus:border-primary/50 transition-all"
                             />
                             <button 
                              disabled={isUpdating}
                              className="px-6 py-4 bg-gradient-primary text-secondary font-black italic uppercase rounded-2xl text-xs hover:scale-105 transition-all disabled:opacity-50"
                             >
                                Update
                             </button>
                          </form>
                       </div>

                       {/* 2. PASSWORD CHANGE (Only for Email users) */}
                       {user?.providerData[0]?.providerId === 'password' && (
                          <div className="space-y-4 pt-6 border-t border-border">
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 italic flex items-center gap-2"><Key size={10} /> Access Security</p>
                             <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <input 
                                 type="password" 
                                 value={currentPassword} 
                                 onChange={(e) => setCurrentPassword(e.target.value)}
                                 placeholder="Aktuelles Passwort"
                                 className="w-full bg-foreground/5 border border-border rounded-2xl px-6 py-4 font-bold italic text-sm outline-none focus:border-primary/50 transition-all"
                                />
                                <div className="flex gap-4">
                                   <input 
                                    type="password" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Neues Passwort"
                                    className="flex-1 bg-foreground/5 border border-border rounded-2xl px-6 py-4 font-bold italic text-sm outline-none focus:border-primary/50 transition-all"
                                   />
                                   <button 
                                    disabled={isUpdating}
                                    className="px-6 py-4 bg-foreground/5 border border-border text-foreground font-black italic uppercase rounded-2xl text-xs hover:bg-foreground/10 transition-all disabled:opacity-50"
                                   >
                                      Change
                                   </button>
                                </div>
                             </form>
                          </div>
                       )}

                       {/* 3. DANGER ZONE */}
                       <div className="space-y-4 pt-10 border-t border-border">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/60 italic flex items-center gap-2"><Trash2 size={10} /> Danger Zone</p>
                          <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-[2rem] space-y-6">
                             <div className="space-y-1">
                                <h4 className="text-sm font-black italic uppercase text-red-500">System-Account löschen</h4>
                                <p className="text-[10px] text-foreground/40 italic font-medium">Dies wird all deine Daten, Verknüpfungen und Zugänge dauerhaft entfernen. Dieser Schritt kann nicht rückgängig gemacht werden.</p>
                             </div>
                             <button 
                              onClick={handleDeleteAccount}
                              className="w-full py-4 bg-red-500 text-white font-black italic uppercase rounded-xl text-xs hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-500/10"
                             >
                                <Trash2 size={16} /> Account unwiderruflich löschen
                             </button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>

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
