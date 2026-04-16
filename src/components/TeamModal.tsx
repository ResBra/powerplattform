 "use client";
 
 import { useEffect, useState } from "react";
 import { createPortal } from "react-dom";
 import Image from "next/image";
 import { X, Phone, Mail, Briefcase } from "lucide-react";
 import { TeamMember } from "@/data/team";
 
 interface TeamModalProps {
   member: TeamMember | null;
   onClose: () => void;
 }
 
 export default function TeamModal({ member, onClose }: TeamModalProps) {
   const [mounted, setMounted] = useState(false);
 
   useEffect(() => {
     setMounted(true);
     if (member) {
       document.body.style.overflow = "hidden";
     } else {
       document.body.style.overflow = "unset";
     }
     return () => {
       document.body.style.overflow = "unset";
     };
   }, [member]);
 
   if (!mounted || !member) return null;
 
   const modalContent = (
     <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8">
       {/* Backdrop */}
       <div 
         className="absolute inset-0 bg-green-950/60 backdrop-blur-xl transition-opacity duration-500 cursor-pointer"
         onClick={onClose}
       ></div>
 
       {/* Modal Container */}
       <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-green-900 via-green-950 to-black border border-white/20 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
         
         {/* Close Button */}
         <button 
           onClick={onClose}
           className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
         >
           <X size={24} />
         </button>
 
         {/* Image Section */}
         <div className="w-full md:w-5/12 aspect-[3/4] md:aspect-auto relative bg-slate-800">
             <Image 
                 src={member.image} 
                 alt={member.name} 
                 fill 
                 className="object-cover"
             />
         </div>
 
         {/* Content Section */}
         <div className="flex-1 p-8 md:p-14 flex flex-col justify-center relative">
           {/* Decor */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] pointer-events-none"></div>
 
           <div className="mb-8 relative">
             <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary-light text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4 border border-primary/20">
               {member.position}
             </span>
             <h2 className="text-4xl md:text-5xl font-black text-white italic leading-tight tracking-tight uppercase">
               {member.name}
             </h2>
           </div>
 
           <div className="space-y-6 relative">
             <div className="flex items-center gap-5 group">
               <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-primary/20 transition-colors">
                 <Briefcase size={20} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Position</p>
                 <p className="text-lg text-white font-bold">{member.position}</p>
               </div>
             </div>
 
             <div className="flex items-center gap-5 group">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-primary/20 transition-colors">
                     <Phone size={20} />
                 </div>
                 <div>
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Direktwahl</p>
                     {member.phone ? (
                       <a href={`tel:${member.phone.replace(/\s/g, "")}`} className="text-lg text-white font-bold hover:text-primary transition-colors">
                           {member.phone}
                       </a>
                     ) : (
                       <p className="text-white/40 italic text-sm">Nicht angegeben</p>
                     )}
                 </div>
             </div>
 
             <div className="flex items-center gap-5 group">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-primary/20 transition-colors">
                     <Mail size={20} />
                 </div>
                 <div>
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">E-Mail</p>
                     {member.email ? (
                       <a href={`mailto:${member.email}`} className="text-lg text-white font-bold hover:text-primary transition-colors break-all">
                           {member.email}
                       </a>
                     ) : (
                       <p className="text-white/40 italic text-sm">Nicht angegeben</p>
                     )}
                 </div>
             </div>
           </div>
 
           <div className="mt-12 pt-8 border-t border-white/10">
             <p className="text-white/80 text-sm md:text-base leading-relaxed italic font-medium">
               "{member.bio || "Wir sind hier, um Ihnen bei Ihren Anliegen rund um Ihre Immobilie mit Rat und Tat zur Seite zu stehen."}"
             </p>
           </div>
         </div>
       </div>
     </div>
   );
 
   return createPortal(modalContent, document.body);
 }
