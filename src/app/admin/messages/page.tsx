import { prisma } from "@/lib/prisma";
import { Mail, Clock, Trash2, CheckCircle2, Phone, User } from "lucide-react";
import { deleteMessage, markAsRead } from "@/app/actions/messages";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactRequest.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-secondary italic uppercase mb-2">Nachrichten</h1>
          <p className="text-slate-400 font-medium">Alle eingegangenen Anfragen über das Kontaktformular.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {messages.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-black/5 flex flex-col items-center gap-4 opacity-30">
             <Mail size={64} />
             <p className="font-bold italic">Noch keine Nachrichten eingegangen.</p>
          </div>
        ) : (
          messages.map((msg: any) => (
            <div key={msg.id} className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-black/5 hover:shadow-xl transition-all group flex flex-col md:flex-row gap-8">
              <div className="flex-grow space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${msg.status === 'NEU' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {msg.status === 'NEU' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                    {msg.status}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{new Date(msg.createdAt).toLocaleString('de-DE')}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-secondary">
                    <User size={18} className="text-primary" />
                    <span className="font-black italic text-lg">{msg.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Mail size={18} />
                    <a href={`mailto:${msg.email}`} className="text-sm hover:text-primary transition-colors">{msg.email}</a>
                  </div>
                  {msg.phone && (
                    <div className="flex items-center gap-3 text-slate-500">
                      <Phone size={18} />
                      <a href={`tel:${msg.phone}`} className="text-sm hover:text-primary transition-colors">{msg.phone}</a>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-secondary italic leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>

              <div className="flex md:flex-col justify-end gap-2 shrink-0">
                <form action={async () => {
                  "use server";
                  await markAsRead(msg.id);
                }}>
                  <button type="submit" className={`p-4 rounded-2xl transition-all shadow-sm flex items-center justify-center ${msg.status === 'GELESEN' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-primary hover:text-white'}`}>
                    <CheckCircle2 size={24} />
                  </button>
                </form>
                
                <form action={async () => {
                  "use server";
                  await deleteMessage(msg.id);
                }}>
                  <button type="submit" className="p-4 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center">
                    <Trash2 size={24} />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
