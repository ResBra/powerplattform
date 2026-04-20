"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import AuthGuard from "@/components/AuthGuard";
import { 
  CheckCircle, 
  ShoppingBag, 
  ArrowRight, 
  Package, 
  Mail, 
  MapPin,
  Sparkles
} from "lucide-react";

export default function OrderSuccessPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    setOrderId("PH-" + Math.random().toString(36).substring(2, 9).toUpperCase());
  }, []);

  return (
    <AuthGuard>
      <SiteLayoutClient activePage="market">
        <div className="min-h-[80vh] flex items-center justify-center px-4 md:px-0">
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="max-w-xl w-full bg-card border border-white/5 rounded-[4rem] p-12 md:p-16 shadow-2xl relative overflow-hidden text-center"
          >
             {/* BACKGROUND ACCENT */}
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none -rotate-12 translate-x-12 -translate-y-12">
                <CheckCircle size={400} className="text-primary" />
             </div>
             
             <div className="relative space-y-10">
                <div className="flex justify-center">
                   <div className="relative">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                        className="w-32 h-32 bg-primary text-secondary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40"
                      >
                         <CheckCircle size={64} />
                      </motion.div>
                      <motion.div 
                         animate={{ rotate: 360 }}
                         transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                         className="absolute -inset-4 border-2 border-dashed border-primary/20 rounded-full"
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                      Vielen <span className="text-primary">Dank.</span>
                   </h1>
                   <p className="text-sm font-black italic uppercase text-foreground/40 tracking-widest uppercase">Deine Bestellung wurde erfolgreich verarbeitet</p>
                </div>

                <div className="bg-foreground/[0.03] border border-white/5 rounded-3xl p-8 space-y-4 text-left">
                   <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase text-foreground/30 italic">Bestellnummer</span>
                      <span className="text-sm font-black text-primary italic">{orderId}</span>
                   </div>
                   <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-4 text-foreground/60">
                         <Mail size={16} className="text-primary/40" />
                         <span className="text-[10px] font-black uppercase italic">Bestätigungs-Email gesendet</span>
                      </div>
                      <div className="flex items-center gap-4 text-foreground/60">
                         <Package size={16} className="text-primary/40" />
                         <span className="text-[10px] font-black uppercase italic">Versand wird vorbereitet</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4">
                   <button 
                     onClick={() => router.push("/modules/market")}
                     className="w-full bg-foreground/10 text-white font-black italic uppercase tracking-widest py-6 rounded-[2rem] border border-white/5 hover:bg-foreground/20 transition-all flex items-center justify-center gap-4 group"
                   >
                      <ShoppingBag size={20} className="group-hover:-translate-x-1 transition-transform" /> ZUR ÜBERSICHT
                   </button>
                   
                   <button 
                     onClick={() => router.push("/")}
                     className="w-full bg-primary text-secondary font-black italic uppercase tracking-widest py-6 rounded-[2rem] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                   >
                      DASBOARD AUFRUFEN <ArrowRight size={20} />
                   </button>
                </div>

                <div className="flex justify-center gap-6 opacity-20 pt-4">
                   <Sparkles size={16} />
                   <div className="text-[8px] font-black uppercase italic tracking-[0.3em]">Power E-Commerce Flow</div>
                </div>
             </div>
          </motion.div>
        </div>
      </SiteLayoutClient>
    </AuthGuard>
  );
}
