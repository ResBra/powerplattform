 "use client";
 
 import Image from "next/image";
 import { TeamMember } from "@/data/team";
 
 interface TeamCardProps {
   member: TeamMember;
   onClick: () => void;
   isLarge?: boolean;
 }
 
 export default function TeamCard({ member, onClick, isLarge }: TeamCardProps) {
   return (
     <button
       onClick={onClick}
       type="button"
       className={`group relative w-full overflow-hidden rounded-[2rem] border border-white/10 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl text-left
         ${isLarge ? "aspect-[3/4] md:aspect-[2/3]" : "aspect-[3/4]"}
         bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md
       `}
     >
       {/* Background Glow on Hover */}
       <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
 
       {/* Image */}
       <div className="absolute inset-0 w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 pointer-events-none">
         <Image
           src={member.image}
           alt={member.name}
           fill
           priority={isLarge}
           className="object-cover"
         />
       </div>
 
       {/* Content Overlay */}
       <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 z-20 translate-y-4 group-hover:translate-y-0 transition-all duration-500 bg-gradient-to-t from-green-950/90 to-transparent pointer-events-none">
         <span className="inline-block px-2.5 py-0.5 bg-primary/30 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider rounded-full mb-1 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
           {member.position}
         </span>
         <h4 className="text-lg md:text-xl font-black text-white italic tracking-tight drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis">
           {member.name}
         </h4>
         
         {/* Quick Contact Info Hint */}
         <div className="mt-2 flex items-center gap-2 text-white/50 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
             <span>Details ansehen</span>
             <div className="w-6 h-[1px] bg-white/20"></div>
         </div>
       </div>
     </button>
   );
 }
