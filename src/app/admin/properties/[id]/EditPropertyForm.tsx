"use client";

import { useState } from "react";
import { updateProperty, deletePropertyImage } from "@/app/actions/properties";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Image as ImageIcon, Euro, Maximize, Home, MapPin, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";

interface TeamMember {
  id: string;
  name: string;
  position: string;
  image: string;
}

export default function EditPropertyForm({ property, teamMembers }: { property: any, teamMembers: TeamMember[] }) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeNewImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId: string) => {
    if (!confirm("Bild wirklich löschen?")) return;
    const result = await deletePropertyImage(imageId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.message);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    
    // Process features checklist
    const selectedFeatures = formData.getAll("features_list") as string[];
    const customFeatures = formData.get("custom_features") as string;
    
    const allFeatures = [...selectedFeatures];
    if (customFeatures) {
      customFeatures.split(",").forEach(f => {
        const trimmed = f.trim();
        if (trimmed && !allFeatures.includes(trimmed)) {
          allFeatures.push(trimmed);
        }
      });
    }
    
    formData.set("features", allFeatures.join(", "));
    formData.delete("features_list");
    formData.delete("custom_features");
    
    // Remove default images and append our collected ones
    formData.delete("images");
    selectedFiles.forEach(file => {
      formData.append("images", file);
    });

    const result = await updateProperty(property.id, formData);

    if (result.success) {
      router.push("/admin/properties");
      router.refresh();
    } else {
      setMessage(result.message);
      setIsPending(false);
    }
  }

  const assignedIds = property.assignedStaff?.map((s: any) => s.id) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col gap-6">
        <Link href="/admin/properties" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> Zurück zur Übersicht
        </Link>
        <div>
          <h1 className="text-4xl font-black text-secondary italic uppercase mb-2 text-primary">Immobilie Bearbeiten.</h1>
          <p className="text-slate-400 font-medium">Aktualisieren Sie die Daten für: {property.title}</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-black/5 relative overflow-hidden">
        <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
          <div className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4">Basis Informationen</h2>
            
            <div className="grid grid-cols-1 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-secondary">Titel</label>
                <input required name="title" type="text" defaultValue={property.title} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-secondary">Anschrift</label>
                <input required name="address" type="text" defaultValue={property.address} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-secondary">Kaufpreis (€)</label>
                <input required name="price" type="number" step="0.01" defaultValue={property.price} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-secondary">Wohnfläche (m²)</label>
                <input name="sqm" type="number" step="0.01" defaultValue={property.sqm} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
              </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col gap-3">
                   <label className="text-xs font-black uppercase tracking-widest text-secondary">Zimmer</label>
                   <input name="rooms" type="number" step="0.5" defaultValue={property.rooms} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
                </div>
                <div className="flex flex-col gap-3">
                   <label className="text-xs font-black uppercase tracking-widest text-secondary">Typ</label>
                   <select name="type" defaultValue={property.type} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic appearance-none cursor-pointer">
                     <option value="Wohnung">Wohnung</option>
                     <option value="Haus">Haus</option>
                     <option value="Gewerbe">Gewerbe</option>
                     <option value="Grundstück">Grundstück</option>
                     <option value="PKW-Stellplatz">PKW-Stellplatz</option>
                     <option value="Garage">Garage</option>
                     <option value="Lagerraum">Lagerraum</option>
                     <option value="Keller">Keller</option>
                   </select>
                </div>
                <div className="flex flex-col gap-3">
                   <label className="text-xs font-black uppercase tracking-widest text-secondary">Vermarktung</label>
                   <select name="listingType" defaultValue={property.listingType} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic appearance-none cursor-pointer">
                     <option value="KAUF">Verkauf</option>
                     <option value="MIETE">Miete</option>
                   </select>
                </div>
             </div>
 
             {/* Technical Data Fields */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-black uppercase tracking-widest text-secondary">Grundstück (m²)</label>
                  <input name="lotSize" type="number" step="0.1" defaultValue={property.lotSize} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-black uppercase tracking-widest text-secondary">Baujahr</label>
                  <input name="yearBuilt" type="number" defaultValue={property.yearBuilt} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-black uppercase tracking-widest text-secondary">Energieklasse</label>
                  <select name="energyClass" defaultValue={property.energyClass || ""} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic appearance-none">
                     <option value="">Nicht angegeben</option>
                     {['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
             </div>
 
             <div className="space-y-8">
                <div className="flex flex-col gap-3">
                   <label className="text-xs font-black uppercase tracking-widest text-secondary">Objektbeschreibung</label>
                   <textarea name="description" rows={6} defaultValue={property.description} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-primary/10 outline-none font-medium text-secondary resize-none"></textarea>
                </div>
                <div className="flex flex-col gap-3">
                   <label className="text-xs font-black uppercase tracking-widest text-secondary mb-2">Ausstattung / Merkmale (Checkliste)</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200">
                     {[
                       'Einbauküche (EBK)', 'Keller', 'Balkon', 'Terrasse', 'Garten', 
                       'Gäste-WC', 'Renoviert', 'Saniert', 'Garage', 'Stellplatz', 
                       'Barrierefrei', 'Aufzug', 'Fußbodenheizung', 'Kamin'
                     ].map(feature => (
                       <label key={feature} className="flex items-center gap-3 cursor-pointer group">
                         <input 
                           type="checkbox" 
                           name="features_list" 
                           value={feature} 
                           defaultChecked={property.features?.split(", ").includes(feature)}
                           className="w-5 h-5 rounded text-primary border-slate-300 focus:ring-primary" 
                         />
                         <span className="text-xs font-bold text-slate-500 group-hover:text-primary transition-colors">{feature}</span>
                       </label>
                     ))}
                   </div>
 
                   {/* Custom Features Field */}
                   <div className="mt-4 flex flex-col gap-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Zusätzliche Merkmale (Individuell, mit Komma trennen)</label>
                     <input 
                       name="custom_features" 
                       type="text" 
                       defaultValue={property.features?.split(", ").filter((f: string) => ![
                         'Einbauküche (EBK)', 'Keller', 'Balkon', 'Terrasse', 'Garten', 
                         'Gäste-WC', 'Renoviert', 'Saniert', 'Garage', 'Stellplatz', 
                         'Barrierefrei', 'Aufzug', 'Fußbodenheizung', 'Kamin'
                       ].includes(f)).join(", ")}
                       placeholder="z.B. Smart Home, Alarmanlage" 
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/10 outline-none font-medium text-sm" 
                     />
                   </div>
                </div>
             </div>
 
             <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-primary font-bold">Externes Inserat (Link)</label>
                <input name="externalLink" type="text" defaultValue={property.externalLink} placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic" />
             </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4">Zuständige Mitarbeiter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMembers.map(member => (
                <label key={member.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all group">
                  <input type="checkbox" name="assignedMemberIds" value={member.id} defaultChecked={assignedIds.includes(member.id)} className="w-5 h-5 rounded text-primary" />
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-black/5">
                    <img src={member.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-secondary italic leading-none">{member.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{member.position}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4">Bildergalerie verwalten</h2>
            
            {/* Existing Images */}
            {property.images && property.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.images.map((img: any) => (
                  <div key={img.id} className="aspect-square rounded-2xl overflow-hidden border border-black/5 relative group">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => handleDeleteExistingImage(img.id)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                      <Trash2 size={14} />
                    </button>
                    {img.url === property.imageUrl && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-[8px] font-black uppercase rounded-md shadow-lg">
                        Hauptbild
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* New Image Upload */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">Weitere Bilder hinzufügen</label>
              <div className="space-y-6">
                <div className="group relative flex flex-col items-center justify-center w-full min-h-[150px] border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 hover:bg-slate-100/50 hover:border-primary/30 transition-all cursor-pointer overflow-hidden">
                  <div className="flex flex-col items-center gap-4 text-slate-400">
                    <Plus size={24} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Neue Bilder auswählen</p>
                  </div>
                  <input name="images" type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                </div>

                {previews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previews.map((src, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-black/5 relative group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeNewImage(i)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-8 rounded-[2.5rem] border border-black/5">
            <label className="flex items-center gap-4 cursor-pointer group">
              <input name="isSold" type="checkbox" defaultChecked={property.isSold} className="w-6 h-6 rounded-md text-primary focus:ring-primary border-slate-300 transition-all cursor-pointer" />
              <span className="text-sm font-bold text-secondary italic uppercase group-hover:text-primary transition-colors">Verkauft</span>
            </label>
            <label className="flex items-center gap-4 cursor-pointer group">
              <input name="isReserved" type="checkbox" defaultChecked={property.isReserved} className="w-6 h-6 rounded-md text-primary focus:ring-primary border-slate-300 transition-all cursor-pointer" />
              <span className="text-sm font-bold text-secondary italic uppercase group-hover:text-primary transition-colors">Reserviert</span>
            </label>
            <label className="flex items-center gap-4 cursor-pointer group">
              <input name="isRented" type="checkbox" defaultChecked={property.isRented} className="w-6 h-6 rounded-md text-primary focus:ring-primary border-slate-300 transition-all cursor-pointer" />
              <span className="text-sm font-bold text-secondary italic uppercase group-hover:text-primary transition-colors">Vermietet</span>
            </label>
          </div>

          <button type="submit" disabled={isPending} className="w-full btn-primary py-6 text-xl flex items-center justify-center gap-4 uppercase italic font-black">
            <Send size={24} /> {isPending ? "Speichern..." : "Änderungen speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}
