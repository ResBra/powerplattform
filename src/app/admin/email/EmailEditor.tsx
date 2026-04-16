"use client";

import { useState } from "react";
import { updateEmailTemplate } from "@/app/actions/email";
import TipTapEditor from "./TipTapEditor";
import { 
  Save, 
  Mail, 
  Image as ImageIcon, 
  Plus, 
  X, 
  CheckCircle2, 
  Info,
  Smartphone,
  CheckCircle,
  Eye,
  Settings
} from "lucide-react";
import { useRouter } from "next/navigation";

interface EmailTemplate {
  id: string;
  subject: string;
  content: string;
  bannerUrl: string | null;
}

interface EmailEditorProps {
  template: EmailTemplate;
}

export default function EmailEditor({ template }: EmailEditorProps) {
  const [content, setContent] = useState(template.content);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [previewBanner, setPreviewBanner] = useState(template.bannerUrl);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set("content", content); // Manually inject Tiptap HTML content

    const result = await updateEmailTemplate(formData);

    setMessage({ success: result.success, text: result.message });
    setIsPending(false);
    if (result.success) router.refresh();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewBanner(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      
      {/* 1. EDITOR FORM (Column 1 & 2) */}
      <div className="lg:col-span-2 space-y-10">
        <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-xl border border-black/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
              <Mail size={18} /> E-Mail Bestätigung bearbeiten
            </h2>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">E-Mail Betreffzeile</label>
              <input 
                required 
                name="subject" 
                type="text" 
                defaultValue={template.subject} 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic text-secondary" 
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Textinhalt (Rich Editor)</label>
              <TipTapEditor content={content} onChange={setContent} />
            </div>

            <div className="space-y-6 pt-10 border-t border-black/5">
              <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-3">
                <ImageIcon size={18} className="text-primary" /> E-Mail Banner (Footer Branding)
              </h3>
              
              <div className="relative group min-h-[150px] border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-100 hover:border-primary/30 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-6 text-slate-400">
                {previewBanner ? (
                  <img src={previewBanner} alt="Banner Preview" className="max-h-[100px] object-contain mb-4 rounded-lg shadow-sm" />
                ) : (
                  <Plus size={32} className="mb-2" />
                )}
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Banner hochladen (JPG/PNG)</p>
                <input name="banner" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full btn-primary py-6 text-xl flex items-center justify-center gap-4 italic font-black uppercase shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all"
            >
              <Save size={24} />
              {isPending ? "Speichern..." : "Vorlage jetzt live schalten"}
            </button>
          </form>
        </div>
      </div>

      {/* 2. REAL-TIME PREVIEW (Column 3) */}
      <div className="space-y-8 h-fit lg:sticky lg:top-12">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
          <Smartphone size={18} /> Live Vorschau
        </h2>

        <div className="bg-slate-900 rounded-[3rem] p-4 shadow-2xl border-[12px] border-slate-800 relative overflow-hidden aspect-[9/16] w-full max-w-[320px] mx-auto flex flex-col">
          {/* Email UI Header */}
          <div className="bg-slate-100/5 p-4 rounded-2xl mb-4 border border-white/5">
             <div className="w-20 h-2 bg-white/10 rounded-full mb-2"></div>
             <div className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1 truncate">
               Von: Power Platform Team
             </div>
             <div className="text-[10px] font-black text-white italic truncate">
               Betreff: {template.subject || "..."}
             </div>
          </div>

          {/* Email Content */}
          <div className="bg-white rounded-2xl flex-grow overflow-y-auto p-6 flex flex-col">
             <img src="/logo_light.png" className="h-4 w-auto object-contain mx-auto brightness-0 opacity-20 mb-6" alt="" />
             
             <div 
               className="prose prose-sm text-secondary italic font-medium mb-10 text-[9px] leading-relaxed" 
               dangerouslySetInnerHTML={{ __html: content }}
             />

             {previewBanner && (
               <div className="mt-auto border-t border-slate-100 pt-4 flex flex-col items-center">
                 <img src={previewBanner} alt="" className="w-full h-auto rounded-lg mb-2 grayscale opacity-80" />
                 <p className="text-[6px] text-slate-300 font-bold uppercase tracking-[0.2em]">Partner für Haus & Hof</p>
               </div>
             )}
          </div>
          
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-bl-[4rem] -mr-12 -mt-12 blur-3xl"></div>
        </div>

        <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20 flex gap-4">
           <Info className="text-primary shrink-0" size={20} />
           <p className="text-[10px] text-slate-500 font-medium italic">Änderungen werden sofort für alle neuen Kontaktanfragen übernommen. Testen Sie Ihre Vorlage anschließend über das öffentliche Kontaktformular.</p>
        </div>
      </div>

      {/* Persistence Message */}
      {message && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 p-6 rounded-3xl text-center font-bold italic z-[100] shadow-2xl animate-in fade-in zoom-in duration-300 flex items-center gap-4 ${message.success ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          <CheckCircle size={24} />
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-4 hover:scale-125 transition-transform"><X size={18} /></button>
        </div>
      )}

    </div>
  );
}
