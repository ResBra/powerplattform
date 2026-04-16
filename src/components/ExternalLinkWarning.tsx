"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, ExternalLink, X } from "lucide-react";

interface ExternalLinkWarningProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExternalLinkWarning({ url, isOpen, onClose }: ExternalLinkWarningProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleOpen = () => {
    const ensureAbsoluteUrl = (u: string) => {
      if (!u) return "";
      if (u.startsWith("http://") || u.startsWith("https://")) return u;
      return `https://${u}`;
    };
    window.open(ensureAbsoluteUrl(url), "_blank", "noopener,noreferrer");
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-secondary/80 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      />
      
      {/* ModalContent */}
      <div className="relative w-full max-w-lg bg-white rounded-[3.5rem] shadow-2xl border border-black/5 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem]"></div>
        
        <div className="p-12 space-y-10 text-center relative z-10">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-primary/10">
            <AlertTriangle size={40} className="text-primary animate-pulse" />
          </div>

          <div className="space-y-4">
            <h3 className="text-3xl font-black text-secondary italic uppercase leading-tight">
              Externes <span className="text-primary">Inserat.</span>
            </h3>
            <div className="space-y-4 text-slate-500 font-medium italic text-sm leading-relaxed">
              <p>
                Achtung: Sie werden nun auf eine externe Plattform weitergeleitet (z.B. eBay Kleinanzeigen, ImmoScout24 oder Immowelt).
              </p>
              <p className="bg-slate-50 p-4 rounded-2xl border border-black/5 text-[11px] non-italic font-bold text-slate-400 leading-normal uppercase tracking-wider">
                Power Platform Immobilien ist nicht für den Inhalt oder die Verfügbarkeit externer Portale verantwortlich. Jegliche Haftung für fremde Inhalte ist ausgeschlossen.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
            <button 
              onClick={handleOpen}
              className="w-full py-6 bg-primary hover:bg-secondary text-white transition-all rounded-[2rem] font-black uppercase italic text-sm tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 group"
            >
              <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Weiter zum Inserat
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 text-slate-400 hover:text-secondary font-black uppercase text-[10px] tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <X size={14} /> Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
