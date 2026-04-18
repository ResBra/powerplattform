"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import AuthGuard from "@/components/AuthGuard";
import { 
  Plus, 
  Search, 
  MapPin, 
  Tag, 
  ShoppingBag, 
  MessageSquare,
  ChevronRight,
  Filter,
  Package,
  ArrowRight,
  LayoutGrid,
  List,
  Sparkles
} from "lucide-react";
import { getListingsAction } from "./actions";

const CATEGORIES = [
  "All",
  "Elektronik",
  "Fashion",
  "Home & Garden",
  "Fahrzeuge",
  "Services",
  "Sonstiges"
];

export default function MarketHub() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [citySearch, setCitySearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadListings();
  }, [selectedCategory, citySearch]);

  async function loadListings() {
    setLoading(true);
    const data = await getListingsAction({ 
      category: selectedCategory, 
      city: citySearch 
    });
    setListings(data);
    setLoading(false);
  }

  return (
    <AuthGuard>
      <SiteLayoutClient activePage="market">
        <div className="space-y-10 pb-32">
          
          {/* HEADER SECTION */}
          <header className="relative p-10 md:p-16 bg-card border border-white/5 rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <ShoppingBag size={300} />
            </div>
            
            <div className="relative z-10 space-y-8 max-w-3xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                      <span className="text-[10px] font-black uppercase text-primary italic tracking-[0.2em]">Live Marketplace</span>
                   </div>
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-foreground leading-[0.9]">
                   Little <span className="text-primary">Market.</span>
                </h1>
                <p className="text-foreground/40 text-xs md:text-lg italic font-medium max-w-xl">
                   Entdecke einzigartige Angebote in deiner Umgebung oder verkaufe deine eigenen Schätze im Power-Netzwerk.
                </p>
              </div>

              {/* SEARCH & FILTERS */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="NACH STADT FILTERN..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-xs font-black italic uppercase tracking-widest outline-none focus:border-primary/50 transition-all text-foreground"
                  />
                </div>
                <button 
                  onClick={() => router.push("/modules/market/create")}
                  className="bg-primary text-secondary px-10 py-6 rounded-2xl font-black italic uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-xl shadow-primary/20"
                >
                  <Plus size={20} /> Produkt Anbieten
                </button>
              </div>
            </div>
          </header>

          {/* CATEGORY BAR */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
             <div className="flex items-center gap-2 p-1.5 bg-foreground/5 rounded-2xl border border-border w-fit overflow-x-auto no-scrollbar max-w-full">
                {CATEGORIES.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 md:px-8 py-4 rounded-xl text-[10px] font-black italic uppercase transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-primary text-secondary' : 'text-foreground/40 hover:text-foreground'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
             
             <button 
               onClick={() => router.push("/modules/market/messages")}
               className="flex items-center gap-4 px-8 py-4 bg-foreground/[0.03] border border-border rounded-2xl text-[10px] font-black italic uppercase text-foreground/60 hover:text-primary transition-all group"
             >
               <MessageSquare size={16} className="group-hover:scale-110 transition-transform" /> Postfach
             </button>
          </div>

          {/* LISTINGS GRID */}
          <main className="min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-20">
                <div className="w-12 h-12 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Synchronizing Market Data...</p>
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <AnimatePresence>
                  {listings.map((item, idx) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => router.push(`/modules/market/listing/${item.id}`)}
                      className="group relative cursor-pointer"
                    >
                      <div className="aspect-[4/5] bg-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl transition-all group-hover:shadow-primary/10 group-hover:border-primary/20 group-hover:-translate-y-2">
                         {/* IMAGE */}
                         <div className="w-full h-[65%] relative overflow-hidden">
                            <img 
                              src={item.imageUrl} 
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-[10px] font-black text-white italic uppercase tracking-widest">
                               {item.category}
                            </div>
                         </div>
                         
                         {/* CONTENT */}
                         <div className="p-8 space-y-6">
                            <div className="space-y-2">
                               <div className="flex items-center gap-2 text-primary opacity-60">
                                  <MapPin size={12} />
                                  <span className="text-[10px] font-black uppercase italic tracking-widest">{item.city}</span>
                               </div>
                               <h3 className="text-xl font-black italic uppercase text-foreground leading-none group-hover:text-primary transition-colors truncate">
                                  {item.title}
                               </h3>
                            </div>
                            
                            <div className="flex items-baseline justify-between">
                               <div className="text-2xl font-black italic uppercase text-foreground leading-none">
                                  {item.price}<span className="text-primary/40 ml-1">€</span>
                               </div>
                               <div className="p-3 bg-foreground/5 rounded-xl text-foreground/20 group-hover:text-primary transition-colors">
                                  <ArrowRight size={18} />
                               </div>
                            </div>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-foreground/[0.02] border border-dashed border-border rounded-[3rem]">
                 <div className="p-8 bg-foreground/5 rounded-full text-foreground/10">
                    <Package size={64} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black italic uppercase text-foreground/40 leading-none">Keine Angebote gefunden</h3>
                    <p className="text-[10px] font-black uppercase text-foreground/20 italic tracking-widest">Ändere deine Filter oder sei der Erste, der hier etwas anbietet.</p>
                 </div>
                 <button 
                  onClick={() => router.push("/modules/market/create")}
                  className="px-10 py-5 border border-primary/20 text-primary rounded-2xl text-[10px] font-black italic uppercase hover:bg-primary hover:text-secondary transition-all"
                 >
                   Jetzt Inserieren
                 </button>
              </div>
            )}
          </main>

        </div>
      </SiteLayoutClient>
    </AuthGuard>
  );
}
