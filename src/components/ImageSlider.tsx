"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface ImageSliderProps {
  images: { id: string; url: string }[];
}

export default function ImageSlider({ images }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full h-full group overflow-hidden bg-slate-900">
      {/* Main Image */}
      <div 
        className="w-full h-full transition-transform duration-700 ease-out flex"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image) => (
          <div key={image.id} className="min-w-full h-full relative">
            <img 
              src={image.url} 
              alt="Immobilien Bild" 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Overlays */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>

      {/* Controls */}
      {images.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
          >
            <ChevronRight size={24} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "w-8 bg-primary" : "bg-white/40 hover:bg-white/60"}`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-8 right-8 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest z-30">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
