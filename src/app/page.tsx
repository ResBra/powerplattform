"use client";

import React, { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { createSession } from "@/app/actions/auth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Globe, 
  Zap, 
  Phone, 
  UserCircle,
  Fingerprint,
  ChevronLeft,
  Key,
  Activity
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authMode, setAuthMode] = useState<"choice" | "email" | "phone" | "verify_phone">("choice");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && auth) {
      // Cleanup recaptcha if any
      const existing = document.getElementById("recaptcha-container");
      if (existing) existing.innerHTML = "";
    }
  }, []);

  // RECAPTCHA INITIALIZATION
  const setupRecaptcha = (containerId: string) => {
    if (!auth) return;
    try {
      return new RecaptchaVerifier(auth, containerId, {
        size: "invisible",
        callback: () => { console.log("Recaptcha verified"); }
      });
    } catch (err) {
      console.error("Recaptcha Setup Error:", err);
      setError("Sicherheits-Check konnte nicht geladen werden.");
    }
  };

  async function handleGoogleLogin() {
    if (!auth) return;
    setIsPending(true);
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      await createSession({ 
        id: result.user.uid, 
        username: result.user.email || result.user.displayName || "Google User" 
      });
      router.push("/dashboard");
    } catch (err: any) {
      console.error("DEBUG AUTH ERROR:", err.code);
      if (err.code === "auth/unauthorized-domain") {
        setError("Domain nicht autorisiert: Bitte 'powerplattform.vercel.app' in der Firebase Konsole hinzufügen.");
      } else {
        setError("Google Authentifizierung fehlgeschlagen.");
      }
      setIsPending(false);
    }
  }

  async function handleAnonymousLogin() {
    if (!auth) return;
    setIsPending(true);
    try {
      const result = await signInAnonymously(auth);
      await createSession({ id: result.user.uid, username: "Gast-User" });
      router.push("/dashboard");
    } catch (err: any) {
      setError("Gast-Login fehlgeschlagen.");
      setIsPending(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setIsPending(true);
    setError("");
    try {
      if (isRegistering) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await createSession({ id: result.user.uid, username: result.user.email || email });
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await createSession({ id: result.user.uid, username: result.user.email || email });
      }
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Auth Error Code:", err.code);
      
      const errorMap: Record<string, string> = {
        "auth/email-already-in-use": "Dieses Konto existiert bereits. Bitte nutze den Login oder Google.",
        "auth/account-exists-with-different-credential": "Diese E-Mail ist bereits mit einer anderen Login-Methode (z.B. Google) verknüpft.",
        "auth/weak-password": "Sicherheit ungenügend: Passwort muss mind. 6 Zeichen lang sein.",
        "auth/invalid-email": "Ungültiges E-Mail Format.",
        "auth/user-not-found": "Kein Konto mit dieser E-Mail gefunden.",
        "auth/wrong-password": "Das eingegebene Passwort ist nicht korrekt.",
        "auth/invalid-credential": "Login-Daten nicht korrekt. Prüfe E-Mail und Passwort.",
        "auth/network-request-failed": "Netzwerk-Blockade: Bitte AdBlocker prüfen oder Internetverbindung checken."
      };

      setError(errorMap[err.code] || "System-Fehler: Authentifizierung fehlgeschlagen.");
      setIsPending(false);
    }
  }

  async function handlePhoneRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!auth || !phoneNumber) return;
    setIsPending(true);
    setError("");
    
    try {
      const verifier = setupRecaptcha("phone-recaptcha");
      if (!verifier) throw new Error("Recaptcha failed");
      
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(result);
      setAuthMode("verify_phone");
      setIsPending(false);
    } catch (err: any) {
      console.error(err);
      setError("SMS konnte nicht gesendet werden. Prüfe das Format (+49...)");
      setIsPending(false);
    }
  }

  async function handlePhoneVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmationResult || !verificationCode) return;
    setIsPending(true);
    try {
      const result = await confirmationResult.confirm(verificationCode);
      await createSession({ 
        id: result.user?.uid || "phone-user", 
        username: result.user?.phoneNumber || "Phone User" 
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError("Falscher Verifizierungs-Code.");
      setIsPending(false);
    }
  }

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#050a10] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* HIDDEN RECAPTCHA */}
      <div id="phone-recaptcha"></div>

      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[130px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[130px] rounded-full"></div>
      </div>

      <motion.div 
        layout
        className="w-full max-w-[500px] z-10 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        
        {/* HEADER */}
        <div className="p-10 text-center border-b border-white/5 bg-gradient-to-b from-white/10 to-transparent">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-primary/20 mb-6"
          >
            <ShieldCheck size={32} className="text-secondary" />
          </motion.div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Power<span className="text-primary">Node.</span></h1>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-2">Core Auth v1.0.4</p>
        </div>

        <div className="p-8 md:p-12 min-h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* CHOICE SELECTION */}
            {authMode === "choice" && (
              <motion.div 
                key="choice"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="grid grid-cols-2 gap-4"
              >
                <button 
                  onClick={handleGoogleLogin}
                  disabled={isPending}
                  className="flex flex-col items-center justify-center gap-4 p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-primary/40 transition-all group disabled:opacity-50"
                >
                  <Zap size={28} className="text-primary group-hover:scale-125 transition-transform" />
                  <span className="text-[10px] font-black text-white italic uppercase tracking-widest">Google</span>
                </button>
                
                <button 
                  onClick={() => setAuthMode("email")}
                  className="flex flex-col items-center justify-center gap-4 p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-blue-400/40 transition-all group"
                >
                  <Mail size={28} className="text-blue-400 group-hover:scale-125 transition-transform" />
                  <span className="text-[10px] font-black text-white italic uppercase tracking-widest">E-Mail</span>
                </button>

                <button 
                  onClick={() => setAuthMode("phone")}
                  className="flex flex-col items-center justify-center gap-4 p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-purple-400/40 transition-all group"
                >
                  <Phone size={28} className="text-purple-400 group-hover:scale-125 transition-transform" />
                  <span className="text-[10px] font-black text-white italic uppercase tracking-widest">Telefon</span>
                </button>

                <button 
                  onClick={handleAnonymousLogin}
                  disabled={isPending}
                  className="flex flex-col items-center justify-center gap-4 p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group disabled:opacity-50"
                >
                  <UserCircle size={28} className="text-white/20 group-hover:scale-125 transition-transform" />
                  <span className="text-[10px] font-black text-white italic uppercase tracking-widest">Gast</span>
                </button>
              </motion.div>
            )}

            {/* EMAIL LOGIN/REGISTER */}
            {(authMode === "email") && (
              <motion.div 
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <button onClick={() => setAuthMode("choice")} className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase italic hover:text-white transition-colors">
                  <ChevronLeft size={16} /> Zurück zur Auswahl
                </button>
                
                <form onSubmit={handleEmailAuth} className="space-y-4">
                   <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
                      <input 
                        type="email" 
                        required
                        placeholder="E-MAIL ADRESSE" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-14 pr-6 text-white text-xs font-black italic tracking-widest outline-none focus:border-primary/50 transition-all uppercase"
                      />
                   </div>
                   <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
                      <input 
                        type="password" 
                        required
                        placeholder="PASSWORT (MIN. 6 ZEICHEN)" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-14 pr-6 text-white text-xs font-black italic tracking-widest outline-none focus:border-primary/50 transition-all uppercase"
                      />
                   </div>
                   <button 
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-primary text-secondary font-black py-6 rounded-2xl hover:bg-primary-light transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 uppercase italic tracking-widest disabled:opacity-50"
                   >
                     {isPending ? "SYSTEM SYNC..." : (isRegistering ? "ACCOUNT ERSTELLEN" : "SYSTEM-ZUTRITT")}
                     <ArrowRight size={20} />
                   </button>
                </form>

                <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="w-full text-center text-[10px] font-black text-white/30 uppercase italic hover:text-primary transition-colors tracking-widest"
                >
                  {isRegistering ? "Bereits registriert? Hier einloggen" : "Noch kein Account? Jetzt Registrieren"}
                </button>
              </motion.div>
            )}

            {/* PHONE INPUT */}
            {authMode === "phone" && (
              <motion.div 
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <button onClick={() => setAuthMode("choice")} className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase italic hover:text-white transition-colors">
                  <ChevronLeft size={16} /> Zurück
                </button>
                
                <form onSubmit={handlePhoneRequest} className="space-y-6">
                   <div className="text-center">
                      <Phone size={48} className="text-purple-400 mx-auto mb-4" />
                      <h3 className="text-white font-black italic uppercase tracking-tighter text-2xl">SMS Verifizierung</h3>
                      <p className="text-white/40 text-[10px] uppercase italic tracking-widest mt-2">Nummer im Format +49... eingeben</p>
                   </div>
                   <input 
                    type="tel" 
                    required
                    placeholder="+49 123 4567890" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-white text-center text-xl font-black italic tracking-[0.2em] outline-none focus:border-purple-500/50 transition-all"
                   />
                   <button 
                    type="submit"
                    disabled={isPending || !phoneNumber}
                    className="w-full bg-purple-500 text-white font-black py-6 rounded-2xl shadow-xl shadow-purple-500/20 uppercase italic tracking-widest hover:bg-purple-400 transition-all disabled:opacity-50"
                   >
                     {isPending ? "SENDE SMS..." : "CODE ANFORDERN"}
                   </button>
                </form>
              </motion.div>
            )}

            {/* PHONE VERIFICATION */}
            {authMode === "verify_phone" && (
              <motion.div 
                key="verify"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="text-center">
                   <Key size={48} className="text-primary mx-auto mb-4 animate-bounce" />
                   <h3 className="text-white font-black italic uppercase tracking-tighter text-2xl">Code Bestätigen</h3>
                   <p className="text-white/40 text-[10px] uppercase italic tracking-widest mt-2">6-stelliger Code gesendet</p>
                </div>
                <form onSubmit={handlePhoneVerify} className="space-y-6">
                   <input 
                    type="text" 
                    maxLength={6}
                    required
                    placeholder="......" 
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-white text-center text-4xl font-black italic tracking-[0.5em] outline-none focus:border-primary/50 transition-all"
                   />
                   <button 
                    type="submit"
                    disabled={isPending || verificationCode.length < 6}
                    className="w-full bg-primary text-secondary font-black py-6 rounded-2xl shadow-xl shadow-primary/20 uppercase italic tracking-widest hover:bg-primary-light transition-all disabled:opacity-50"
                   >
                     {isPending ? "PRÜFE CODE..." : "ZUTRITT BESTÄTIGEN"}
                   </button>
                   <button onClick={() => setAuthMode("phone")} className="w-full text-[10px] font-black text-white/20 uppercase italic hover:text-white transition-colors">Nummer korrigieren</button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

          {/* ERROR DISPLAY */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <p className="text-red-500 text-[10px] font-black italic uppercase leading-none">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM METRICS */}
        <div className="p-6 bg-white/2 flex justify-center items-center gap-8 border-t border-white/5 opacity-40">
           <div className="flex items-center gap-2">
              <Zap size={10} className="text-primary" />
              <span className="text-[8px] font-black text-white uppercase italic tracking-[0.3em]">AES-256</span>
           </div>
           <div className="flex items-center gap-2">
              <Activity size={10} className="text-blue-400" />
              <span className="text-[8px] font-black text-white uppercase italic tracking-[0.3em]">SSL ACTIVE</span>
           </div>
        </div>
      </motion.div>

      {/* FOOTER WATERMARK */}
      <div className="absolute bottom-10 flex flex-col items-center gap-4 opacity-10">
         <p className="text-[10px] font-black uppercase text-white tracking-[0.6em]">System Architecture v1.0.4</p>
         <div className="flex gap-1">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="w-10 h-1 bg-white/10 rounded-full"></div>)}
         </div>
      </div>
    </main>
  );
}
