"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import AuthGuard from "@/components/AuthGuard";
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  ShieldCheck, 
  Truck, 
  ShoppingBag,
  CheckCircle2,
  Lock
} from "lucide-react";
import { useCart } from "../CartContext";

const PAYMENT_METHODS = [
  { id: "paypal", name: "PayPal", icon: "https://www.paypalobjects.com/webstatic/mktg/logo-center/PP_Acceptance_Marks_for_LogoCenter_266x142.png", subtitle: "Sicher & Schnell" },
  { id: "stripe", name: "Kreditkarte", icon: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg", subtitle: "Stripe Secure" },
  { id: "apple", name: "Apple Pay", icon: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg", subtitle: "One-Click Payment" }
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState("paypal");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOrder = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 2000));
    clearCart();
    router.push("/modules/market/checkout/success");
  };

  return (
    <AuthGuard>
      <SiteLayoutClient activePage="market">
        <div className="max-w-6xl mx-auto space-y-10 pb-32 px-4 md:px-0">
          
          <button 
            onClick={() => router.push("/modules/market")}
            className="flex items-center gap-4 text-[10px] font-black uppercase text-foreground/40 italic hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Weiter Einkaufen
          </button>

          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-foreground">
             Bezahl <span className="text-primary">Vorgang.</span>
          </h1>

          {cart.length === 0 ? (
            <div className="bg-card border border-white/5 rounded-[3rem] p-20 text-center space-y-6">
               <div className="p-8 bg-foreground/5 rounded-full inline-block text-foreground/10">
                  <ShoppingBag size={64} />
               </div>
               <p className="text-xl font-black italic uppercase text-foreground/40">Dein Warenkorb ist leer</p>
               <button 
                 onClick={() => router.push("/modules/market")}
                 className="px-10 py-5 bg-primary text-secondary rounded-2xl font-black italic uppercase tracking-widest text-xs"
               >
                 Zum Marktplatz
               </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               
               {/* CART ITEMS */}
               <div className="lg:col-span-7 space-y-6">
                  <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                     <h3 className="text-xl font-black italic uppercase text-foreground mb-8">Warenkorb</h3>
                     
                     <div className="space-y-6">
                        <AnimatePresence>
                          {cart.map((item) => (
                            <motion.div 
                              key={item.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex items-center gap-6 p-4 bg-foreground/[0.03] border border-white/5 rounded-3xl group"
                            >
                               <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/5">
                                  <img src={item.imageUrl} className="w-full h-full object-cover" />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <h4 className="text-lg font-black italic uppercase text-foreground truncate">{item.title}</h4>
                                  <p className="text-primary font-black italic">{item.price.toFixed(2)} €</p>
                               </div>
                               <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2 bg-black/40 rounded-xl p-1">
                                     <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:text-primary"><Minus size={14} /></button>
                                     <span className="w-6 text-center text-xs font-black italic">{item.quantity}</span>
                                     <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:text-primary"><Plus size={14} /></button>
                                  </div>
                                  <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-3 text-foreground/20 hover:text-red-500 transition-colors"
                                  >
                                     <Trash2 size={20} />
                                  </button>
                               </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                     </div>
                  </div>

                  <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                     <div className="flex items-center gap-4 text-green-500">
                        <ShieldCheck size={20} />
                        <p className="text-[10px] font-black uppercase italic tracking-widest">Sicherer Checkout • SSL Verschlüsselt</p>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-foreground/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
                           <Truck size={24} className="text-primary" />
                           <div>
                              <p className="text-[8px] font-black uppercase text-foreground/30 italic">Versand</p>
                              <p className="text-xs font-black italic text-foreground uppercase">Express Lieferung</p>
                           </div>
                        </div>
                        <div className="p-6 bg-foreground/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
                           <Lock size={24} className="text-primary" />
                           <div>
                              <p className="text-[8px] font-black uppercase text-foreground/30 italic">Sicherheit</p>
                              <p className="text-xs font-black italic text-foreground uppercase">Käuferschutz Aktiv</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* PAYMENT & SUMMARY */}
               <div className="lg:col-span-5 space-y-6">
                  <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-8 sticky top-32">
                     <div className="space-y-6 text-sm font-black italic uppercase text-foreground/40">
                        <div className="flex justify-between">
                           <span>Zwischensumme</span>
                           <span className="text-foreground">{totalPrice.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between">
                           <span>Versandgebühren</span>
                           <span className="text-green-500">GRATIS</span>
                        </div>
                        <div className="h-px bg-white/5"></div>
                        <div className="flex justify-between text-2xl text-foreground">
                           <span>Gesamtbetrag</span>
                           <span className="text-primary">{totalPrice.toFixed(2)} €</span>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase text-foreground/30 italic tracking-widest px-2">Zahlungsmethode wählen</p>
                        <div className="space-y-3">
                           {PAYMENT_METHODS.map(method => (
                              <button 
                                key={method.id}
                                onClick={() => setSelectedPayment(method.id)}
                                className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all group ${selectedPayment === method.id ? 'border-primary bg-primary/5' : 'border-white/5 bg-foreground/[0.02] hover:border-white/20'}`}
                              >
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-8 bg-white/10 rounded-lg flex items-center justify-center p-1 overflow-hidden group-hover:scale-110 transition-transform">
                                       <img src={method.icon} className="max-h-full object-contain" />
                                    </div>
                                    <div className="text-left">
                                       <p className="font-black italic uppercase text-foreground">{method.name}</p>
                                       <p className="text-[8px] font-black uppercase text-foreground/30 italic">{method.subtitle}</p>
                                    </div>
                                 </div>
                                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPayment === method.id ? 'border-primary' : 'border-white/10'}`}>
                                    {selectedPayment === method.id && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                                 </div>
                              </button>
                           ))}
                        </div>
                     </div>

                     <button 
                       onClick={handleOrder}
                       disabled={isProcessing}
                       className="w-full bg-primary text-secondary font-black italic uppercase tracking-widest py-8 rounded-[2rem] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                     >
                        {isProcessing ? (
                           <>
                             <div className="w-6 h-6 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
                             SYSTEM CHECK...
                           </>
                        ) : (
                           <>
                             <CheckCircle2 size={24} /> ZAHLUNGSPFLICHTIG BESTELLEN
                           </>
                        )}
                     </button>

                     <p className="text-[9px] font-black uppercase text-center text-foreground/20 italic italic italic tracking-widest">Durch Absenden der Bestellung stimmst du den AGB zu.</p>
                  </div>
               </div>

            </div>
          )}

        </div>
      </SiteLayoutClient>
    </AuthGuard>
  );
}
