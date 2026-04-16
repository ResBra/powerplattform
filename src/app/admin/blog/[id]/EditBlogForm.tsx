"use client";

import { useState } from "react";
import { updateBlogPost } from "@/app/actions/blog";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Image as ImageIcon, Type, FileText, X, Plus } from "lucide-react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

export default function EditBlogForm({ post }: { post: any }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(post.imageUrl);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    try {
      let finalImageUrl = post.imageUrl;

      // 1. Client-side upload if new file is selected
      if (selectedFile) {
        try {
          const newBlob = await upload(selectedFile.name, selectedFile, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          });
          finalImageUrl = newBlob.url;
        } catch (uploadErr: any) {
          throw new Error("Bilder-Upload fehlgeschlagen: " + (uploadErr.message || "Unbekannter Fehler"));
        }
      }

      // 2. Prepare for server action
      formData.delete("image");
      if (selectedFile) {
        formData.append("imageUrl", finalImageUrl);
      }

      const result = await updateBlogPost(post.id, formData);
      if (result.success) {
        router.push("/admin/blog");
        router.refresh();
      } else {
        setError(result.message || "Ein unbekannter Fehler ist aufgetreten.");
        setIsPending(false);
      }
    } catch (err: any) {
      console.error("News Update Error:", err);
      setError(err.message || "Verbindung zum Server fehlgeschlagen.");
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col gap-6">
        <Link href="/admin/blog" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> Zurück zur Liste
        </Link>
        <h1 className="text-4xl font-black text-secondary italic uppercase mb-2">Beitrag <span className="text-primary italic">Bearbeiten.</span></h1>
      </div>

      <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-black/5 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-10 -mt-10"></div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">
              <Type size={16} className="text-primary" /> Titel des Beitrags
            </label>
            <input 
              required 
              name="title" 
              type="text" 
              defaultValue={post.title} 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic text-secondary" 
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">
              <ImageIcon size={16} className="text-primary" /> Titelbild aktualisieren
            </label>
            
            <div className={`group relative flex flex-col items-center justify-center w-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 hover:bg-slate-100/50 hover:border-primary/30 transition-all cursor-pointer overflow-hidden ${imagePreview ? 'border-solid' : ''}`}>
               {imagePreview ? (
                  <div className="absolute inset-0 w-full h-full">
                     <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button type="button" onClick={removeImage} className="p-4 bg-red-500 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                           <X size={24} />
                        </button>
                     </div>
                  </div>
               ) : (
                  <div className="flex flex-col items-center gap-6 text-slate-400 p-10 text-center">
                     <div className="w-20 h-20 bg-white rounded-3xl shadow-md flex items-center justify-center group-hover:scale-110 transition-transform text-primary/30">
                        <Plus size={40} />
                     </div>
                     <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest text-secondary">Neues Bild wählen</p>
                        <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Klicken oder hierher ziehen</p>
                     </div>
                  </div>
               )}
               <input name="image" type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">
              <FileText size={16} className="text-primary" /> Inhalt des Artikels
            </label>
            <textarea 
              required 
              name="content" 
              rows={15} 
              defaultValue={post.content}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-10 py-10 focus:ring-4 focus:ring-primary/10 outline-none font-medium leading-relaxed resize-none font-serif text-lg text-secondary"
            ></textarea>
          </div>

          <div className="flex items-center gap-8 bg-slate-50 p-8 rounded-3xl border border-slate-100">
             <label className="flex items-center gap-4 cursor-pointer group">
                <input 
                  name="published" 
                  type="checkbox" 
                  defaultChecked={post.published} 
                  className="w-6 h-6 rounded-lg text-primary focus:ring-primary border-slate-300 transition-all cursor-pointer" 
                />
                <span className="text-sm font-black text-secondary uppercase italic group-hover:text-primary transition-colors">Beitrag veröffentlicht</span>
             </label>
          </div>

          {error && (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-bold italic flex items-center gap-3">
              <X className="shrink-0" />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isPending} 
            className="w-full btn-primary py-7 text-xl flex items-center justify-center gap-4 uppercase italic font-black disabled:opacity-50 disabled:grayscale"
          >
            <Send size={24} /> {isPending ? "Speichere Änderungen..." : "Änderungen speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}
