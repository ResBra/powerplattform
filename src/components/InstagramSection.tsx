"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { INSTAGRAM_POSTS } from "@/data/instagram";
import { CONTACT_CONFIG } from "@/data/contactConfig";
import { ChevronRight, Heart, MessageCircle } from "lucide-react";

export default function InstagramSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      checkScroll();
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const offset = direction === "left" ? -clientWidth / 1.5 : clientWidth / 1.5;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-5 pointer-events-none">
         <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-[120px]"></div>
      </div>

      <div className="container relative z-10 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px]">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
              </div>
              <span className="text-primary font-black uppercase tracking-widest text-sm italic">Social Showcase</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-secondary italic uppercase leading-none mb-6">
              Einblicke in unser <span className="text-primary">Portfolio.</span>
            </h2>
            <p className="text-lg text-text-muted leading-relaxed">
              Folgen Sie uns auf Instagram für aktuelle Immobilien-Angebote, Neuigkeiten aus der Hausverwaltung und exklusive Einblicke hinter die Kulissen.
            </p>
          </div>

          <a 
            href={CONTACT_CONFIG.socials.instagram} 
            target="_blank" 
            className="btn-primary px-8 py-4 text-sm flex items-center gap-3 group whitespace-nowrap"
          >
            @bergischlandimmo folgen
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Scroll Buttons (Desktop Only) */}
          <button 
            onClick={() => scroll("left")}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-12 h-12 bg-white rounded-full shadow-xl items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all hidden md:flex ${!canScrollLeft && 'opacity-0 pointer-events-none'}`}
          >
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <button 
            onClick={() => scroll("right")}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-12 h-12 bg-white rounded-full shadow-xl items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all hidden md:flex ${!canScrollRight && 'opacity-0 pointer-events-none'}`}
          >
            <ChevronRight size={24} />
          </button>

          {/* Scrolling Area */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-10 cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {INSTAGRAM_POSTS.map((post) => (
              <a 
                key={post.id} 
                href={post.link} 
                target="_blank"
                className="flex-shrink-0 w-[280px] md:w-[350px] aspect-square relative rounded-[2.5rem] overflow-hidden group/item snap-start"
              >
                <Image 
                  src={post.imageUrl} 
                  alt={post.caption} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover/item:scale-110" 
                />
                
                {/* Glass Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-6 backdrop-blur-[2px]">
                   <div className="flex gap-4">
                      <div className="flex items-center gap-1 text-white font-bold">
                        <Heart size={20} fill="currentColor" />
                        <span>Gefällt mir</span>
                      </div>
                      <div className="flex items-center gap-1 text-white font-bold">
                        <MessageCircle size={20} fill="currentColor" />
                        <span>Kommentieren</span>
                      </div>
                   </div>
                   <div className="p-6 text-center">
                     <p className="text-white text-sm line-clamp-2 italic">{post.caption}</p>
                   </div>
                </div>

                {/* Corner Label */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
