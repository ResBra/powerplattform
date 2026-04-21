"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  User, 
  Activity, 
  Box,
  Palette,
  Image as ImageIcon,
  Check,
  Pipette,
  Share2,
  Download,
  Copy,
  ShoppingBag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

interface SiteLayoutClientProps {
  children: React.ReactNode;
  activePage?: string;
  settings?: any;
}

export default function SiteLayoutClient({ children, activePage, settings }: SiteLayoutClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // THEME & CUSTOMIZATION STATE
  const [primary1, setPrimary1] = useState("#2eb64a");
  const [primary2, setPrimary2] = useState("#4ade80");
  const [bgImage, setBgImage] = useState("none");
  const [bgOpacity, setBgOpacity] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // 1. AUTH OBSERVER (Universal for Web & Mobile)
    if (!auth) {
      console.warn("Auth module missing. Escaping auth check.");
      setIsAuthenticating(false);
      if (window.location.pathname !== "/") {
        const callbackUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/?callbackUrl=${callbackUrl}`;
      }
      return;
    }

    let resolved = false;

    const unsubscribe = auth.onAuthStateChanged((u: any) => {
      resolved = true;
      setUser(u);
      // If we are on a protected page (not the login page /) and no user is found:
      if (!u && window.location.pathname !== "/") {
        const callbackUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/?callbackUrl=${callbackUrl}`;
        // Do NOT set isAuthenticating to false here, keep the loading screen alive 
        // to prevent rendering the heavy dashboard before the redirect kicks in.
      } else {
        setIsAuthenticating(false);
      }
    });

    // 1.5 FAILSAFE TIMEOUT
    // iOS Safari WebViews sometimes silently hang the IDB promise in Firebase Auth.
    // If auth state hasn't resolved in 3 seconds, break the deadlock and assume logged out!
    const deadlockTimer = setTimeout(() => {
      if (!resolved) {
         console.warn("Firebase Auth deadlock strictly caught. Escaping to login.");
         setIsAuthenticating(false);
         if (window.location.pathname !== "/") {
            const callbackUrl = encodeURIComponent(window.location.pathname);
            window.location.href = `/?callbackUrl=${callbackUrl}`;
         }
      }
    }, 2500);

    // 2. PREFERENCES LOAD
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" || "dark";
    const savedP1 = localStorage.getItem("p1") || "#2eb64a";
    const savedP2 = localStorage.getItem("p2") || "#4ade80";
    const savedBg = localStorage.getItem("bg") || "none";
    const savedBgOp = localStorage.getItem("bgOp") || "0";

    setTheme(savedTheme);
    setPrimary1(savedP1);
    setPrimary2(savedP2);
    setBgImage(savedBg);
    setBgOpacity(parseFloat(savedBgOp));

    applyTheme(savedTheme, savedP1, savedP2, savedBg, savedBgOp);

    return () => {
       unsubscribe();
       clearTimeout(deadlockTimer);
    };
  }, [router]);

  const applyTheme = (t: string, p1: string, p2: string, bg: string, op: string) => {
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.style.setProperty("--primary-1", p1);
    document.documentElement.style.setProperty("--primary-2", p2);
    document.documentElement.style.setProperty("--bg-image", bg === "none" ? "none" : `url('${bg}')`);
    document.documentElement.style.setProperty("--bg-opacity", op);
  };

  const updatePreferences = (updates: Record<string, string>) => {
    const config = { t: theme, p1: primary1, p2: primary2, bg: bgImage, op: bgOpacity.toString() };
    Object.entries(updates).forEach(([key, value]) => {
      localStorage.setItem(key, value);
      if (key === "theme") { config.t = value as "dark" | "light"; setTheme(value as any); }
      if (key === "p1") { config.p1 = value; setPrimary1(value); }
      if (key === "p2") { config.p2 = value; setPrimary2(value); }
      if (key === "bg") { config.bg = value; setBgImage(value); }
      if (key === "bgOp") { config.op = value; setBgOpacity(parseFloat(value)); }
    });
    applyTheme(config.t, config.p1, config.p2, config.bg, config.op);
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} />, id: "dashboard" },
    { label: "Command Center", href: "/modules/analytics", icon: <Activity size={20} />, id: "analytics" },
    { label: "Qloud Hub", href: "/modules/qloud", icon: <Box size={20} />, id: "qloud" },
    { label: "Market", href: "/modules/market", icon: <ShoppingBag size={20} />, id: "market" },
    { label: "Profil", href: "/profile", icon: <User size={20} />, id: "profile" },
  ];

  const backgrounds = [
    { id: "none", label: "Clean", url: "none" },
    { id: "fire", label: "Feuer", url: "/backgrounds/fire.png" },
    { id: "ocean", label: "Ozean", url: "/backgrounds/ocean.png" },
    { id: "forest", label: "Wald", url: "/backgrounds/forest.png" },
    { id: "sky", label: "Himmel", url: "/backgrounds/sky.png" },
    { id: "tech", label: "Tech", url: "/backgrounds/tech.png" },
  ];

  if (!mounted || isAuthenticating) {
    return (
      <div className="min-h-screen bg-[#050a10] flex items-center justify-center font-black text-white italic uppercase tracking-[0.5em] animate-pulse">
         Auth-Check...
      </div>
    );
  }

  const signatureGradient = { background: `linear-gradient(135deg, ${primary1}, ${primary2})` };

  return (
    <div className="flex min-h-screen transition-colors duration-300">
      
      {/* SIDEBAR - DESKTOP */}
      <motion.aside initial={false} animate={{ width: isOpen ? 280 : 80 }} className="hidden lg:flex flex-col sticky top-0 h-screen bg-card border-r border-border z-[100] overflow-hidden shadow-2xl">
        <div className="p-6 flex items-center justify-between min-h-[100px]">
          <Link href="/dashboard" className="flex items-center gap-3">
             <img src="/icon.png" alt="PowerNode" className="w-9 h-9 object-contain" />
             {isOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-black italic uppercase tracking-tighter text-lg whitespace-nowrap">Power<span className="text-gradient">Node.</span></motion.span>}
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-foreground/5 rounded-lg text-foreground/40">{isOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
             <Link key={item.id} href={item.href} style={activePage === item.id ? signatureGradient : {}} className={`flex items-center gap-4 p-4 rounded-2xl transition-all group ${activePage === item.id ? 'text-secondary shadow-lg' : 'hover:bg-foreground/5 text-foreground/40'}`}>
                <div className="group-hover:scale-110 transition-transform">{item.icon}</div>
                {isOpen && <span className="font-bold italic uppercase tracking-widest text-[11px] whitespace-nowrap">{item.label}</span>}
             </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border mt-auto space-y-2">
           <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-foreground/5 text-foreground/40 transition-all font-bold uppercase text-[11px] italic"><Settings size={20} /> {isOpen && "Settings"}</button>
           <button onClick={() => { signOut(auth); router.push("/"); }} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-500/10 text-red-500 transition-all font-bold uppercase text-[11px] italic"><LogOut size={20} /> {isOpen && "Logout"}</button>
        </div>
      </motion.aside>

      {/* MOBILE HEADER */}
      <header className="lg:hidden h-20 bg-black fixed top-0 inset-x-0 z-[110] flex items-center justify-between px-6 border-b border-white/5 shadow-xl">
          <Link href="/dashboard" className="font-black italic uppercase tracking-tighter text-lg flex items-center gap-3 text-white">
             <img src="/icon.png" alt="PowerNode" className="w-9 h-9 object-contain" />
             <span>Power<span className="text-primary">Node.</span></span>
          </Link>
         <div className="flex gap-2 text-white">
            <button onClick={() => setIsSettingsOpen(true)} className="p-3 bg-white/10 rounded-2xl text-white/70 hover:bg-white/20 transition-all"><Settings size={20} /></button>
            <button onClick={() => setIsOpen(true)} className="p-3 bg-white/20 rounded-2xl text-white hover:bg-white/30 transition-all"><Menu size={24} /></button>
         </div>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-[500]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="absolute top-0 left-0 h-screen w-[300px] bg-card border-r border-border p-8 flex flex-col shadow-2xl">
              {/* Mobile items same as desktop links */}
              <div className="flex items-center justify-between mb-12">
                 <div className="font-black italic uppercase tracking-tighter text-xl">Power<span className="text-primary">Node.</span></div>
                 <button onClick={() => setIsOpen(false)} className="p-3 bg-foreground/5 rounded-2xl"><X size={24} /></button>
              </div>
              <nav className="flex-1 space-y-4">
                 {navItems.map(item => (
                    <Link key={item.id} href={item.href} onClick={() => setIsOpen(false)} className="flex items-center gap-5 p-5 bg-foreground/5 rounded-[1.5rem] font-bold uppercase text-xs italic">{item.icon} {item.label}</Link>
                 ))}
              </nav>
              <div className="pt-6 border-t border-border space-y-4">
                 <button onClick={() => { setIsSettingsOpen(true); setIsOpen(false); }} className="w-full flex items-center gap-5 p-5 bg-foreground/5 rounded-[1.5rem] text-xs font-black uppercase italic"><Settings size={20} /> Settings</button>
                 <button onClick={() => { signOut(auth); router.push("/"); }} className="w-full flex items-center gap-5 p-5 bg-red-500/10 text-red-500 rounded-[1.5rem] text-xs font-black uppercase italic"><LogOut size={20} /> Logout</button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <main className="flex-1 p-6 md:p-12 lg:p-16 pt-28 lg:pt-16 max-w-[1400px] mx-auto w-full">
          {children}
        </main>
        
        {/* GLOBAL FOOTER */}
        <footer className="p-10 border-t border-white/5 bg-foreground/[0.02] mt-auto">
           <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-4">
                 <img src="/icon.png" alt="" className="w-8 h-8 opacity-20" />
                 <p className="text-[10px] font-black uppercase text-foreground/20 italic tracking-[0.4em]">© 2026 PowerPlattform Digital</p>
              </div>
              
              <div className="flex items-center gap-10">
                 <Link href="/legal/impressum" className="text-[10px] font-black uppercase text-foreground/40 italic hover:text-primary transition-colors tracking-widest">Impressum</Link>
                 <Link href="/legal/datenschutz" className="text-[10px] font-black uppercase text-foreground/40 italic hover:text-primary transition-colors tracking-widest">Datenschutz</Link>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 bg-foreground/5 rounded-full">
                 <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                 <span className="text-[8px] font-black uppercase text-foreground/40 italic tracking-widest">Node Status: Optimized</span>
              </div>
           </div>
        </footer>
      </div>

      {/* SETTINGS POPUP MODAL (RESTORED) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSettingsOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative w-full max-w-xl bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-8 border-b border-border flex items-center justify-between bg-foreground/[0.02]">
                 <div className="flex items-center gap-4">
                    <div style={signatureGradient} className="p-3 rounded-2xl text-secondary shadow-lg shadow-primary/20"><Palette size={24} /></div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">OS <span className="text-primary">Settings.</span></h2>
                 </div>
                 <button onClick={() => setIsSettingsOpen(false)} className="p-3 hover:bg-foreground/5 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-10 overflow-y-auto">
                 {/* 1. THEME */}
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 italic">System Environment</p>
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => updatePreferences({ theme: "dark" })} className={`flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-foreground/5 text-foreground/40'}`}><Moon size={18} /> Dark OS</button>
                       <button onClick={() => updatePreferences({ theme: "light" })} className={`flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-foreground/5 text-foreground/40'}`}><Sun size={18} /> Light OS</button>
                    </div>
                 </div>

                 {/* 2. DUAL COLOR PICKER (RESTORED) */}
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 italic">Signature Gradient (Custom)</p>
                    <div className="grid grid-cols-2 gap-6 bg-foreground/5 p-6 rounded-3xl">
                       <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase italic text-foreground/40 flex items-center gap-2"><Pipette size={10} /> Color A</label>
                          <div className="relative h-14 rounded-xl border border-border overflow-hidden">
                             <input type="color" value={primary1} onChange={(e) => updatePreferences({ p1: e.target.value })} className="absolute inset-0 w-full h-full cursor-pointer bg-transparent border-none opacity-0" />
                             <div className="w-full h-full" style={{ backgroundColor: primary1 }}></div>
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase italic text-foreground/40 flex items-center gap-2"><Pipette size={10} /> Color B</label>
                          <div className="relative h-14 rounded-xl border border-border overflow-hidden">
                             <input type="color" value={primary2} onChange={(e) => updatePreferences({ p2: e.target.value })} className="absolute inset-0 w-full h-full cursor-pointer bg-transparent border-none opacity-0" />
                             <div className="w-full h-full" style={{ backgroundColor: primary2 }}></div>
                          </div>
                       </div>
                    </div>
                    <div className="h-2 rounded-full w-full" style={{ background: `linear-gradient(90deg, ${primary1}, ${primary2})` }}></div>
                 </div>

                 {/* 3. BACKGROUNDS (RESTORED) */}
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 italic">Motion Backgrounds</p>
                    <div className="grid grid-cols-3 gap-3">
                       {backgrounds.map(bg => (
                         <button key={bg.id} onClick={() => updatePreferences({ bg: bg.url, bgOp: bg.url === "none" ? "0" : "0.5" })} className={`h-24 rounded-2xl border-2 transition-all relative overflow-hidden group ${bgImage === bg.url ? 'border-primary' : 'border-border'}`}>
                            {bg.url !== "none" ? <img src={bg.url} className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform" /> : <div className="w-full h-full flex items-center justify-center bg-foreground/5"><ImageIcon size={20} className="text-foreground/20" /></div>}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30"><Check size={16} className={`text-white transition-opacity ${bgImage === bg.url ? 'opacity-100' : 'opacity-0'}`} /></div>
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="p-8 border-t border-border flex justify-end bg-foreground/20">
                 <button onClick={() => setIsSettingsOpen(false)} style={signatureGradient} className="px-10 py-5 text-secondary font-black italic uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20">Save Configuration</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
