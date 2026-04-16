"use client";

import { useEffect, useState } from "react";
import { House, Ruler, BedDouble, Tag, ChevronRight, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import ExternalLinkWarning from "./ExternalLinkWarning";

interface PropertySectionProps {
  properties: any[];
}

export default function PropertySection({ properties }: PropertySectionProps) {
  const [selectedExternalLink, setSelectedExternalLink] = useState<string | null>(null);

  return (
    <section className="py-24 relative overflow-hidden bg-transparent">
      <div className="container relative z-10 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <div className="w-10 h-[1px] bg-primary/40"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Portfolio</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-secondary italic uppercase leading-[0.9]">
              Aktuelle <br />
              <span className="text-primary italic">Inserate.</span>
            </h2>
          </div>
          <Link href="/immobilien" className="group flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all">
            Alle Objekte anzeigen
            <div className="w-12 h-12 rounded-full border border-black/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
              <ChevronRight size={18} />
            </div>
          </Link>
        </div>

        <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12 -mx-6 px-6 snap-x scrollbar-hide">
          {properties.length > 0 ? (
            properties.map((property) => (
              <div key={property.id} className="group relative bg-white/80 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 min-w-[85vw] md:min-w-0 snap-center">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img src={property.imageUrl} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <span className="px-5 py-2.5 bg-white/95 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-secondary shadow-lg border border-black/5">
                      {property.type}
                    </span>
                    <span className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${property.listingType === 'MIETE' ? 'bg-secondary' : 'bg-primary'}`}>
                      {property.listingType === 'MIETE' ? 'Miete' : 'Kauf'}
                    </span>
                  </div>
                  
                  {property.isSold && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-8 z-20">
                      <span className="px-8 py-4 bg-red-600 text-white font-black uppercase italic text-2xl tracking-widest -rotate-12 border-4 border-white shadow-2xl">VERKAUFT</span>
                    </div>
                  )}

                  {property.isRented && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-8 z-20">
                      <span className="px-8 py-4 bg-secondary text-white font-black uppercase italic text-2xl tracking-widest -rotate-12 border-4 border-white shadow-2xl">VERMIETET</span>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-black italic uppercase">
                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price)}
                      </p>
                      {property.listingType === 'MIETE' && <span className="text-sm font-bold opacity-70 italic lowercase">/ mtl.</span>}
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="min-h-[64px]">
                    <h3 className="text-xl font-bold text-secondary mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{property.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2 font-medium italic">
                      <MapPin size={12} className="text-primary" /> {property.address}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-6 border-y border-black/5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Ruler size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fläche</span>
                        <span className="text-sm font-black text-secondary">{property.sqm} m²</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <BedDouble size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Zimmer</span>
                        <span className="text-sm font-black text-secondary">{property.rooms}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Link href={`/immobilien/${property.id}`} className="flex items-center justify-center gap-3 w-full py-5 bg-secondary text-white rounded-2xl transition-all font-black text-xs uppercase tracking-[0.2em] hover:bg-primary hover:shadow-xl hover:shadow-primary/20 active:scale-95">
                      Exposé ansehen <ChevronRight size={16} />
                    </Link>
                    {property.externalLink && (
                      <button 
                        onClick={() => setSelectedExternalLink(property.externalLink)}
                        className="flex items-center justify-center gap-3 w-full py-4 border border-black/5 bg-slate-50 text-secondary rounded-2xl transition-all font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100"
                      >
                       <ExternalLink size={14} className="text-primary" /> Externes Inserat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 px-10 bg-slate-50/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center text-primary/30">
                <House size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-secondary italic uppercase">In Vorbereitung</h3>
                <p className="text-slate-400 font-medium italic max-w-sm">Aktuell bereiten wir neue exklusive Immobilienangebote für Sie vor. Schauen Sie bald wieder vorbei!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ExternalLinkWarning 
        url={selectedExternalLink || ""} 
        isOpen={!!selectedExternalLink} 
        onClose={() => setSelectedExternalLink(null)} 
      />
    </section>
  );
}
