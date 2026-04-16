"use client";

import { useState, useEffect } from "react";
import { Cookie, X, Settings, ShieldCheck, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [accepted, setAccepted] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setTimeout(() => setShowBanner(true), 1500);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = { essential: true, analytics: true, marketing: true };
    localStorage.setItem("cookie_consent", JSON.stringify(consent));
    setShowBanner(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem("cookie_consent", JSON.stringify(accepted));
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    const consent = { essential: true, analytics: false, marketing: false };
    localStorage.setItem("cookie_consent", JSON.stringify(consent));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[1000] p-4 md:p-8"
      >
        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-black/5 overflow-hidden">
          
          <div className="p-8 md:p-12">
            {!showSettings ? (
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center shrink-0">
                  <Cookie size={40} className="text-primary" />
                </div>
                
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-2xl font-black text-secondary italic uppercase tracking-tight mb-3">Cookie-Einstellungen</h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                    Wir nutzen Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. Einige sind technisch notwendig, während andere uns helfen, diese Website zu verbessern.
                  </p>
                </div>

                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <button onClick={handleAcceptAll} className="bg-primary hover:bg-primary-light text-white font-black px-8 py-4 rounded-2xl transition-all uppercase italic tracking-widest text-sm shadow-xl shadow-primary/20 whitespace-nowrap">
                    Alle akzeptieren
                  </button>
                  <div className="flex gap-2">
                    <button onClick={handleRejectAll} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-3 rounded-xl transition-all uppercase italic text-xs">
                      Ablehnen
                    </button>
                    <button onClick={() => setShowSettings(true)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-3 rounded-xl transition-all uppercase italic text-xs flex items-center justify-center gap-2">
                      <Settings size={14} /> Einstellungen
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <h2 className="text-xl font-black text-secondary italic uppercase tracking-tight flex items-center gap-3">
                    <Settings className="text-primary" /> Ihre Auswahl verwalten
                  </h2>
                  <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Essential */}
                  <div className="bg-slate-50 p-6 rounded-2xl flex items-start justify-between border border-primary/20">
                    <div>
                      <p className="font-black text-secondary italic uppercase text-xs mb-1">Technisch notwendig</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Grundlegend für den Betrieb der Website (Sicherheit, Login).</p>
                    </div>
                    <div className="w-6 h-6 bg-primary text-white rounded-md flex items-center justify-center">
                      <ShieldCheck size={16} />
                    </div>
                  </div>

                  {/* Analytics */}
                  <button 
                    onClick={() => setAccepted(prev => ({ ...prev, analytics: !prev.analytics }))}
                    className={`p-6 rounded-2xl flex items-start justify-between border transition-all text-left ${accepted.analytics ? "bg-primary/5 border-primary/30" : "bg-slate-50 border-transparent hover:border-slate-200"}`}
                  >
                    <div>
                      <p className="font-black text-secondary italic uppercase text-xs mb-1">Statistik & Analyse</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Anonyme Daten zur Nutzung unserer Website zur Optimierung der Inhalte.</p>
                    </div>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${accepted.analytics ? "bg-primary text-white" : "bg-slate-200"}`}>
                      {accepted.analytics && <Check size={16} />}
                    </div>
                  </button>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <p className="text-[10px] text-slate-400 font-medium max-w-md">
                    Weitere Informationen finden Sie in unserer <a href="/datenschutz" className="text-primary underline">Datenschutzerklärung</a>.
                  </p>
                  <button onClick={handleSaveSettings} className="w-full md:w-auto bg-primary hover:bg-primary-light text-white font-black px-10 py-4 rounded-2xl transition-all uppercase italic tracking-widest text-sm">
                    Auswahl speichern
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-1 w-full bg-gradient-to-r from-primary via-green-700 to-primary"></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
